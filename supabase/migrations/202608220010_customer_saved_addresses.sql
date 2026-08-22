-- Supabase-backed customer delivery addresses with PostGIS serviceability.
-- Browser roles do not access these tables directly. Customer-facing Next.js
-- routes authenticate the caller and use service-role-only RPCs scoped to that
-- authenticated customer. RLS remains enabled as defense in depth.

create extension if not exists postgis with schema extensions;

alter table private.audit_events drop constraint if exists audit_events_category;
alter table private.audit_events add constraint audit_events_category check (
  category in ('accounts', 'onboarding', 'security', 'orders', 'products', 'inventory', 'deliveries', 'payments', 'loyalty', 'addresses', 'system')
);

alter table private.audit_events drop constraint if exists audit_events_target_type;
alter table private.audit_events add constraint audit_events_target_type check (
  target_type is null
  or target_type in ('account', 'order', 'product', 'inventory', 'delivery', 'payment', 'loyalty', 'address', 'system')
);

create table if not exists public.delivery_service_locations (
  id text primary key,
  label text not null check (char_length(btrim(label)) between 2 and 120),
  location extensions.geography(point, 4326) not null,
  radius_meters integer not null check (radius_meters between 100 and 100000),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.delivery_service_locations (id, label, location, radius_meters)
values (
  'shared-main-station',
  'MRJE Gas + Bright Star Water main station',
  extensions.st_setsrid(extensions.st_makepoint(121.0517, 14.353), 4326)::extensions.geography,
  10000
)
on conflict (id) do update
set label = excluded.label,
    location = excluded.location,
    radius_meters = excluded.radius_meters,
    is_active = true,
    updated_at = now();

create index if not exists delivery_service_locations_geo_idx
  on public.delivery_service_locations using gist (location);

create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  address_type text not null check (address_type in ('home', 'work', 'other')),
  custom_label text null check (
    custom_label is null
    or (char_length(btrim(custom_label)) between 2 and 40 and custom_label !~ '[<>[:cntrl:]]')
  ),
  recipient_name text not null check (
    char_length(btrim(recipient_name)) between 2 and 80 and recipient_name !~ '[<>[:cntrl:]]'
  ),
  phone text not null check (phone ~ '^09[0-9]{9}$'),
  region_code text not null check (region_code ~ '^[0-9]{10}$'),
  region_name text not null check (char_length(btrim(region_name)) between 2 and 100),
  province_code text not null check (province_code ~ '^[0-9]{10}$'),
  province_name text not null check (char_length(btrim(province_name)) between 2 and 100),
  municipality_code text not null check (municipality_code ~ '^[0-9]{10}$'),
  municipality_name text not null check (char_length(btrim(municipality_name)) between 2 and 120),
  barangay_code text not null check (barangay_code ~ '^[0-9]{10}$'),
  barangay_name text not null check (char_length(btrim(barangay_name)) between 1 and 120),
  address_line text not null check (
    char_length(btrim(address_line)) between 3 and 180 and address_line !~ '[<>[:cntrl:]]'
  ),
  landmark text null check (
    landmark is null or (char_length(btrim(landmark)) between 2 and 140 and landmark !~ '[<>[:cntrl:]]')
  ),
  delivery_note text null check (
    delivery_note is null or (char_length(btrim(delivery_note)) between 2 and 300 and delivery_note !~ '[<>[:cntrl:]]')
  ),
  location extensions.geography(point, 4326) not null,
  is_default boolean not null default false,
  last_used_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_addresses_other_label check (
    (address_type = 'other' and custom_label is not null)
    or (address_type in ('home', 'work') and custom_label is null)
  )
);

create index if not exists customer_addresses_customer_updated_idx
  on public.customer_addresses (customer_id, updated_at desc, id);
create index if not exists customer_addresses_customer_last_used_idx
  on public.customer_addresses (customer_id, last_used_at desc nulls last, updated_at desc);
create unique index if not exists customer_addresses_one_default_idx
  on public.customer_addresses (customer_id)
  where is_default = true;
create index if not exists customer_addresses_geo_idx
  on public.customer_addresses using gist (location);

alter table public.delivery_service_locations enable row level security;
alter table public.customer_addresses enable row level security;

