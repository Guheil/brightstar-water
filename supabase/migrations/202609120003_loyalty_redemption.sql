-- Thesis-aligned loyalty redemption.
-- One point is worth one peso and may reduce merchandise only.
-- Bonus-point computation remains unchanged/disabled until its exact thesis formula is confirmed.

alter table public.orders
  add column if not exists loyalty_points_redeemed integer not null default 0,
  add column if not exists loyalty_redeemed_at timestamptz null,
  add column if not exists loyalty_redemption_restored_at timestamptz null;

alter table public.orders drop constraint if exists orders_loyalty_points_redeemed_check;
alter table public.orders add constraint orders_loyalty_points_redeemed_check
  check (loyalty_points_redeemed >= 0);

alter table public.orders drop constraint if exists orders_loyalty_redemption_math;
alter table public.orders add constraint orders_loyalty_redemption_math
  check (
    loyalty_discount_centavos = loyalty_points_redeemed::bigint * 100
    and loyalty_discount_centavos <= subtotal_centavos
  );

alter table public.orders drop constraint if exists orders_loyalty_redemption_timestamps;
alter table public.orders add constraint orders_loyalty_redemption_timestamps
  check (
    (loyalty_points_redeemed = 0 and loyalty_redeemed_at is null and loyalty_redemption_restored_at is null)
    or
    (loyalty_points_redeemed > 0 and loyalty_redeemed_at is not null)
  );

alter table public.loyalty_activity drop constraint if exists loyalty_activity_activity_type_check;
alter table public.loyalty_activity add constraint loyalty_activity_activity_type_check
  check (activity_type in ('earned','redeemed','restored','manual_credit','manual_debit'));

alter table public.order_events drop constraint if exists order_events_event_type_check;
alter table public.order_events add constraint order_events_event_type_check
  check (event_type in (
    'placed','confirmed','preparation_started','delivery_assigned','delivery_accepted','out_for_delivery','delivered','delivery_failed',
    'cancellation_requested','cancellation_approved','cancellation_rejected','payment_verified','refund_updated','inventory_reserved',
    'inventory_released','inventory_committed','loyalty_awarded','loyalty_redeemed','loyalty_restored'
  ));

create unique index if not exists loyalty_activity_order_redemption_once_idx
  on public.loyalty_activity (order_id, activity_type)
  where order_id is not null and activity_type in ('redeemed','restored');

comment on column public.orders.loyalty_points_redeemed is
  'Number of available loyalty points spent when the order was placed. One point equals one peso.';
comment on column public.orders.loyalty_qualifying_subtotal_centavos is
  'Merchandise spend remaining after loyalty redemption and used to calculate points pending for this order.';

create or replace function private.restore_order_loyalty_redemption(
  p_order_id uuid,
  p_reason text default null
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_reason text;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found or v_order.loyalty_points_redeemed <= 0 then
    return 0;
  end if;

  if v_order.loyalty_redemption_restored_at is not null then
    return 0;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_order.customer_id::text, 84322));
  v_reason := private.order_clean_text(p_reason, 500);

  insert into public.loyalty_accounts(customer_id, points_available, updated_at)
  values(v_order.customer_id, v_order.loyalty_points_redeemed, now())
  on conflict(customer_id) do update
    set points_available = public.loyalty_accounts.points_available + excluded.points_available,
        updated_at = now();

  insert into public.loyalty_activity(customer_id, activity_type, points, description, order_id, reason)
  values(
    v_order.customer_id,
    'restored',
    v_order.loyalty_points_redeemed,
    v_order.loyalty_points_redeemed::text || ' points restored from ' || v_order.reference || '.',
    v_order.id,
    v_reason
  );

  update public.orders
  set loyalty_redemption_restored_at = now(),
      updated_at = now()
  where id = v_order.id;

  perform private.add_order_event(
    v_order.id,
    'loyalty_restored',
    v_order.loyalty_points_redeemed::text || ' loyalty points restored',
    'system',
    null,
    v_reason
  );

  return v_order.loyalty_points_redeemed;
end;
$$;
revoke all on function private.restore_order_loyalty_redemption(uuid,text)
  from public, anon, authenticated, service_role;

