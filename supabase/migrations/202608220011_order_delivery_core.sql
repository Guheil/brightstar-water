-- Transactional Orders + Delivery backend foundation.
-- All operational tables are private to server-side service-role access.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^ORD-[0-9]{8}-[A-F0-9]{8}$'),
  customer_id uuid not null references public.profiles(id) on update cascade on delete restrict,
  status text not null default 'pending_review' check (status in (
    'pending_review','confirmed','preparing','assigned_for_delivery','out_for_delivery','delivered','cancelled','delivery_failed'
  )),
  payment_method text not null check (payment_method in ('cod','gcash')),
  delivery_address_id uuid null references public.customer_addresses(id) on update cascade on delete set null,
  customer_note text null check (customer_note is null or (char_length(btrim(customer_note)) between 1 and 500 and customer_note !~ '[<>[:cntrl:]]')),
  subtotal_centavos bigint not null check (subtotal_centavos >= 0),
  delivery_fee_centavos bigint not null check (delivery_fee_centavos >= 0),
  loyalty_discount_centavos bigint not null default 0 check (loyalty_discount_centavos >= 0),
  total_centavos bigint not null check (total_centavos >= 0),
  inventory_reservation_status text not null default 'reserved' check (inventory_reservation_status in ('reserved','released','committed')),
  loyalty_qualifying_subtotal_centavos bigint not null default 0 check (loyalty_qualifying_subtotal_centavos >= 0),
  loyalty_points_pending integer not null default 0 check (loyalty_points_pending >= 0),
  loyalty_points_awarded integer not null default 0 check (loyalty_points_awarded >= 0),
  loyalty_settled_at timestamptz null,
  schedule_mode text not null check (schedule_mode in ('earliest_available','preferred')),
  schedule_date date not null,
  schedule_window_label text not null check (char_length(btrim(schedule_window_label)) between 2 and 80),
  estimated_date date null,
  estimated_window_label text null check (estimated_window_label is null or char_length(btrim(estimated_window_label)) between 2 and 80),
  preferred_date date null,
  preferred_window_label text null check (preferred_window_label is null or char_length(btrim(preferred_window_label)) between 2 and 80),
  idempotency_key uuid not null,
  placed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_total_math check (total_centavos = subtotal_centavos + delivery_fee_centavos - loyalty_discount_centavos),
  constraint orders_idempotency_unique unique (customer_id, idempotency_key)
);

