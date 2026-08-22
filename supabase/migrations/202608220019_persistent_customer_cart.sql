-- Persistent per-customer carts.
-- Browser clients never receive direct table privileges; all writes go through
-- the authenticated Next.js backend using the service role and actor-derived IDs.

create table if not exists public.customer_cart_items (
  customer_id uuid not null references public.profiles(id) on update cascade on delete cascade,
  product_id text not null references public.products(id) on update cascade on delete cascade,
  quantity integer not null check (quantity between 1 and 100),
  updated_at timestamptz not null default now(),
  primary key (customer_id, product_id)
);

create index if not exists customer_cart_items_product_idx
  on public.customer_cart_items (product_id, customer_id);

alter table public.customer_cart_items enable row level security;
revoke all on table public.customer_cart_items from public, anon, authenticated;
grant select, insert, update, delete on table public.customer_cart_items to service_role;

create or replace function public.customer_replace_cart(
  p_actor_id uuid,
  p_items jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_product_id text;
  v_quantity_text text;
  v_quantity integer;
begin
  perform private.assert_operational_actor(p_actor_id, 'customer'::public.user_role);

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 50 then
    raise exception 'Invalid cart items';
  end if;

  if (
    select count(*)
    from (
      select distinct value->>'productId'
      from jsonb_array_elements(p_items)
    ) distinct_products
  ) <> jsonb_array_length(p_items) then
    raise exception 'Duplicate cart products are not allowed';
  end if;

  -- Validate the full replacement before deleting the current cart so a malformed
  -- request can never partially clear a customer's saved cart.
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Invalid cart item';
    end if;

    v_product_id := v_item->>'productId';
    v_quantity_text := v_item->>'quantity';

    if v_product_id is null
      or char_length(v_product_id) > 80
      or v_product_id !~ '^[A-Za-z0-9._:-]+$'
      or v_quantity_text is null
      or v_quantity_text !~ '^[0-9]{1,3}$'
    then
      raise exception 'Invalid cart item';
    end if;

    v_quantity := v_quantity_text::integer;
    if v_quantity < 1 or v_quantity > 100 then
      raise exception 'Invalid cart quantity';
    end if;

    perform 1
    from public.products p
    join public.inventory_items i on i.product_id = p.id
    where p.id = v_product_id
      and p.deleted_at is null
      and p.is_active = true;

    if not found then
      raise exception 'Product unavailable';
    end if;
  end loop;

  delete from public.customer_cart_items
  where customer_id = p_actor_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    insert into public.customer_cart_items(customer_id, product_id, quantity, updated_at)
    values (
      p_actor_id,
      v_item->>'productId',
      (v_item->>'quantity')::integer,
      now()
    );
  end loop;
end;
$$;

revoke all on function public.customer_replace_cart(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.customer_replace_cart(uuid, jsonb) to service_role;

-- A successfully created order always consumes the saved cart snapshot.
-- This happens in the same transaction as order creation, so checkout cannot
-- succeed while leaving stale cart rows behind on the server.
create or replace function private.clear_customer_cart_after_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.customer_cart_items
  where customer_id = new.customer_id;
  return new;
end;
$$;

revoke all on function private.clear_customer_cart_after_order() from public, anon, authenticated, service_role;

drop trigger if exists clear_customer_cart_after_order on public.orders;
create trigger clear_customer_cart_after_order
after insert on public.orders
for each row execute function private.clear_customer_cart_after_order();

comment on table public.customer_cart_items is
  'Persistent authenticated customer cart. Direct browser access is revoked; the Next.js backend derives customer ownership from the authenticated session.';