revoke all on table public.delivery_service_locations from public, anon, authenticated;
revoke all on table public.customer_addresses from public, anon, authenticated;
grant select, insert, update, delete on table public.delivery_service_locations to service_role;
grant select, insert, update, delete on table public.customer_addresses to service_role;

comment on table public.customer_addresses is
  'Private saved delivery locations. Exact street and coordinate data are accessible only through authenticated customer server routes.';
comment on column public.customer_addresses.location is
  'Exact delivery pin. Do not duplicate this coordinate into the human-readable audit ledger.';

create or replace function private.assert_customer_address_actor(p_actor_id uuid)
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
    and role = 'customer'::public.user_role
    and status = 'active'::public.profile_status
    and onboarding_stage = 'complete'::public.onboarding_stage;

  if not found then
    raise exception 'Not authorized';
  end if;

  return v_actor;
end;
$$;
revoke all on function private.assert_customer_address_actor(uuid) from public, anon, authenticated, service_role;

create or replace function private.clean_address_text(p_value text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select nullif(btrim(regexp_replace(coalesce(p_value, ''), '[<>[:cntrl:]]', '', 'g')), '');
$$;
revoke all on function private.clean_address_text(text) from public, anon, authenticated, service_role;

create or replace function private.address_type_label(p_type text, p_custom_label text)
returns text
language sql
immutable
security invoker
set search_path = ''
as $$
  select case p_type
    when 'home' then 'Home'
    when 'work' then 'Work'
    else coalesce(nullif(btrim(p_custom_label), ''), 'Other')
  end;
$$;
revoke all on function private.address_type_label(text, text) from public, anon, authenticated, service_role;

create or replace function private.customer_address_distance_meters(p_location extensions.geography)
returns double precision
language sql
stable
security definer
set search_path = ''
as $$
  select extensions.st_distance(p_location, service.location)
  from public.delivery_service_locations service
  where service.id = 'shared-main-station' and service.is_active = true;
$$;
revoke all on function private.customer_address_distance_meters(extensions.geography) from public, anon, authenticated, service_role;

create or replace function public.list_customer_addresses(p_actor_id uuid)
returns table (
  id uuid,
  address_type text,
  custom_label text,
  recipient_name text,
  phone text,
  region_code text,
  region_name text,
  province_code text,
  province_name text,
  municipality_code text,
  municipality_name text,
  barangay_code text,
  barangay_name text,
  address_line text,
  landmark text,
  delivery_note text,
  latitude double precision,
  longitude double precision,
  distance_meters double precision,
  is_default boolean,
  last_used_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_customer_address_actor(p_actor_id);

  return query
  select
    a.id,
    a.address_type,
    a.custom_label,
    a.recipient_name,
    a.phone,
    a.region_code,
    a.region_name,
    a.province_code,
    a.province_name,
    a.municipality_code,
    a.municipality_name,
    a.barangay_code,
    a.barangay_name,
    a.address_line,
    a.landmark,
    a.delivery_note,
    extensions.st_y(a.location::extensions.geometry),
    extensions.st_x(a.location::extensions.geometry),
    private.customer_address_distance_meters(a.location),
    a.is_default,
    a.last_used_at,
    a.created_at,
    a.updated_at
  from public.customer_addresses a
  where a.customer_id = p_actor_id
  order by a.is_default desc, a.last_used_at desc nulls last, a.updated_at desc, a.id;
end;
$$;
revoke all on function public.list_customer_addresses(uuid) from public, anon, authenticated;
grant execute on function public.list_customer_addresses(uuid) to service_role;

create or replace function public.customer_save_address(
  p_actor_id uuid,
  p_address_id uuid,
  p_address_type text,
  p_custom_label text,
  p_recipient_name text,
  p_phone text,
  p_region_code text,
  p_region_name text,
  p_province_code text,
  p_province_name text,
  p_municipality_code text,
  p_municipality_name text,
  p_barangay_code text,
  p_barangay_name text,
  p_address_line text,
  p_landmark text,
  p_delivery_note text,
  p_latitude double precision,
  p_longitude double precision,
  p_make_default boolean,
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
  v_id uuid;
  v_point extensions.geography;
  v_distance double precision;
  v_radius integer;
  v_is_new boolean := p_address_id is null;
  v_make_default boolean;
  v_existing_default boolean := false;
  v_label text;
begin
  v_actor := private.assert_customer_address_actor(p_actor_id);
  perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text, 91421));

  if p_address_type not in ('home', 'work', 'other') then raise exception 'Invalid address type'; end if;
  if p_address_type = 'other' and private.clean_address_text(p_custom_label) is null then raise exception 'Custom label required'; end if;
  if p_address_type in ('home', 'work') and private.clean_address_text(p_custom_label) is not null then raise exception 'Custom label does not apply'; end if;
  if p_phone is null or p_phone !~ '^09[0-9]{9}$' then raise exception 'Invalid mobile number'; end if;
  if p_latitude is null or p_latitude < -90 or p_latitude > 90 or p_longitude is null or p_longitude < -180 or p_longitude > 180 then
    raise exception 'Invalid delivery pin';
  end if;

  v_point := extensions.st_setsrid(extensions.st_makepoint(p_longitude, p_latitude), 4326)::extensions.geography;
  select radius_meters into v_radius
  from public.delivery_service_locations
  where id = 'shared-main-station' and is_active = true;
  if v_radius is null then raise exception 'Delivery service area is unavailable'; end if;

  v_distance := private.customer_address_distance_meters(v_point);
  if v_distance is null or v_distance > v_radius then raise exception 'Delivery point is outside the service area'; end if;

  if v_is_new then
    if (select count(*) from public.customer_addresses where customer_id = p_actor_id) >= 10 then
      raise exception 'Address limit reached';
    end if;
    v_id := gen_random_uuid();
    v_make_default := coalesce(p_make_default, false)
      or not exists (select 1 from public.customer_addresses where customer_id = p_actor_id);
  else
    select is_default into v_existing_default
    from public.customer_addresses
    where id = p_address_id and customer_id = p_actor_id
    for update;
    if not found then raise exception 'Address not found'; end if;
    v_id := p_address_id;
    v_make_default := coalesce(p_make_default, false) or v_existing_default;
  end if;

  if v_make_default then
    update public.customer_addresses
    set is_default = false, updated_at = now()
    where customer_id = p_actor_id and is_default = true and id <> v_id;
  end if;

  if v_is_new then
    insert into public.customer_addresses (
      id, customer_id, address_type, custom_label, recipient_name, phone,
      region_code, region_name, province_code, province_name,
      municipality_code, municipality_name, barangay_code, barangay_name,
      address_line, landmark, delivery_note, location, is_default
    ) values (
      v_id, p_actor_id, p_address_type,
      case when p_address_type = 'other' then private.clean_address_text(p_custom_label) else null end,
      private.clean_address_text(p_recipient_name), p_phone,
      p_region_code, private.clean_address_text(p_region_name),
      p_province_code, private.clean_address_text(p_province_name),
      p_municipality_code, private.clean_address_text(p_municipality_name),
      p_barangay_code, private.clean_address_text(p_barangay_name),
      private.clean_address_text(p_address_line), private.clean_address_text(p_landmark),
      private.clean_address_text(p_delivery_note), v_point, v_make_default
    );
  else
    update public.customer_addresses
    set address_type = p_address_type,
        custom_label = case when p_address_type = 'other' then private.clean_address_text(p_custom_label) else null end,
        recipient_name = private.clean_address_text(p_recipient_name),
        phone = p_phone,
        region_code = p_region_code,
        region_name = private.clean_address_text(p_region_name),
        province_code = p_province_code,
        province_name = private.clean_address_text(p_province_name),
        municipality_code = p_municipality_code,
        municipality_name = private.clean_address_text(p_municipality_name),
        barangay_code = p_barangay_code,
        barangay_name = private.clean_address_text(p_barangay_name),
        address_line = private.clean_address_text(p_address_line),
        landmark = private.clean_address_text(p_landmark),
        delivery_note = private.clean_address_text(p_delivery_note),
        location = v_point,
        is_default = v_make_default,
        updated_at = now()
    where id = v_id and customer_id = p_actor_id;
  end if;

  v_label := private.address_type_label(p_address_type, p_custom_label);
  perform private.write_audit_event(
    case when v_is_new then 'address.created' else 'address.updated' end,
    'addresses', 'success',
    v_actor.full_name || case when v_is_new then ' added a ' else ' updated a ' end || v_label || ' delivery address.',
    p_actor_id, v_actor.full_name, 'customer',
    'address', v_id, v_label || ' delivery address',
    '{}'::jsonb,
    jsonb_build_object('address_type', p_address_type, 'became_default', v_make_default),
    null, p_request_id, 'customer_portal', p_client_ip, p_user_agent
  );

  return v_id;
end;
$$;
revoke all on function public.customer_save_address(uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, double precision, double precision, boolean, uuid, text, text) from public, anon, authenticated;
grant execute on function public.customer_save_address(uuid, uuid, text, text, text, text, text, text, text, text, text, text, text, text, text, text, text, double precision, double precision, boolean, uuid, text, text) to service_role;

create or replace function public.customer_set_default_address(
  p_actor_id uuid,
  p_address_id uuid,
  p_request_id uuid,
  p_client_ip text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_address public.customer_addresses;
  v_label text;
begin
  v_actor := private.assert_customer_address_actor(p_actor_id);
  perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text, 91421));

  select * into v_address
  from public.customer_addresses
  where id = p_address_id and customer_id = p_actor_id
  for update;
  if not found then raise exception 'Address not found'; end if;

  update public.customer_addresses set is_default = false, updated_at = now()
  where customer_id = p_actor_id and is_default = true and id <> p_address_id;
  update public.customer_addresses set is_default = true, updated_at = now()
  where id = p_address_id and customer_id = p_actor_id;

  v_label := private.address_type_label(v_address.address_type, v_address.custom_label);
  perform private.write_audit_event(
    'address.default_changed', 'addresses', 'success',
    v_actor.full_name || ' changed the default delivery address to ' || v_label || '.',
    p_actor_id, v_actor.full_name, 'customer', 'address', p_address_id,
    v_label || ' delivery address', '{}'::jsonb,
    jsonb_build_object('address_type', v_address.address_type), null,
    p_request_id, 'customer_portal', p_client_ip, p_user_agent
  );
