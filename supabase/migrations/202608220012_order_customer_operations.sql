-- Customer order placement and cancellation operations.

create or replace function public.customer_place_order(
  p_actor_id uuid,
  p_items jsonb,
  p_address_id uuid,
  p_schedule jsonb,
  p_payment_method text,
  p_payment_proof_path text,
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
  v_address public.customer_addresses;
  v_existing uuid;
  v_order_id uuid := gen_random_uuid();
  v_payment_id uuid := gen_random_uuid();
  v_delivery_id uuid := gen_random_uuid();
  v_reference text;
  v_item jsonb;
  v_product_id text;
  v_quantity integer;
  v_qty_text text;
  v_sku text;
  v_name text;
  v_store text;
  v_unit text;
  v_price bigint;
  v_stock_on_hand integer;
  v_stock_reserved integer;
  v_subtotal bigint := 0;
  v_delivery_fee bigint;
  v_total bigint;
  v_points integer;
  v_distance double precision;
  v_schedule_mode text;
  v_schedule_date date;
  v_schedule_window text;
  v_estimated_date date;
  v_estimated_window text;
  v_preferred_date date;
  v_preferred_window text;
  v_payment_status text;
  v_note text;
begin
  v_actor := private.assert_operational_actor(p_actor_id, 'customer'::public.user_role);
  if p_request_id is null or p_idempotency_key is null then raise exception 'Invalid request'; end if;

  select id into v_existing from public.orders
  where customer_id = p_actor_id and idempotency_key = p_idempotency_key;
  if found then return v_existing; end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 50 then
    raise exception 'Invalid order items';
  end if;
  if (select count(*) from (select distinct value->>'productId' from jsonb_array_elements(p_items)) q) <> jsonb_array_length(p_items) then
    raise exception 'Duplicate products are not allowed';
  end if;
  if p_payment_method not in ('cod','gcash') then raise exception 'Invalid payment method'; end if;
  if p_payment_method = 'gcash' and (p_payment_proof_path is null or p_payment_proof_path !~ ('^payments/' || p_actor_id::text || '/[0-9a-f-]{36}[.]webp$')) then
    raise exception 'GCash payment proof is required';
  end if;
  if p_payment_method = 'cod' and p_payment_proof_path is not null then raise exception 'Invalid payment proof'; end if;

  select * into v_address
  from public.customer_addresses
  where id = p_address_id and customer_id = p_actor_id
  for share;
  if not found then raise exception 'Address not found'; end if;

  v_distance := private.customer_address_distance_meters(v_address.location);
  v_delivery_fee := private.order_delivery_fee(v_distance);
  if v_delivery_fee is null then raise exception 'Address outside the service area'; end if;

  v_schedule_mode := coalesce(p_schedule->>'mode','earliest_available');
  if v_schedule_mode not in ('earliest_available','preferred') then raise exception 'Invalid delivery schedule'; end if;
  if coalesce(p_schedule->>'date','') !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}$' then raise exception 'Invalid delivery schedule'; end if;
  v_schedule_date := (p_schedule->>'date')::date;
  v_schedule_window := private.order_clean_text(p_schedule->>'windowLabel',80);
  if v_schedule_window is null then raise exception 'Invalid delivery schedule'; end if;
  if nullif(p_schedule->>'estimatedDate','') is not null then v_estimated_date := (p_schedule->>'estimatedDate')::date; end if;
  v_estimated_window := private.order_clean_text(p_schedule->>'estimatedWindowLabel',80);
  if nullif(p_schedule->>'preferredDate','') is not null then v_preferred_date := (p_schedule->>'preferredDate')::date; end if;
  v_preferred_window := private.order_clean_text(p_schedule->>'preferredWindowLabel',80);
  if v_schedule_date < current_date or v_schedule_date > current_date + 60 then raise exception 'Invalid delivery schedule'; end if;

  -- Lock inventory in deterministic product-id order to prevent overselling and reduce deadlock risk.
  for v_item in select value from jsonb_array_elements(p_items) order by value->>'productId'
  loop
    if jsonb_typeof(v_item) <> 'object' then raise exception 'Invalid order item'; end if;
    v_product_id := v_item->>'productId';
    v_qty_text := v_item->>'quantity';
    if v_product_id is null or v_qty_text is null or v_qty_text !~ '^[0-9]{1,3}$' then raise exception 'Invalid order item'; end if;
    v_quantity := v_qty_text::integer;
    if v_quantity < 1 or v_quantity > 100 then raise exception 'Invalid order quantity'; end if;

    select p.sku,p.name,p.store,p.sales_unit,p.price_centavos,i.stock_on_hand,i.stock_reserved
    into v_sku,v_name,v_store,v_unit,v_price,v_stock_on_hand,v_stock_reserved
    from public.products p
    join public.inventory_items i on i.product_id = p.id
    where p.id = v_product_id and p.deleted_at is null and p.is_active = true
    for update of i;
    if not found then raise exception 'Product unavailable'; end if;
    if v_stock_on_hand - v_stock_reserved < v_quantity then raise exception 'Insufficient stock for product %', v_product_id; end if;
    v_subtotal := v_subtotal + (v_price * v_quantity);
  end loop;

  v_points := private.order_loyalty_points(v_subtotal);
  v_total := v_subtotal + v_delivery_fee;
  v_reference := 'ORD-' || to_char(clock_timestamp(),'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  v_note := private.order_clean_text(p_customer_note,500);

  insert into public.orders(
    id,reference,customer_id,status,payment_method,delivery_address_id,customer_note,
    subtotal_centavos,delivery_fee_centavos,loyalty_discount_centavos,total_centavos,
    inventory_reservation_status,loyalty_qualifying_subtotal_centavos,loyalty_points_pending,
    schedule_mode,schedule_date,schedule_window_label,estimated_date,estimated_window_label,preferred_date,preferred_window_label,
    idempotency_key
  ) values (
    v_order_id,v_reference,p_actor_id,'pending_review',p_payment_method,p_address_id,v_note,
    v_subtotal,v_delivery_fee,0,v_total,'reserved',v_subtotal,v_points,
    v_schedule_mode,v_schedule_date,v_schedule_window,v_estimated_date,v_estimated_window,v_preferred_date,v_preferred_window,
    p_idempotency_key
  );

  v_payment_status := case when p_payment_method = 'gcash' then 'awaiting_verification' else 'collection_due' end;
  insert into public.payments(id,order_id,method,status,amount_centavos,proof_path)
  values (v_payment_id,v_order_id,p_payment_method,v_payment_status,v_total,p_payment_proof_path);

  insert into public.deliveries(
    id,order_id,customer_id,status,schedule_mode,schedule_date,schedule_window_label,estimated_date,estimated_window_label,preferred_date,preferred_window_label,
    recipient_name,phone,address_line,area,municipality,province,distance_meters,latitude,longitude,delivery_note,
    payment_method,amount_to_collect_centavos
  ) values (
    v_delivery_id,v_order_id,p_actor_id,'unassigned',v_schedule_mode,v_schedule_date,v_schedule_window,v_estimated_date,v_estimated_window,v_preferred_date,v_preferred_window,
    v_address.recipient_name,v_address.phone,v_address.address_line,v_address.barangay_name,v_address.municipality_name,v_address.province_name,round(v_distance)::integer,
    extensions.st_y(v_address.location::extensions.geometry),extensions.st_x(v_address.location::extensions.geometry),v_address.delivery_note,
    p_payment_method,case when p_payment_method = 'cod' then v_total else 0 end
  );

  for v_item in select value from jsonb_array_elements(p_items) order by value->>'productId'
  loop
    v_product_id := v_item->>'productId';
    v_quantity := (v_item->>'quantity')::integer;
    select p.sku,p.name,p.store,p.sales_unit,p.price_centavos,i.stock_on_hand,i.stock_reserved
    into v_sku,v_name,v_store,v_unit,v_price,v_stock_on_hand,v_stock_reserved
    from public.products p join public.inventory_items i on i.product_id = p.id
    where p.id = v_product_id;

    insert into public.order_items(order_id,product_id,sku,name,category,unit,unit_price_centavos,quantity,line_total_centavos)
    values (v_order_id,v_product_id,v_sku,v_name,v_store,v_unit,v_price,v_quantity,v_price*v_quantity);
    insert into public.order_inventory_reservations(order_id,product_id,quantity,status)
    values (v_order_id,v_product_id,v_quantity,'reserved');
    update public.inventory_items
    set stock_reserved = stock_reserved + v_quantity, updated_at = now()
    where product_id = v_product_id;
    insert into public.inventory_adjustments(
      product_id,mode,quantity,stock_on_hand_before,stock_on_hand_after,stock_reserved_before,stock_reserved_after,source,reason,actor_id
    ) values (
      v_product_id,'reserve',v_quantity,v_stock_on_hand,v_stock_on_hand,v_stock_reserved,v_stock_reserved+v_quantity,
      'order_reservation','Reserved by order ' || v_reference || '.',p_actor_id
    );
  end loop;

  perform private.add_order_event(v_order_id,'placed','Order placed','customer',p_actor_id,null);
  perform private.add_order_event(v_order_id,'inventory_reserved','Inventory reserved','system',null,'Stock was reserved when the order was placed.');
  update public.customer_addresses set last_used_at = now(), updated_at = now() where id = p_address_id and customer_id = p_actor_id;

  perform private.write_audit_event(
    'order.placed','orders','success',v_actor.full_name || ' placed order ' || v_reference || '.',
    p_actor_id,v_actor.full_name,'customer','order',v_order_id,v_reference,
    jsonb_build_object('status','pending_review'),
    jsonb_build_object('item_count',jsonb_array_length(p_items),'payment_method',p_payment_method,'total_centavos',v_total),
    null,p_request_id,'customer_portal',p_client_ip,p_user_agent
  );
  return v_order_id;
exception
  when unique_violation then
    select id into v_existing from public.orders where customer_id=p_actor_id and idempotency_key=p_idempotency_key;
    if v_existing is not null then return v_existing; end if;
    raise;
end;
$$;
revoke all on function public.customer_place_order(uuid,jsonb,uuid,jsonb,text,text,text,uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.customer_place_order(uuid,jsonb,uuid,jsonb,text,text,text,uuid,uuid,text,text) to service_role;

create or replace function public.customer_request_order_cancellation(
  p_actor_id uuid,
  p_order_id uuid,
  p_reason text,
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
  v_order public.orders;
  v_id uuid;
  v_reason text;
begin
  v_actor := private.assert_operational_actor(p_actor_id,'customer'::public.user_role);
  select * into v_order from public.orders where id=p_order_id and customer_id=p_actor_id for update;
  if not found then raise exception 'Order not found'; end if;
  if v_order.status not in ('pending_review','confirmed','preparing','assigned_for_delivery') then raise exception 'Order cannot be cancelled now'; end if;
  if exists(select 1 from public.order_cancellations where order_id=p_order_id) then raise exception 'Cancellation already requested'; end if;
  v_reason := private.order_clean_text(p_reason,500);
  if v_reason is null or char_length(v_reason) < 4 then raise exception 'Cancellation reason is required'; end if;

  insert into public.order_cancellations(order_id,status,reason,requested_by)
  values(p_order_id,'requested',v_reason,p_actor_id) returning id into v_id;
  perform private.add_order_event(p_order_id,'cancellation_requested','Cancellation requested','customer',p_actor_id,v_reason);
  perform private.write_audit_event(
    'order.cancellation_requested','orders','success',v_actor.full_name || ' requested cancellation of ' || v_order.reference || '.',
    p_actor_id,v_actor.full_name,'customer','order',p_order_id,v_order.reference,'{}'::jsonb,'{}'::jsonb,v_reason,
    p_request_id,'customer_portal',p_client_ip,p_user_agent
  );
  return v_id;
end;
$$;
revoke all on function public.customer_request_order_cancellation(uuid,uuid,text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.customer_request_order_cancellation(uuid,uuid,text,uuid,text,text) to service_role;
