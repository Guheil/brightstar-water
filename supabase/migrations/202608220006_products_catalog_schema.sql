-- MRJE / Bright Star database-backed catalog and inventory foundation.
-- Supabase CLI was unavailable in the execution environment, so this migration
-- uses the next repository sequence after 202608220005.

create table if not exists public.product_types (
  code text primary key,
  store text not null check (store in ('gas', 'water')),
  label text not null check (char_length(btrim(label)) between 2 and 80),
  requires_size boolean not null default false,
  allowed_size_values numeric[] not null default '{}'::numeric[],
  default_size_unit text null check (default_size_unit is null or default_size_unit in ('kg', 'gallon', 'liter', 'meter')),
  default_sales_unit text not null check (default_sales_unit in ('cylinder', 'refill', 'container', 'piece')),
  stock_tracked_default boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 100 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_sku_counters (
  store text primary key check (store in ('gas', 'water')),
  last_value integer not null default 0 check (last_value >= 0)
);

create table if not exists public.products (
  id text primary key default ('product-' || gen_random_uuid()::text),
  product_type_code text not null references public.product_types(code) on update cascade on delete restrict,
  store text not null check (store in ('gas', 'water')),
  sku text not null,
  slug text not null,
  name text not null check (char_length(btrim(name)) between 2 and 120),
  short_description text not null check (char_length(btrim(short_description)) between 8 and 180),
  description text not null check (char_length(btrim(description)) between 12 and 2000),
  sales_unit text not null check (sales_unit in ('cylinder', 'refill', 'container', 'piece')),
  size_value numeric(10,2) null check (size_value is null or size_value > 0),
  size_unit text null check (size_unit is null or size_unit in ('kg', 'gallon', 'liter', 'meter')),
  price_centavos bigint not null check (price_centavos > 0 and price_centavos <= 1000000000),
  currency_code char(3) not null default 'PHP' check (currency_code = 'PHP'),
  brand text null check (brand is null or char_length(btrim(brand)) between 2 and 80),
  gtin text null check (gtin is null or (gtin ~ '^[0-9]+$' and char_length(gtin) in (8, 12, 13, 14))),
  mpn text null check (mpn is null or char_length(btrim(mpn)) between 1 and 80),
  image_path text null check (
    image_path is null or image_path ~ '^products/[A-Za-z0-9-]{3,80}/[0-9a-f-]{36}\\.webp$'
  ),
  image_alt text not null check (char_length(btrim(image_alt)) between 2 and 180),
  image_width integer null check (image_width is null or image_width between 1 and 5000),
  image_height integer null check (image_height is null or image_height between 1 and 5000),
  image_bytes integer null check (image_bytes is null or image_bytes between 1 and 1048576),
  is_active boolean not null default false,
  is_featured boolean not null default false,
  stock_tracked boolean not null default true,
  sort_order integer not null default 100 check (sort_order >= 0),
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_sku_format check (sku ~ '^(MRJE|BSW)-[0-9]{6}$'),
  constraint products_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint products_image_metadata_consistent check (
    (image_path is null and image_width is null and image_height is null and image_bytes is null)
    or
    (image_path is not null and image_width is not null and image_height is not null and image_bytes is not null)
  )
);

create unique index if not exists products_sku_unique_idx on public.products (sku);
create unique index if not exists products_slug_unique_idx on public.products (slug);
create index if not exists products_public_catalog_idx
  on public.products (store, is_featured desc, sort_order, name)
  where deleted_at is null and is_active = true;
create index if not exists products_admin_updated_idx
  on public.products (updated_at desc, id)
  where deleted_at is null;
create index if not exists products_type_idx
  on public.products (product_type_code, updated_at desc)
  where deleted_at is null;

create table if not exists public.inventory_items (
  product_id text primary key references public.products(id) on update cascade on delete restrict,
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  stock_reserved integer not null default 0 check (stock_reserved >= 0),
  reorder_level integer not null default 0 check (reorder_level >= 0),
  updated_at timestamptz not null default now(),
  constraint inventory_reserved_within_stock check (stock_reserved <= stock_on_hand)
);

create index if not exists inventory_low_stock_idx
  on public.inventory_items (reorder_level, stock_on_hand, product_id);

create table if not exists public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on update cascade on delete restrict,
  mode text not null check (mode in ('increase', 'decrease', 'set', 'reserve', 'release', 'commit')),
  quantity integer not null check (quantity >= 0),
  stock_on_hand_before integer not null check (stock_on_hand_before >= 0),
  stock_on_hand_after integer not null check (stock_on_hand_after >= 0),
  stock_reserved_before integer not null check (stock_reserved_before >= 0),
  stock_reserved_after integer not null check (stock_reserved_after >= 0),
  source text not null check (source in ('admin_adjustment', 'order_reservation', 'order_release', 'order_commit', 'opening_stock')),
  reason text not null check (char_length(btrim(reason)) between 4 and 300),
  actor_id uuid null references public.profiles(id) on update cascade on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists inventory_adjustments_product_time_idx
  on public.inventory_adjustments (product_id, created_at desc);
create index if not exists inventory_adjustments_time_idx
  on public.inventory_adjustments (created_at desc);

alter table public.product_types enable row level security;
alter table public.product_sku_counters enable row level security;
alter table public.products enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_adjustments enable row level security;

revoke all on table public.product_types from public, anon, authenticated;
revoke all on table public.product_sku_counters from public, anon, authenticated;
revoke all on table public.products from public, anon, authenticated;
revoke all on table public.inventory_items from public, anon, authenticated;
revoke all on table public.inventory_adjustments from public, anon, authenticated;

grant select, insert, update, delete on table public.product_types to service_role;
grant select, insert, update, delete on table public.product_sku_counters to service_role;
grant select, insert, update, delete on table public.products to service_role;
grant select, insert, update, delete on table public.inventory_items to service_role;
grant select, insert, update, delete on table public.inventory_adjustments to service_role;

create or replace function private.assert_catalog_admin(p_actor_id uuid)
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
    and role = 'admin'::public.user_role
    and status = 'active'::public.profile_status
    and onboarding_stage = 'complete'::public.onboarding_stage;

  if not found then
    raise exception 'Not authorized';
  end if;

  return v_actor;
end;
$$;

revoke all on function private.assert_catalog_admin(uuid) from public, anon, authenticated, service_role;

create or replace function private.product_slug_base(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    nullif(
      trim(both '-' from regexp_replace(
        regexp_replace(lower(btrim(coalesce(p_name, ''))), '[^a-z0-9]+', '-', 'g'),
        '-+', '-', 'g'
      )),
      ''
    ),
    'product'
  );
$$;

revoke all on function private.product_slug_base(text) from public, anon, authenticated, service_role;

create or replace function private.next_product_slug(p_name text, p_exclude_id text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_base text := private.product_slug_base(p_name);
  v_candidate text;
  v_suffix integer := 1;
begin
  v_candidate := v_base;

  while exists (
    select 1
    from public.products p
    where p.slug = v_candidate
      and (p_exclude_id is null or p.id <> p_exclude_id)
  ) loop
    v_suffix := v_suffix + 1;
    v_candidate := v_base || '-' || v_suffix::text;
  end loop;

  return v_candidate;
end;
$$;

revoke all on function private.next_product_slug(text, text) from public, anon, authenticated, service_role;

create or replace function private.next_product_sku(p_store text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_next integer;
  v_prefix text;
begin
  if p_store not in ('gas', 'water') then
    raise exception 'Invalid store';
  end if;

  insert into public.product_sku_counters(store, last_value)
  values (p_store, 1)
  on conflict (store) do update
    set last_value = public.product_sku_counters.last_value + 1
  returning last_value into v_next;

  v_prefix := case p_store when 'gas' then 'MRJE' else 'BSW' end;
  return v_prefix || '-' || lpad(v_next::text, 6, '0');
end;
$$;

revoke all on function private.next_product_sku(text) from public, anon, authenticated, service_role;

create or replace function private.validate_product_shape()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type public.product_types;
begin
  select * into v_type
  from public.product_types
  where code = new.product_type_code and is_active = true;

  if not found then
    raise exception 'Invalid product type';
  end if;

  if new.store <> v_type.store then
    raise exception 'Product store does not match its product type';
  end if;

  if new.sales_unit <> v_type.default_sales_unit then
    raise exception 'Product sales unit does not match its product type';
  end if;

  if new.stock_tracked <> v_type.stock_tracked_default then
    raise exception 'Product stock tracking does not match its product type';
  end if;

  if v_type.requires_size then
    if new.size_value is null or new.size_unit is null then
      raise exception 'A size is required for this product type';
    end if;
    if new.size_unit <> v_type.default_size_unit then
      raise exception 'Invalid size unit for this product type';
    end if;
    if cardinality(v_type.allowed_size_values) > 0
      and not (new.size_value = any(v_type.allowed_size_values)) then
      raise exception 'Invalid size for this product type';
    end if;
  else
    if new.size_value is not null or new.size_unit is not null then
      raise exception 'Size does not apply to this product type';
    end if;
  end if;

  if new.deleted_at is not null then
    new.is_active := false;
    new.is_featured := false;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.validate_product_shape() from public, anon, authenticated, service_role;

drop trigger if exists products_validate_shape on public.products;
create trigger products_validate_shape
before insert or update on public.products
for each row execute function private.validate_product_shape();