-- New order wrapper. It reuses the existing proven order transaction and GCash
-- settings lock, then applies loyalty redemption in the same PostgreSQL transaction.
create or replace function public.customer_place_order_with_payment_settings(
  p_actor_id uuid,
  p_items jsonb,
  p_address_id uuid,
  p_schedule jsonb,
  p_payment_method text,
  p_payment_proof_path text,
  p_gcash_settings_version bigint,
  p_requested_loyalty_points integer,
  p_loyalty_points_available_snapshot integer,
  p_customer_note text,
  p_idempotency_key uuid,
  p_request_id uuid,
  p_client_ip text default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_existing uuid;
  v_order_id uuid;
  v_order public.orders;
  v_current_points integer := 0;
  v_requested_points integer := coalesce(p_requested_loyalty_points, 0);
  v_max_points integer := 0;
  v_discount bigint := 0;
  v_net_merchandise bigint := 0;
  v_points_pending integer := 0;
  v_new_total bigint := 0;
begin
  v_actor := private.assert_operational_actor(p_actor_id, 'customer'::public.user_role);
  if p_request_id is null or p_idempotency_key is null then raise exception 'Invalid request'; end if;
  if v_requested_points < 0 or v_requested_points > 100000 then raise exception 'Invalid loyalty points'; end if;
  if v_requested_points = 0 and p_loyalty_points_available_snapshot is not null then
    raise exception 'Invalid loyalty balance snapshot';
  end if;
  if v_requested_points > 0 and (p_loyalty_points_available_snapshot is null or p_loyalty_points_available_snapshot < 0) then
    raise exception 'Current loyalty balance is required';
  end if;

  -- Preserve the existing idempotency contract. A retry of a successful request
  -- returns the original order without spending points a second time.
  select id into v_existing
  from public.orders
  where customer_id = p_actor_id and idempotency_key = p_idempotency_key;
  if found then return v_existing; end if;

  v_order_id := public.customer_place_order_with_payment_settings(
    p_actor_id,
    p_items,
    p_address_id,
    p_schedule,
    p_payment_method,
    p_payment_proof_path,
    p_gcash_settings_version,
    p_customer_note,
    p_idempotency_key,
    p_request_id,
    p_client_ip,
    p_user_agent
  );

  select * into v_order
  from public.orders
  where id = v_order_id and customer_id = p_actor_id
  for update;
  if not found then raise exception 'Order not found'; end if;

  if v_requested_points > 0 then
    perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text, 84322));

    select points_available into v_current_points
    from public.loyalty_accounts
    where customer_id = p_actor_id
    for update;
    if not found then v_current_points := 0; end if;

    -- The snapshot is only a stale-view guard. The server still derives and
    -- validates the real balance from the locked database row.
    if v_current_points <> p_loyalty_points_available_snapshot then
      raise exception 'Loyalty balance changed. Review your available points before placing the order';
    end if;
    if v_requested_points > v_current_points then
      raise exception 'Loyalty balance changed. Review your available points before placing the order';
    end if;

    v_max_points := floor(v_order.subtotal_centavos / 100.0)::integer;
    if v_requested_points > v_max_points then
      raise exception 'Loyalty points cannot exceed the merchandise subtotal';
    end if;

    v_discount := v_requested_points::bigint * 100;
    v_net_merchandise := v_order.subtotal_centavos - v_discount;
    v_points_pending := private.order_loyalty_points(v_net_merchandise);
    v_new_total := v_net_merchandise + v_order.delivery_fee_centavos;

    if p_payment_method = 'gcash' and v_new_total = 0 then
      raise exception 'GCash is not needed when loyalty points cover the full payable amount. Choose cash on delivery';
    end if;

    update public.loyalty_accounts
    set points_available = points_available - v_requested_points,
        updated_at = now()
    where customer_id = p_actor_id;

    insert into public.loyalty_activity(customer_id, activity_type, points, description, order_id)
    values(
      p_actor_id,
      'redeemed',
      v_requested_points,
      v_requested_points::text || ' points redeemed on ' || v_order.reference || '.',
      v_order.id
    );

    update public.orders
    set loyalty_points_redeemed = v_requested_points,
        loyalty_discount_centavos = v_discount,
        total_centavos = v_new_total,
        loyalty_qualifying_subtotal_centavos = v_net_merchandise,
        loyalty_points_pending = v_points_pending,
        loyalty_redeemed_at = now(),
        updated_at = now()
    where id = v_order.id;

    update public.payments
    set amount_centavos = v_new_total,
        updated_at = now()
    where order_id = v_order.id;

    update public.deliveries
    set amount_to_collect_centavos = case when payment_method = 'cod' then v_new_total else 0 end,
        updated_at = now()
    where order_id = v_order.id;

    perform private.add_order_event(
      v_order.id,
      'loyalty_redeemed',
      v_requested_points::text || ' loyalty points redeemed',
      'customer',
      p_actor_id,
      'Loyalty discount applied before payment.'
    );

    perform private.write_audit_event(
      'loyalty.redeemed',
      'loyalty',
      'success',
      v_actor.full_name || ' redeemed loyalty points on ' || v_order.reference || '.',
      p_actor_id,
      v_actor.full_name,
      'customer',
      'order',
      v_order.id,
      v_order.reference,
      jsonb_build_object(
        'points_redeemed', v_requested_points,
        'loyalty_discount_centavos', v_discount,
        'total_before_centavos', v_order.total_centavos,
        'total_after_centavos', v_new_total
      ),
      '{}'::jsonb,
      null,
      p_request_id,
      'customer_portal',
      p_client_ip,
      p_user_agent
    );
  end if;

  return v_order_id;