create index if not exists orders_customer_placed_idx on public.orders (customer_id, placed_at desc, id desc);
create index if not exists orders_status_placed_idx on public.orders (status, placed_at desc, id desc);
create index if not exists orders_active_queue_idx on public.orders (placed_at desc, id desc)
  where status in ('pending_review','confirmed','preparing','assigned_for_delivery','out_for_delivery','delivery_failed');

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on update cascade on delete cascade,
  product_id text not null references public.products(id) on update cascade on delete restrict,
  sku text not null,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  category text not null check (category in ('gas','water')),
  unit text not null check (unit in ('cylinder','refill','container','piece')),
  unit_price_centavos bigint not null check (unit_price_centavos > 0),
  quantity integer not null check (quantity between 1 and 100),
  line_total_centavos bigint not null check (line_total_centavos = unit_price_centavos * quantity),
  constraint order_items_product_unique unique (order_id, product_id)
);
create index if not exists order_items_order_idx on public.order_items (order_id, id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on update cascade on delete cascade,
  method text not null check (method in ('cod','gcash')),
  status text not null check (status in ('collection_due','awaiting_verification','verified','paid','cancelled','failed','refunded')),
  amount_centavos bigint not null check (amount_centavos >= 0),
  reference text null check (reference is null or (char_length(btrim(reference)) between 2 and 120 and reference !~ '[<>[:cntrl:]]')),
  proof_path text null check (proof_path is null or proof_path ~ '^payments/[0-9a-f-]{36}/[0-9a-f-]{36}[.]webp$'),
  verified_at timestamptz null,
  paid_at timestamptz null,
  updated_at timestamptz not null default now(),
  constraint payments_gcash_proof check ((method = 'gcash' and proof_path is not null) or (method = 'cod' and proof_path is null))
);
create index if not exists payments_status_updated_idx on public.payments (status, updated_at desc, id desc);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on update cascade on delete cascade,
  customer_id uuid not null references public.profiles(id) on update cascade on delete restrict,
  deliverer_id uuid null references public.profiles(id) on update cascade on delete restrict,
  status text not null default 'unassigned' check (status in ('unassigned','assigned','accepted','out_for_delivery','delivered','failed','cancelled')),
  schedule_mode text not null check (schedule_mode in ('earliest_available','preferred')),
  schedule_date date not null,
  schedule_window_label text not null check (char_length(btrim(schedule_window_label)) between 2 and 80),
  estimated_date date null,
  estimated_window_label text null,
  preferred_date date null,
  preferred_window_label text null,
  recipient_name text not null check (char_length(btrim(recipient_name)) between 2 and 80),
  phone text not null check (phone ~ '^09[0-9]{9}$'),
  address_line text not null check (char_length(btrim(address_line)) between 3 and 180),
  area text not null check (char_length(btrim(area)) between 1 and 120),
  municipality text not null check (char_length(btrim(municipality)) between 2 and 120),
  province text not null check (char_length(btrim(province)) between 2 and 100),
  distance_meters integer not null check (distance_meters between 0 and 100000),
  latitude double precision null check (latitude is null or latitude between -90 and 90),
  longitude double precision null check (longitude is null or longitude between -180 and 180),
  delivery_note text null check (delivery_note is null or (char_length(btrim(delivery_note)) between 1 and 300 and delivery_note !~ '[<>[:cntrl:]]')),
  payment_method text not null check (payment_method in ('cod','gcash')),
  amount_to_collect_centavos bigint not null default 0 check (amount_to_collect_centavos >= 0),
  assigned_at timestamptz null,
  accepted_at timestamptz null,
  started_at timestamptz null,
  completed_at timestamptz null,
  failure_reason text null check (failure_reason is null or failure_reason in ('customer_unavailable','incorrect_address','customer_requested_reschedule','payment_issue','other')),
  failure_note text null check (failure_note is null or (char_length(btrim(failure_note)) between 1 and 500 and failure_note !~ '[<>[:cntrl:]]')),
  failure_reported_at timestamptz null,
  failure_reported_by uuid null references public.profiles(id) on update cascade on delete restrict,
  completion_cash_centavos bigint null check (completion_cash_centavos is null or completion_cash_centavos >= 0),
  completion_proof_path text null check (completion_proof_path is null or completion_proof_path ~ '^deliveries/[0-9a-f-]{36}/[0-9a-f-]{36}[.]webp$'),
  completion_note text null check (completion_note is null or (char_length(btrim(completion_note)) between 1 and 500 and completion_note !~ '[<>[:cntrl:]]')),
  completion_recorded_at timestamptz null,
  completion_recorded_by uuid null references public.profiles(id) on update cascade on delete restrict,
  updated_at timestamptz not null default now()
);
create index if not exists deliveries_deliverer_queue_idx on public.deliveries (deliverer_id, status, schedule_date, id)
  where deliverer_id is not null and status in ('assigned','accepted','out_for_delivery');
create index if not exists deliveries_status_schedule_idx on public.deliveries (status, schedule_date, id);
create index if not exists deliveries_customer_updated_idx on public.deliveries (customer_id, updated_at desc, id desc);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on update cascade on delete cascade,
  event_type text not null check (event_type in (
    'placed','confirmed','preparation_started','delivery_assigned','delivery_accepted','out_for_delivery','delivered','delivery_failed',
    'cancellation_requested','cancellation_approved','cancellation_rejected','payment_verified','refund_updated','inventory_reserved',
    'inventory_released','inventory_committed','loyalty_awarded'
  )),
  label text not null check (char_length(btrim(label)) between 2 and 160),
  description text null check (description is null or (char_length(btrim(description)) between 1 and 500 and description !~ '[<>[:cntrl:]]')),
  actor_role text not null check (actor_role in ('customer','admin','deliverer','system')),
  actor_id uuid null references public.profiles(id) on update cascade on delete set null,
  occurred_at timestamptz not null default now()
);
create index if not exists order_events_order_time_idx on public.order_events (order_id, occurred_at, id);

create table if not exists public.order_inventory_reservations (
  order_id uuid not null references public.orders(id) on update cascade on delete cascade,
  product_id text not null references public.products(id) on update cascade on delete restrict,
  quantity integer not null check (quantity between 1 and 100),
  status text not null default 'reserved' check (status in ('reserved','released','committed')),
  reserved_at timestamptz not null default now(),
  settled_at timestamptz null,
  primary key (order_id, product_id)
);
create index if not exists order_inventory_active_idx on public.order_inventory_reservations (product_id, order_id)
  where status = 'reserved';

