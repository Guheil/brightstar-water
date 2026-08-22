-- Admin fulfillment/payment/cancellation/refund operations and authenticated Deliverer transitions.

create or replace function private.release_order_inventory(p_order_id uuid, p_actor_id uuid, p_reference text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_res record;
  v_inv public.inventory_items;
begin
  for v_res in
    select r.product_id,r.quantity
    from public.order_inventory_reservations r
    where r.order_id=p_order_id and r.status='reserved'
    order by r.product_id
    for update
  loop
    select * into v_inv from public.inventory_items where product_id=v_res.product_id for update;
    if not found or v_inv.stock_reserved < v_res.quantity then raise exception 'Inventory reservation is inconsistent'; end if;
    update public.inventory_items set stock_reserved=stock_reserved-v_res.quantity,updated_at=now() where product_id=v_res.product_id;
    update public.order_inventory_reservations set status='released',settled_at=now() where order_id=p_order_id and product_id=v_res.product_id;
    insert into public.inventory_adjustments(
      product_id,mode,quantity,stock_on_hand_before,stock_on_hand_after,stock_reserved_before,stock_reserved_after,source,reason,actor_id
    ) values (
      v_res.product_id,'release',v_res.quantity,v_inv.stock_on_hand,v_inv.stock_on_hand,v_inv.stock_reserved,v_inv.stock_reserved-v_res.quantity,
      'order_release','Released by cancelled order ' || p_reference || '.',p_actor_id
    );
  end loop;
end;
$$;
revoke all on function private.release_order_inventory(uuid,uuid,text) from public,anon,authenticated,service_role;

create or replace function private.commit_order_inventory(p_order_id uuid, p_actor_id uuid, p_reference text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_res record;
  v_inv public.inventory_items;
begin
  for v_res in
    select r.product_id,r.quantity
    from public.order_inventory_reservations r
    where r.order_id=p_order_id and r.status='reserved'
    order by r.product_id
    for update
  loop
    select * into v_inv from public.inventory_items where product_id=v_res.product_id for update;
    if not found or v_inv.stock_reserved < v_res.quantity or v_inv.stock_on_hand < v_res.quantity then
      raise exception 'Inventory reservation is inconsistent';
    end if;
    update public.inventory_items
    set stock_on_hand=stock_on_hand-v_res.quantity,stock_reserved=stock_reserved-v_res.quantity,updated_at=now()
    where product_id=v_res.product_id;
    update public.order_inventory_reservations set status='committed',settled_at=now() where order_id=p_order_id and product_id=v_res.product_id;
    insert into public.inventory_adjustments(
      product_id,mode,quantity,stock_on_hand_before,stock_on_hand_after,stock_reserved_before,stock_reserved_after,source,reason,actor_id
    ) values (
      v_res.product_id,'commit',v_res.quantity,v_inv.stock_on_hand,v_inv.stock_on_hand-v_res.quantity,v_inv.stock_reserved,v_inv.stock_reserved-v_res.quantity,
      'order_commit','Committed by delivered order ' || p_reference || '.',p_actor_id
    );
  end loop;
end;
$$;
revoke all on function private.commit_order_inventory(uuid,uuid,text) from public,anon,authenticated,service_role;

create or replace function public.admin_confirm_order(p_actor_id uuid,p_order_id uuid,p_request_id uuid,p_client_ip text default null,p_user_agent text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_order public.orders;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'admin'::public.user_role);
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status<>'pending_review' then raise exception 'Invalid order transition'; end if;
  update public.orders set status='confirmed',updated_at=now() where id=p_order_id;
  perform private.add_order_event(p_order_id,'confirmed','Order confirmed','admin',p_actor_id,null);
  perform private.write_audit_event('order.confirmed','orders','success',v_actor.full_name || ' confirmed ' || v_order.reference || '.',p_actor_id,v_actor.full_name,'admin','order',p_order_id,v_order.reference,jsonb_build_object('from','pending_review','to','confirmed'),'{}'::jsonb,null,p_request_id,'admin_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.admin_confirm_order(uuid,uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_confirm_order(uuid,uuid,uuid,text,text) to service_role;

create or replace function public.admin_start_order_preparation(p_actor_id uuid,p_order_id uuid,p_request_id uuid,p_client_ip text default null,p_user_agent text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_order public.orders;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'admin'::public.user_role);
  select * into v_order from public.orders where id=p_order_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status<>'confirmed' then raise exception 'Invalid order transition'; end if;
  update public.orders set status='preparing',updated_at=now() where id=p_order_id;
  perform private.add_order_event(p_order_id,'preparation_started','Preparation started','admin',p_actor_id,null);
  perform private.write_audit_event('order.preparation_started','orders','success',v_actor.full_name || ' started preparing ' || v_order.reference || '.',p_actor_id,v_actor.full_name,'admin','order',p_order_id,v_order.reference,jsonb_build_object('from','confirmed','to','preparing'),'{}'::jsonb,null,p_request_id,'admin_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.admin_start_order_preparation(uuid,uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_start_order_preparation(uuid,uuid,uuid,text,text) to service_role;

create or replace function public.admin_assign_order_delivery(p_actor_id uuid,p_order_id uuid,p_deliverer_id uuid,p_request_id uuid,p_client_ip text default null,p_user_agent text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_deliverer public.profiles; v_order public.orders; v_delivery public.deliveries;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'admin'::public.user_role);
  v_deliverer:=private.assert_operational_actor(p_deliverer_id,'deliverer'::public.user_role);
  select * into v_order from public.orders where id=p_order_id for update;
  if not found or v_order.status not in ('confirmed','preparing','assigned_for_delivery') then raise exception 'Order cannot be assigned'; end if;
  select * into v_delivery from public.deliveries where order_id=p_order_id for update;
  if not found or v_delivery.status not in ('unassigned','assigned','accepted') then raise exception 'Delivery cannot be assigned'; end if;
  update public.deliveries set deliverer_id=p_deliverer_id,status='assigned',assigned_at=now(),accepted_at=null,updated_at=now() where id=v_delivery.id;
  update public.orders set status='assigned_for_delivery',updated_at=now() where id=p_order_id;
  perform private.add_order_event(p_order_id,'delivery_assigned',v_deliverer.full_name || ' assigned','admin',p_actor_id,case when v_delivery.deliverer_id is null then null else 'The delivery was reassigned before departure.' end);
  perform private.write_audit_event('delivery.assigned','deliveries','success',v_actor.full_name || ' assigned ' || v_order.reference || ' to ' || v_deliverer.full_name || '.',p_actor_id,v_actor.full_name,'admin','delivery',v_delivery.id,v_order.reference,jsonb_build_object('deliverer_id',p_deliverer_id,'status','assigned'),'{}'::jsonb,null,p_request_id,'admin_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.admin_assign_order_delivery(uuid,uuid,uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_assign_order_delivery(uuid,uuid,uuid,uuid,text,text) to service_role;

create or replace function public.admin_verify_order_payment(p_actor_id uuid,p_order_id uuid,p_reference text,p_request_id uuid,p_client_ip text default null,p_user_agent text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_order public.orders; v_payment public.payments; v_reference text;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'admin'::public.user_role);
  select * into v_order from public.orders where id=p_order_id;
  if not found then raise exception 'Order not found'; end if;
  select * into v_payment from public.payments where order_id=p_order_id for update;
  if not found or v_payment.method<>'gcash' or v_payment.status<>'awaiting_verification' then raise exception 'Payment cannot be verified'; end if;
  v_reference:=private.order_clean_text(p_reference,120);
  update public.payments set status='verified',reference=v_reference,verified_at=now(),updated_at=now() where id=v_payment.id;
  perform private.add_order_event(p_order_id,'payment_verified','GCash payment verified','admin',p_actor_id,null);
  perform private.write_audit_event('payment.verified','payments','success',v_actor.full_name || ' verified payment for ' || v_order.reference || '.',p_actor_id,v_actor.full_name,'admin','payment',v_payment.id,v_order.reference,jsonb_build_object('from','awaiting_verification','to','verified'),'{}'::jsonb,null,p_request_id,'admin_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.admin_verify_order_payment(uuid,uuid,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_verify_order_payment(uuid,uuid,text,uuid,text,text) to service_role;

create or replace function public.admin_resolve_order_cancellation(p_actor_id uuid,p_order_id uuid,p_decision text,p_note text,p_request_id uuid,p_client_ip text default null,p_user_agent text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_order public.orders; v_cancel public.order_cancellations; v_payment public.payments; v_note text;
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
    update public.orders set status='cancelled',inventory_reservation_status='released',updated_at=now() where id=p_order_id;
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
  perform private.write_audit_event('order.cancellation_' || case when p_decision='approve' then 'approved' else 'rejected' end,'orders','success',v_actor.full_name || ' ' || case when p_decision='approve' then 'approved' else 'rejected' end || ' cancellation for ' || v_order.reference || '.',p_actor_id,v_actor.full_name,'admin','order',p_order_id,v_order.reference,jsonb_build_object('decision',p_decision),'{}'::jsonb,v_note,p_request_id,'admin_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.admin_resolve_order_cancellation(uuid,uuid,text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_resolve_order_cancellation(uuid,uuid,text,text,uuid,text,text) to service_role;

create or replace function public.admin_update_order_refund(p_actor_id uuid,p_order_id uuid,p_target_status text,p_note text,p_request_id uuid,p_client_ip text default null,p_user_agent text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_order public.orders; v_payment public.payments; v_refund public.refunds; v_note text;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'admin'::public.user_role);
  if p_target_status not in ('pending','processing','refunded','rejected') then raise exception 'Invalid refund status'; end if;
  select * into v_order from public.orders where id=p_order_id for update;
  if not found or v_order.status not in ('cancelled','delivery_failed') then raise exception 'Order is not refund eligible'; end if;
  select * into v_payment from public.payments where order_id=p_order_id for update;
  if not found or v_payment.status not in ('verified','paid','refunded') then raise exception 'Payment is not refund eligible'; end if;
  select * into v_refund from public.refunds where order_id=p_order_id for update;
  v_note:=private.order_clean_text(p_note,500);
  if not found then
    if p_target_status<>'pending' then raise exception 'Start the refund before changing its state'; end if;
    insert into public.refunds(order_id,payment_id,amount_centavos,status,reason,resolution_note)
    values(p_order_id,v_payment.id,v_payment.amount_centavos,'pending',case when v_order.status='cancelled' then 'Cancelled order refund.' else 'Failed delivery refund.' end,v_note);
  else
    if (v_refund.status='pending' and p_target_status not in ('processing','rejected')) or
       (v_refund.status='processing' and p_target_status not in ('refunded','rejected')) or
       v_refund.status in ('refunded','rejected') then raise exception 'Invalid refund transition'; end if;
    update public.refunds set status=p_target_status,updated_at=now(),resolved_at=case when p_target_status in ('refunded','rejected') then now() else null end,resolution_note=v_note where id=v_refund.id;
    if p_target_status='refunded' then update public.payments set status='refunded',updated_at=now() where id=v_payment.id; end if;
  end if;
  perform private.add_order_event(p_order_id,'refund_updated','Refund ' || replace(p_target_status,'_',' '),'admin',p_actor_id,v_note);
  perform private.write_audit_event('refund.updated','payments','success',v_actor.full_name || ' updated the refund for ' || v_order.reference || ' to ' || p_target_status || '.',p_actor_id,v_actor.full_name,'admin','order',p_order_id,v_order.reference,jsonb_build_object('status',p_target_status),'{}'::jsonb,v_note,p_request_id,'admin_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.admin_update_order_refund(uuid,uuid,text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.admin_update_order_refund(uuid,uuid,text,text,uuid,text,text) to service_role;

create or replace function public.deliverer_accept_order_delivery(p_actor_id uuid,p_delivery_id uuid,p_request_id uuid,p_client_ip text default null,p_user_agent text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_delivery public.deliveries; v_order public.orders;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'deliverer'::public.user_role);
  select * into v_delivery from public.deliveries where id=p_delivery_id and deliverer_id=p_actor_id for update;
  if not found then raise exception 'Delivery not found'; end if;
  if v_delivery.status<>'assigned' then raise exception 'Invalid delivery transition'; end if;
  select * into v_order from public.orders where id=v_delivery.order_id;
  update public.deliveries set status='accepted',accepted_at=now(),updated_at=now() where id=p_delivery_id;
  perform private.add_order_event(v_order.id,'delivery_accepted','Delivery accepted','deliverer',p_actor_id,null);
  perform private.write_audit_event('delivery.accepted','deliveries','success',v_actor.full_name || ' accepted ' || v_order.reference || '.',p_actor_id,v_actor.full_name,'deliverer','delivery',p_delivery_id,v_order.reference,jsonb_build_object('from','assigned','to','accepted'),'{}'::jsonb,null,p_request_id,'deliverer_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.deliverer_accept_order_delivery(uuid,uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.deliverer_accept_order_delivery(uuid,uuid,uuid,text,text) to service_role;

create or replace function public.deliverer_start_order_delivery(p_actor_id uuid,p_delivery_id uuid,p_request_id uuid,p_client_ip text default null,p_user_agent text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_delivery public.deliveries; v_order public.orders;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'deliverer'::public.user_role);
  select * into v_delivery from public.deliveries where id=p_delivery_id and deliverer_id=p_actor_id for update;
  if not found then raise exception 'Delivery not found'; end if;
  if v_delivery.status not in ('assigned','accepted') then raise exception 'Invalid delivery transition'; end if;
  select * into v_order from public.orders where id=v_delivery.order_id for update;
  if not found or v_order.status<>'assigned_for_delivery' then raise exception 'Order is not ready for delivery'; end if;
  update public.deliveries set status='out_for_delivery',started_at=now(),updated_at=now() where id=p_delivery_id;
  update public.orders set status='out_for_delivery',updated_at=now() where id=v_order.id;
  perform private.add_order_event(v_order.id,'out_for_delivery','Out for delivery','deliverer',p_actor_id,null);
  perform private.write_audit_event('delivery.started','deliveries','success',v_actor.full_name || ' started delivery for ' || v_order.reference || '.',p_actor_id,v_actor.full_name,'deliverer','delivery',p_delivery_id,v_order.reference,jsonb_build_object('status','out_for_delivery'),'{}'::jsonb,null,p_request_id,'deliverer_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.deliverer_start_order_delivery(uuid,uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.deliverer_start_order_delivery(uuid,uuid,uuid,text,text) to service_role;

create or replace function public.deliverer_complete_order_delivery(
  p_actor_id uuid,p_delivery_id uuid,p_cash_received_centavos bigint,p_proof_path text,p_note text,p_request_id uuid,p_client_ip text default null,p_user_agent text default null
)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_delivery public.deliveries; v_order public.orders; v_payment public.payments; v_points integer; v_note text;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'deliverer'::public.user_role);
  select * into v_delivery from public.deliveries where id=p_delivery_id and deliverer_id=p_actor_id for update;
  if not found then raise exception 'Delivery not found'; end if;
  if v_delivery.status<>'out_for_delivery' then raise exception 'Invalid delivery transition'; end if;
  if p_proof_path is null or p_proof_path !~ ('^deliveries/' || p_actor_id::text || '/[0-9a-f-]{36}[.]webp$') then raise exception 'Delivery proof is required'; end if;
  select * into v_order from public.orders where id=v_delivery.order_id for update;
  if not found or v_order.status<>'out_for_delivery' or v_order.inventory_reservation_status<>'reserved' then raise exception 'Order is not ready for completion'; end if;
  select * into v_payment from public.payments where order_id=v_order.id for update;
  if v_payment.method='gcash' and v_payment.status not in ('verified','paid') then raise exception 'GCash payment must be verified'; end if;
  if v_payment.method='cod' and coalesce(p_cash_received_centavos,-1)<>v_payment.amount_centavos then raise exception 'Exact COD collection is required'; end if;

  perform private.commit_order_inventory(v_order.id,p_actor_id,v_order.reference);
  v_points:=v_order.loyalty_points_pending;
  if v_points>0 then
    insert into public.loyalty_accounts(customer_id,points_available,updated_at)
    values(v_order.customer_id,v_points,now())
    on conflict(customer_id) do update set points_available=public.loyalty_accounts.points_available+excluded.points_available,updated_at=now();
    insert into public.loyalty_activity(customer_id,activity_type,points,description,order_id)
    values(v_order.customer_id,'earned',v_points,'Points earned from delivered order ' || v_order.reference || '.',v_order.id);
  end if;
  v_note:=private.order_clean_text(p_note,500);
  update public.deliveries set status='delivered',completed_at=now(),completion_cash_centavos=case when v_payment.method='cod' then p_cash_received_centavos else null end,completion_proof_path=p_proof_path,completion_note=v_note,completion_recorded_at=now(),completion_recorded_by=p_actor_id,updated_at=now() where id=p_delivery_id;
  update public.orders set status='delivered',inventory_reservation_status='committed',loyalty_points_awarded=loyalty_points_awarded+v_points,loyalty_points_pending=0,loyalty_settled_at=now(),updated_at=now() where id=v_order.id;
  update public.payments set status='paid',paid_at=now(),updated_at=now() where id=v_payment.id;
  perform private.add_order_event(v_order.id,'delivered','Delivery completed','deliverer',p_actor_id,v_note);
  perform private.add_order_event(v_order.id,'inventory_committed','Reserved stock committed','system',null,null);
  if v_points>0 then perform private.add_order_event(v_order.id,'loyalty_awarded',v_points::text || ' loyalty points added','system',null,null); end if;
  perform private.write_audit_event('delivery.completed','deliveries','success',v_actor.full_name || ' completed ' || v_order.reference || '.',p_actor_id,v_actor.full_name,'deliverer','delivery',p_delivery_id,v_order.reference,jsonb_build_object('status','delivered'),'{}'::jsonb,null,p_request_id,'deliverer_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.deliverer_complete_order_delivery(uuid,uuid,bigint,text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.deliverer_complete_order_delivery(uuid,uuid,bigint,text,text,uuid,text,text) to service_role;

create or replace function public.deliverer_fail_order_delivery(p_actor_id uuid,p_delivery_id uuid,p_reason text,p_note text,p_request_id uuid,p_client_ip text default null,p_user_agent text default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor public.profiles; v_delivery public.deliveries; v_order public.orders; v_note text;
begin
  v_actor:=private.assert_operational_actor(p_actor_id,'deliverer'::public.user_role);
  if p_reason not in ('customer_unavailable','incorrect_address','customer_requested_reschedule','payment_issue','other') then raise exception 'Invalid failure reason'; end if;
  select * into v_delivery from public.deliveries where id=p_delivery_id and deliverer_id=p_actor_id for update;
  if not found then raise exception 'Delivery not found'; end if;
  if v_delivery.status<>'out_for_delivery' then raise exception 'Invalid delivery transition'; end if;
  select * into v_order from public.orders where id=v_delivery.order_id for update;
  if not found or v_order.status<>'out_for_delivery' then raise exception 'Invalid order transition'; end if;
  v_note:=private.order_clean_text(p_note,500);
  update public.deliveries set status='failed',failure_reason=p_reason,failure_note=v_note,failure_reported_at=now(),failure_reported_by=p_actor_id,updated_at=now() where id=p_delivery_id;
  update public.orders set status='delivery_failed',updated_at=now() where id=v_order.id;
  perform private.add_order_event(v_order.id,'delivery_failed','Delivery failed','deliverer',p_actor_id,coalesce(v_note,'The failed delivery requires Admin review.'));
  perform private.write_audit_event('delivery.failed','deliveries','success',v_actor.full_name || ' reported failed delivery for ' || v_order.reference || '.',p_actor_id,v_actor.full_name,'deliverer','delivery',p_delivery_id,v_order.reference,jsonb_build_object('status','failed','reason',p_reason),'{}'::jsonb,v_note,p_request_id,'deliverer_portal',p_client_ip,p_user_agent);
end; $$;
revoke all on function public.deliverer_fail_order_delivery(uuid,uuid,text,text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.deliverer_fail_order_delivery(uuid,uuid,text,text,uuid,text,text) to service_role;