end;
$$;

revoke all on function public.customer_place_order_with_payment_settings(uuid,jsonb,uuid,jsonb,text,text,bigint,integer,integer,text,uuid,uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.customer_place_order_with_payment_settings(uuid,jsonb,uuid,jsonb,text,text,bigint,integer,integer,text,uuid,uuid,text,text)
  to service_role;

-- Keep browser/server call sites on the redemption-aware wrapper. The older
-- service-role entry point remains callable by its owner for the wrapper above.
revoke execute on function public.customer_place_order_with_payment_settings(uuid,jsonb,uuid,jsonb,text,text,bigint,text,uuid,uuid,text,text)
  from service_role;

-- Cancellation approval releases reserved stock and returns any points spent on
-- the order exactly once. Historical order/payment totals stay discounted.
create or replace function public.admin_resolve_order_cancellation(
  p_actor_id uuid,p_order_id uuid,p_decision text,p_note text,p_request_id uuid,p_client_ip text default null,p_user_agent text default null
)
returns void language plpgsql security definer set search_path='' as $$
declare
  v_actor public.profiles;
  v_order public.orders;
  v_cancel public.order_cancellations;
  v_payment public.payments;
  v_note text;
  v_restored integer := 0;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'admin'::public.user_role);
  if p_decision not in ('approve','reject') then raise exception 'Invalid decision'; end if;
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  select * into v_cancel from public.order_cancellations where order_id=p_order_id and status='requested' for update;
  if not found then raise exception 'Cancellation request not found'; end if;
  v_note:=private.order_clean_text(p_note,500);

  if p_decision='approve' then
    if v_order.status not in ('pending_review','confirmed','preparing','assigned_for_delivery') then raise exception 'Order can no longer be cancelled'; end if;
    if v_order.inventory_reservation_status='reserved' then
      perform private.release_order_inventory(p_order_id,p_actor_id,v_order.reference);
    end if;

    v_restored := private.restore_order_loyalty_redemption(
      p_order_id,
      'Restored after approved cancellation of ' || v_order.reference || '.'
    );

    update public.orders
    set status='cancelled',
        inventory_reservation_status='released',
        loyalty_points_pending=0,
        updated_at=now()
    where id=p_order_id;
    update public.deliveries set status='cancelled',updated_at=now() where order_id=p_order_id and status in ('unassigned','assigned','accepted');
    select * into v_payment from public.payments where order_id=p_order_id for update;
    if v_payment.status in ('collection_due','awaiting_verification') then
      update public.payments set status='cancelled',updated_at=now() where id=v_payment.id;
    elsif v_payment.status in ('verified','paid') then
      insert into public.refunds(order_id,payment_id,amount_centavos,status,reason)
      values(p_order_id,v_payment.id,v_payment.amount_centavos,'pending','Approved order cancellation.')
      on conflict(order_id) do nothing;
    end if;
    update public.order_cancellations set status='approved',reviewed_at=now(),reviewed_by=p_actor_id,review_note=v_note where id=v_cancel.id;
    perform private.add_order_event(p_order_id,'cancellation_approved','Cancellation approved','admin',p_actor_id,v_note);
    perform private.add_order_event(p_order_id,'inventory_released','Reserved stock released','system',null,null);
  else
    update public.order_cancellations set status='rejected',reviewed_at=now(),reviewed_by=p_actor_id,review_note=v_note where id=v_cancel.id;
    perform private.add_order_event(p_order_id,'cancellation_rejected','Cancellation rejected','admin',p_actor_id,v_note);
  end if;

  perform private.write_audit_event(
    'order.cancellation_' || case when p_decision='approve' then 'approved' else 'rejected' end,
    'orders','success',
    v_actor.full_name || ' ' || case when p_decision='approve' then 'approved' else 'rejected' end || ' cancellation for ' || v_order.reference || '.',
    p_actor_id,v_actor.full_name,'admin','order',p_order_id,v_order.reference,
    jsonb_build_object('decision',p_decision,'loyalty_points_restored',v_restored),
    '{}'::jsonb,v_note,p_request_id,'admin_portal',p_client_ip,p_user_agent
  );