create table if not exists public.order_cancellations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on update cascade on delete cascade,
  status text not null default 'requested' check (status in ('requested','approved','rejected')),
  reason text not null check (char_length(btrim(reason)) between 4 and 500 and reason !~ '[<>[:cntrl:]]'),
  requested_at timestamptz not null default now(),
  requested_by uuid not null references public.profiles(id) on update cascade on delete restrict,
  reviewed_at timestamptz null,
  reviewed_by uuid null references public.profiles(id) on update cascade on delete restrict,
  review_note text null check (review_note is null or (char_length(btrim(review_note)) between 1 and 500 and review_note !~ '[<>[:cntrl:]]'))
);
create index if not exists order_cancellations_queue_idx on public.order_cancellations (status, requested_at desc, id desc);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on update cascade on delete cascade,
  payment_id uuid not null references public.payments(id) on update cascade on delete restrict,
  amount_centavos bigint not null check (amount_centavos >= 0),
  status text not null default 'pending' check (status in ('pending','processing','refunded','rejected')),
  reason text not null check (char_length(btrim(reason)) between 4 and 500 and reason !~ '[<>[:cntrl:]]'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz null,
  resolution_note text null check (resolution_note is null or (char_length(btrim(resolution_note)) between 1 and 500 and resolution_note !~ '[<>[:cntrl:]]'))
);
create index if not exists refunds_status_updated_idx on public.refunds (status, updated_at desc, id desc);

create table if not exists public.loyalty_accounts (
  customer_id uuid primary key references public.profiles(id) on update cascade on delete cascade,
  points_available integer not null default 0 check (points_available >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.loyalty_activity (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  activity_type text not null check (activity_type in ('earned','manual_credit','manual_debit')),
  points integer not null check (points > 0),
  description text not null check (char_length(btrim(description)) between 2 and 300),
  order_id uuid null references public.orders(id) on update cascade on delete set null,
  reason text null check (reason is null or (char_length(btrim(reason)) between 1 and 500 and reason !~ '[<>[:cntrl:]]')),
  created_at timestamptz not null default now()
);
create index if not exists loyalty_activity_customer_time_idx on public.loyalty_activity (customer_id, created_at desc, id desc);

-- Defense in depth: browser roles never query operational tables directly.
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'orders','order_items','payments','deliveries','order_events','order_inventory_reservations',
    'order_cancellations','refunds','loyalty_accounts','loyalty_activity'
  ] loop
    execute format('alter table public.%I enable row level security', v_table);
    execute format('revoke all on table public.%I from public, anon, authenticated', v_table);
    execute format('grant select, insert, update, delete on table public.%I to service_role', v_table);
  end loop;
end $$;

create or replace function private.assert_operational_actor(p_actor_id uuid, p_role public.user_role)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
begin
  select * into v_actor
  from public.profiles
  where id = p_actor_id
    and role = p_role
    and status = 'active'::public.profile_status
    and onboarding_stage = 'complete'::public.onboarding_stage;
  if not found then raise exception 'Not authorized'; end if;
  return v_actor;
end;
$$;
revoke all on function private.assert_operational_actor(uuid, public.user_role) from public, anon, authenticated, service_role;

create or replace function private.order_clean_text(p_value text, p_max integer)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select left(nullif(btrim(regexp_replace(coalesce(p_value, ''), '[<>[:cntrl:]]', '', 'g')), ''), p_max);
$$;
revoke all on function private.order_clean_text(text, integer) from public, anon, authenticated, service_role;

create or replace function private.order_delivery_fee(p_distance_meters double precision)
returns bigint
language sql
immutable
security invoker
set search_path = ''
as $$
  select case
    when p_distance_meters < 0 or p_distance_meters > 10000 then null
    when p_distance_meters <= 3000 then 0
    when p_distance_meters <= 6000 then 3000
    else 5000
  end::bigint;
$$;
revoke all on function private.order_delivery_fee(double precision) from public, anon, authenticated, service_role;

create or replace function private.order_loyalty_points(p_subtotal bigint)
returns integer
language sql
immutable
security invoker
set search_path = ''
as $$
  select case when p_subtotal < 50000 then 0 else floor(p_subtotal / 10000.0)::integer end;
$$;
revoke all on function private.order_loyalty_points(bigint) from public, anon, authenticated, service_role;

create or replace function private.add_order_event(
  p_order_id uuid,
  p_event_type text,
  p_label text,
  p_actor_role text,
  p_actor_id uuid default null,
  p_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  insert into public.order_events(order_id,event_type,label,description,actor_role,actor_id)
  values (p_order_id,p_event_type,btrim(p_label),private.order_clean_text(p_description,500),p_actor_role,p_actor_id)
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function private.add_order_event(uuid,text,text,text,uuid,text) from public, anon, authenticated, service_role;

comment on table public.orders is 'Authoritative order state. Prices, totals and customer identity are server/database derived.';
comment on table public.order_items is 'Immutable purchase-time product and price snapshots.';
comment on table public.deliveries is 'Authoritative delivery assignment and fulfillment state.';
comment on column public.payments.proof_path is 'Private Supabase Storage path only. Image bytes/base64 are never stored in Postgres.';
