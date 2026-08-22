-- Reduce write amplification for frequent cart updates and automatically remove
-- products that are deactivated after a customer saved them.

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

  -- Delete only products removed from the submitted cart. This avoids rewriting
  -- unchanged cart rows on every debounced quantity update.
  delete from public.customer_cart_items existing
  where existing.customer_id = p_actor_id
    and not exists (
      select 1
      from jsonb_array_elements(p_items) submitted
      where submitted->>'productId' = existing.product_id
    );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    insert into public.customer_cart_items(customer_id, product_id, quantity, updated_at)
    values (
      p_actor_id,
      v_item->>'productId',
      (v_item->>'quantity')::integer,
      now()
    )
    on conflict (customer_id, product_id) do update
      set quantity = excluded.quantity,
          updated_at = case
            when public.customer_cart_items.quantity is distinct from excluded.quantity then excluded.updated_at
            else public.customer_cart_items.updated_at
          end
      where public.customer_cart_items.quantity is distinct from excluded.quantity;
  end loop;
end;
$$;

revoke all on function public.customer_replace_cart(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.customer_replace_cart(uuid, jsonb) to service_role;

create or replace function private.remove_unavailable_product_from_carts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_active = false or new.deleted_at is not null then
    delete from public.customer_cart_items where product_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function private.remove_unavailable_product_from_carts() from public, anon, authenticated, service_role;

drop trigger if exists remove_unavailable_product_from_carts on public.products;
create trigger remove_unavailable_product_from_carts
after update of is_active, deleted_at on public.products
for each row
when (new.is_active = false or new.deleted_at is not null)
execute function private.remove_unavailable_product_from_carts();