end; $$;
revoke all on function public.admin_resolve_order_cancellation(uuid,uuid,text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_resolve_order_cancellation(uuid,uuid,text,text,uuid,text,text) to service_role;

-- Failed delivery is terminal in the current workflow, so pending earned points are
-- cleared and previously redeemed points are restored exactly once.
create or replace function public.deliverer_fail_order_delivery(
  p_actor_id uuid,p_delivery_id uuid,p_reason text,p_note text,p_request_id uuid,p_client_ip text default null,p_user_agent text default null
)
returns void language plpgsql security definer set search_path='' as $$
declare
  v_actor public.profiles;
  v_delivery public.deliveries;
  v_order public.orders;
  v_note text;
  v_restored integer := 0;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'deliverer'::public.user_role);
  if p_reason not in ('customer_unavailable','incorrect_address','customer_requested_reschedule','payment_issue','other') then raise exception 'Invalid failure reason'; end if;
  select * into v_delivery from public.deliveries where id=p_delivery_id and deliverer_id=p_actor_id for update;
  if not found then raise exception 'Delivery not found'; end if;
  if v_delivery.status<>'out_for_delivery' then raise exception 'Invalid delivery transition'; end if;
  select * into v_order from public.orders where id=v_delivery.order_id for update;
  if not found or v_order.status<>'out_for_delivery' then raise exception 'Invalid order transition'; end if;
  v_note:=private.order_clean_text(p_note,500);

  v_restored := private.restore_order_loyalty_redemption(
    v_order.id,
    'Restored after failed delivery of ' || v_order.reference || '.'
  );

  update public.deliveries
  set status='failed',failure_reason=p_reason,failure_note=v_note,failure_reported_at=now(),failure_reported_by=p_actor_id,updated_at=now()
  where id=p_delivery_id;
  update public.orders set status='delivery_failed',loyalty_points_pending=0,updated_at=now() where id=v_order.id;
  perform private.add_order_event(v_order.id,'delivery_failed','Delivery failed','deliverer',p_actor_id,coalesce(v_note,'The failed delivery requires Admin review.'));
  perform private.write_audit_event(
    'delivery.failed','deliveries','success',
    v_actor.full_name || ' reported failed delivery for ' || v_order.reference || '.',
    p_actor_id,v_actor.full_name,'deliverer','delivery',p_delivery_id,v_order.reference,
    jsonb_build_object('status','failed','reason',p_reason,'loyalty_points_restored',v_restored),
    '{}'::jsonb,v_note,p_request_id,'deliverer_portal',p_client_ip,p_user_agent
  );
end; $$;
revoke all on function public.deliverer_fail_order_delivery(uuid,uuid,text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.deliverer_fail_order_delivery(uuid,uuid,text,text,uuid,text,text) to service_role;