end;
$$;
revoke all on function public.customer_set_default_address(uuid, uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.customer_set_default_address(uuid, uuid, uuid, text, text) to service_role;

create or replace function public.customer_delete_address(
  p_actor_id uuid,
  p_address_id uuid,
  p_request_id uuid,
  p_client_ip text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_address public.customer_addresses;
  v_next_default uuid;
  v_label text;
begin
  v_actor := private.assert_customer_address_actor(p_actor_id);
  perform pg_advisory_xact_lock(hashtextextended(p_actor_id::text, 91421));

  select * into v_address
  from public.customer_addresses
  where id = p_address_id and customer_id = p_actor_id
  for update;
  if not found then raise exception 'Address not found'; end if;

  delete from public.customer_addresses where id = p_address_id and customer_id = p_actor_id;

  if v_address.is_default then
    select id into v_next_default
    from public.customer_addresses
    where customer_id = p_actor_id
    order by last_used_at desc nulls last, updated_at desc, id
    limit 1;
    if v_next_default is not null then
      update public.customer_addresses set is_default = true, updated_at = now()
      where id = v_next_default and customer_id = p_actor_id;
    end if;
  end if;

  v_label := private.address_type_label(v_address.address_type, v_address.custom_label);
  perform private.write_audit_event(
    'address.deleted', 'addresses', 'success',
    v_actor.full_name || ' removed a saved ' || v_label || ' delivery address.',
    p_actor_id, v_actor.full_name, 'customer', 'address', p_address_id,
    v_label || ' delivery address', '{}'::jsonb,
    jsonb_build_object('address_type', v_address.address_type), null,
    p_request_id, 'customer_portal', p_client_ip, p_user_agent
  );
end;
$$;
revoke all on function public.customer_delete_address(uuid, uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.customer_delete_address(uuid, uuid, uuid, text, text) to service_role;

create or replace function public.customer_mark_address_used(p_actor_id uuid, p_address_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_customer_address_actor(p_actor_id);
  update public.customer_addresses
  set last_used_at = now(), updated_at = now()
  where id = p_address_id and customer_id = p_actor_id;
  if not found then raise exception 'Address not found'; end if;
end;
$$;
revoke all on function public.customer_mark_address_used(uuid, uuid) from public, anon, authenticated;
grant execute on function public.customer_mark_address_used(uuid, uuid) to service_role;
