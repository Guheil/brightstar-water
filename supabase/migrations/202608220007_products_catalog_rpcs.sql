-- Secure Admin catalog/inventory RPCs and Activity History integration.

create or replace function public.admin_create_product(
  p_actor_id uuid,
  p_product_id text,
  p_product_type_code text,
  p_name text,
  p_short_description text,
  p_description text,
  p_size_value numeric,
  p_price_centavos bigint,
  p_brand text,
  p_gtin text,
  p_mpn text,
  p_image_path text,
  p_image_alt text,
  p_image_width integer,
  p_image_height integer,
  p_image_bytes integer,
  p_is_featured boolean,
  p_is_active boolean,
  p_opening_stock integer,
  p_reorder_level integer,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns public.products
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_type public.product_types;
  v_product public.products;
  v_sku text;
  v_slug text;
  v_name text := btrim(coalesce(p_name, ''));
  v_short text := btrim(coalesce(p_short_description, ''));
  v_description text := btrim(coalesce(p_description, ''));
  v_brand text := nullif(btrim(coalesce(p_brand, '')), '');
  v_gtin text := nullif(regexp_replace(coalesce(p_gtin, ''), '[^0-9]', '', 'g'), '');
  v_mpn text := nullif(btrim(coalesce(p_mpn, '')), '');
  v_alt text;
  v_sort integer;
begin
  v_actor := private.assert_catalog_admin(p_actor_id);

  select * into v_type from public.product_types
  where code = p_product_type_code and is_active = true;
  if not found then raise exception 'Invalid product type'; end if;

  if p_product_id is null or p_product_id !~ '^product-[A-Za-z0-9-]{4,72}$' then
    raise exception 'Invalid product ID';
  end if;
  if p_opening_stock < 0 or p_reorder_level < 0 then
    raise exception 'Inventory quantities cannot be negative';
  end if;
  if p_price_centavos <= 0 then raise exception 'Price must be greater than zero'; end if;

  v_sku := private.next_product_sku(v_type.store);
  v_slug := private.next_product_slug(v_name, null);
  v_alt := coalesce(nullif(btrim(coalesce(p_image_alt, '')), ''), v_name || case v_type.store when 'gas' then ' from MRJE Gas' else ' from Bright Star Water' end);
  select coalesce(max(sort_order), 0) + 10 into v_sort
  from public.products where store = v_type.store and deleted_at is null;

  insert into public.products (
    id, product_type_code, store, sku, slug, name,
    short_description, description, sales_unit, size_value, size_unit,
    price_centavos, brand, gtin, mpn,
    image_path, image_alt, image_width, image_height, image_bytes,
    is_active, is_featured, stock_tracked, sort_order
  ) values (
    p_product_id, v_type.code, v_type.store, v_sku, v_slug, v_name,
    v_short, v_description, v_type.default_sales_unit,
    case when v_type.requires_size then p_size_value else null end,
    case when v_type.requires_size then v_type.default_size_unit else null end,
    p_price_centavos, v_brand, v_gtin, v_mpn,
    nullif(btrim(coalesce(p_image_path, '')), ''), v_alt,
    p_image_width, p_image_height, p_image_bytes,
    coalesce(p_is_active, false), coalesce(p_is_featured, false),
    v_type.stock_tracked_default, v_sort
  ) returning * into v_product;

  insert into public.inventory_items(product_id, stock_on_hand, stock_reserved, reorder_level)
  values (v_product.id, p_opening_stock, 0, p_reorder_level);

  if p_opening_stock > 0 then
    insert into public.inventory_adjustments(
      product_id, mode, quantity,
      stock_on_hand_before, stock_on_hand_after,
      stock_reserved_before, stock_reserved_after,
      source, reason, actor_id
    ) values (
      v_product.id, 'increase', p_opening_stock,
      0, p_opening_stock, 0, 0,
      'opening_stock', 'Opening stock recorded when the product was created.', v_actor.id
    );
  end if;

  perform private.write_audit_event(
    'product.created', 'products', 'success',
    v_actor.full_name || ' added ' || v_product.name || ' to the ' ||
      case v_product.store when 'gas' then 'MRJE Gas' else 'Bright Star Water' end || ' catalog.',
    v_actor.id, v_actor.full_name, 'admin',
    'product', null, v_product.name,
    jsonb_build_object(
      'price', jsonb_build_object('after_centavos', v_product.price_centavos),
      'catalog_state', jsonb_build_object('after', case when v_product.is_active then 'published' else 'draft' end),
      'opening_stock', jsonb_build_object('after', p_opening_stock)
    ),
    jsonb_build_object(
      'product_id', v_product.id,
      'sku', v_product.sku,
      'store', v_product.store,
      'product_type', v_product.product_type_code,
      'image_uploaded', v_product.image_path is not null
    ),
    null, p_request_id, 'admin_dashboard', p_client_ip, p_user_agent
  );

  return v_product;
end;
$$;

revoke all on function public.admin_create_product(uuid, text, text, text, text, text, numeric, bigint, text, text, text, text, text, integer, integer, integer, boolean, boolean, integer, integer, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.admin_create_product(uuid, text, text, text, text, text, numeric, bigint, text, text, text, text, text, integer, integer, integer, boolean, boolean, integer, integer, uuid, text, text)
  to service_role;

create or replace function public.admin_update_product(
  p_actor_id uuid,
  p_product_id text,
  p_product_type_code text,
  p_name text,
  p_short_description text,
  p_description text,
  p_size_value numeric,
  p_price_centavos bigint,
  p_brand text,
  p_gtin text,
  p_mpn text,
  p_image_path text,
  p_image_alt text,
  p_image_width integer,
  p_image_height integer,
  p_image_bytes integer,
  p_is_featured boolean,
  p_is_active boolean,
  p_reorder_level integer,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns public.products
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_old public.products;
  v_type public.product_types;
  v_product public.products;
  v_inventory_old public.inventory_items;
  v_inventory public.inventory_items;
  v_slug text;
  v_alt text;
  v_changes jsonb := '{}'::jsonb;
begin
  v_actor := private.assert_catalog_admin(p_actor_id);

  select * into v_old from public.products
  where id = p_product_id and deleted_at is null
  for update;
  if not found then raise exception 'Product not found'; end if;

  select * into v_type from public.product_types
  where code = p_product_type_code and is_active = true;
  if not found then raise exception 'Invalid product type'; end if;
  if v_type.store <> v_old.store then
    raise exception 'A product cannot be moved to a different store after creation';
  end if;

  v_slug := case when btrim(p_name) = v_old.name then v_old.slug else private.next_product_slug(p_name, v_old.id) end;
  v_alt := coalesce(nullif(btrim(coalesce(p_image_alt, '')), ''), btrim(p_name) || case v_old.store when 'gas' then ' from MRJE Gas' else ' from Bright Star Water' end);

  update public.products set
    product_type_code = v_type.code,
    slug = v_slug,
    name = btrim(p_name),
    short_description = btrim(p_short_description),
    description = btrim(p_description),
    sales_unit = v_type.default_sales_unit,
    size_value = case when v_type.requires_size then p_size_value else null end,
    size_unit = case when v_type.requires_size then v_type.default_size_unit else null end,
    price_centavos = p_price_centavos,
    brand = nullif(btrim(coalesce(p_brand, '')), ''),
    gtin = nullif(regexp_replace(coalesce(p_gtin, ''), '[^0-9]', '', 'g'), ''),
    mpn = nullif(btrim(coalesce(p_mpn, '')), ''),
    image_path = nullif(btrim(coalesce(p_image_path, '')), ''),
    image_alt = v_alt,
    image_width = p_image_width,
    image_height = p_image_height,
    image_bytes = p_image_bytes,
    is_featured = coalesce(p_is_featured, false),
    is_active = coalesce(p_is_active, false),
    stock_tracked = v_type.stock_tracked_default
  where id = v_old.id
  returning * into v_product;

  select * into v_inventory_old
  from public.inventory_items
  where product_id = v_product.id
  for update;
  if not found then raise exception 'Inventory item not found'; end if;

  update public.inventory_items
    set reorder_level = p_reorder_level, updated_at = now()
    where product_id = v_product.id
    returning * into v_inventory;

  if v_old.name is distinct from v_product.name then
    v_changes := v_changes || jsonb_build_object('name', jsonb_build_object('before', v_old.name, 'after', v_product.name));
  end if;
  if v_old.price_centavos is distinct from v_product.price_centavos then
    v_changes := v_changes || jsonb_build_object('price', jsonb_build_object('before_centavos', v_old.price_centavos, 'after_centavos', v_product.price_centavos));
  end if;
  if v_old.is_active is distinct from v_product.is_active then
    v_changes := v_changes || jsonb_build_object('catalog_state', jsonb_build_object('before', case when v_old.is_active then 'published' else 'draft' end, 'after', case when v_product.is_active then 'published' else 'draft' end));
  end if;
  if v_old.is_featured is distinct from v_product.is_featured then
    v_changes := v_changes || jsonb_build_object('featured', jsonb_build_object('before', v_old.is_featured, 'after', v_product.is_featured));
  end if;
  if v_old.image_path is distinct from v_product.image_path then
    v_changes := v_changes || jsonb_build_object('product_photo', jsonb_build_object('before', v_old.image_path is not null, 'after', v_product.image_path is not null));
  end if;
  if v_old.product_type_code is distinct from v_product.product_type_code then
    v_changes := v_changes || jsonb_build_object('product_type', jsonb_build_object('before', v_old.product_type_code, 'after', v_product.product_type_code));
  end if;
  if v_old.size_value is distinct from v_product.size_value or v_old.size_unit is distinct from v_product.size_unit then
    v_changes := v_changes || jsonb_build_object(
      'size', jsonb_build_object(
        'before', case when v_old.size_value is null then null else v_old.size_value::text || ' ' || coalesce(v_old.size_unit, '') end,
        'after', case when v_product.size_value is null then null else v_product.size_value::text || ' ' || coalesce(v_product.size_unit, '') end
      )
    );
  end if;
  if v_old.short_description is distinct from v_product.short_description then
    v_changes := v_changes || jsonb_build_object('short_description', jsonb_build_object('before', v_old.short_description, 'after', v_product.short_description));
  end if;
  if v_old.description is distinct from v_product.description then
    v_changes := v_changes || jsonb_build_object('description', jsonb_build_object('before', v_old.description, 'after', v_product.description));
  end if;
  if v_old.brand is distinct from v_product.brand then
    v_changes := v_changes || jsonb_build_object('brand', jsonb_build_object('before', v_old.brand, 'after', v_product.brand));
  end if;
  if v_old.gtin is distinct from v_product.gtin then
    v_changes := v_changes || jsonb_build_object('gtin', jsonb_build_object('before', v_old.gtin, 'after', v_product.gtin));
  end if;
  if v_old.mpn is distinct from v_product.mpn then
    v_changes := v_changes || jsonb_build_object('mpn', jsonb_build_object('before', v_old.mpn, 'after', v_product.mpn));
  end if;
  if v_old.image_alt is distinct from v_product.image_alt then
    v_changes := v_changes || jsonb_build_object('image_alt', jsonb_build_object('before', v_old.image_alt, 'after', v_product.image_alt));
  end if;
  if v_inventory_old.reorder_level is distinct from v_inventory.reorder_level then
    v_changes := v_changes || jsonb_build_object('reorder_level', jsonb_build_object('before', v_inventory_old.reorder_level, 'after', v_inventory.reorder_level));
  end if;

  if v_changes <> '{}'::jsonb then
    perform private.write_audit_event(
      case
        when v_old.image_path is distinct from v_product.image_path then 'product.image_changed'
        when v_old.price_centavos is distinct from v_product.price_centavos then 'product.price_changed'
        when v_old.is_active is distinct from v_product.is_active then 'product.status_changed'
        else 'product.updated'
      end,
      'products', 'success',
      case
        when v_old.image_path is distinct from v_product.image_path then v_actor.full_name || ' replaced the product photo for ' || v_product.name || '.'
        when v_old.price_centavos is distinct from v_product.price_centavos then v_actor.full_name || ' changed the price of ' || v_product.name || '.'
        when v_old.is_active is distinct from v_product.is_active then v_actor.full_name || ' changed ' || v_product.name || ' to ' || case when v_product.is_active then 'Published' else 'Draft' end || '.'
        else v_actor.full_name || ' updated ' || v_product.name || '.'
      end,
      v_actor.id, v_actor.full_name, 'admin',
      'product', null, v_product.name,
      v_changes,
      jsonb_build_object(
        'product_id', v_product.id,
        'sku', v_product.sku,
        'store', v_product.store,
        'product_type', v_product.product_type_code,
        'reorder_level', v_inventory.reorder_level
      ),
      null, p_request_id, 'admin_dashboard', p_client_ip, p_user_agent
    );
  end if;

  return v_product;
end;
$$;

revoke all on function public.admin_update_product(uuid, text, text, text, text, text, numeric, bigint, text, text, text, text, text, integer, integer, integer, boolean, boolean, integer, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.admin_update_product(uuid, text, text, text, text, text, numeric, bigint, text, text, text, text, text, integer, integer, integer, boolean, boolean, integer, uuid, text, text)
  to service_role;

create or replace function public.admin_soft_delete_product(
  p_actor_id uuid,
  p_product_id text,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns public.products
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_product public.products;
  v_inventory public.inventory_items;
begin
  v_actor := private.assert_catalog_admin(p_actor_id);

  select * into v_product
  from public.products
  where id = p_product_id and deleted_at is null
  for update;

  if not found then raise exception 'Product not found'; end if;

  select * into v_inventory
  from public.inventory_items
  where product_id = p_product_id
  for update;

  if not found then raise exception 'Inventory record not found'; end if;
  if v_inventory.stock_reserved > 0 then
    raise exception 'Product has reserved stock';
  end if;

  update public.products
  set deleted_at = now(), is_active = false, is_featured = false
  where id = p_product_id
  returning * into v_product;

  perform private.write_audit_event(
    'product.deleted', 'products', 'success',
    v_actor.full_name || ' removed ' || v_product.name || ' from the active catalog.',
    v_actor.id, v_actor.full_name, 'admin',
    'product', null, v_product.name,
    jsonb_build_object('catalog_state', jsonb_build_object('before', 'available', 'after', 'removed')),
    jsonb_build_object('product_id', v_product.id, 'sku', v_product.sku, 'store', v_product.store),
    null, p_request_id, 'admin_dashboard', p_client_ip, p_user_agent
  );

  return v_product;
end;
$$;

revoke all on function public.admin_soft_delete_product(uuid, text, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.admin_soft_delete_product(uuid, text, uuid, text, text)
  to service_role;

create or replace function public.admin_adjust_product_inventory(
  p_actor_id uuid,
  p_product_id text,
  p_mode text,
  p_quantity integer,
  p_reason text,
  p_request_id uuid,
  p_client_ip text,
  p_user_agent text
)
returns public.inventory_items
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor public.profiles;
  v_product public.products;
  v_before public.inventory_items;
  v_after public.inventory_items;
  v_stock integer;
  v_reason text := btrim(coalesce(p_reason, ''));
begin
  v_actor := private.assert_catalog_admin(p_actor_id);
  if p_mode not in ('increase', 'decrease', 'set') then raise exception 'Invalid inventory mode'; end if;
  if p_quantity < 0 or (p_mode <> 'set' and p_quantity = 0) then raise exception 'Invalid inventory quantity'; end if;
  if char_length(v_reason) < 4 or char_length(v_reason) > 300 then raise exception 'Invalid inventory reason'; end if;

  select * into v_product from public.products where id = p_product_id and deleted_at is null;
  if not found then raise exception 'Product not found'; end if;

  select * into v_before from public.inventory_items where product_id = p_product_id for update;
  if not found then raise exception 'Inventory item not found'; end if;

  v_stock := case p_mode
    when 'increase' then v_before.stock_on_hand + p_quantity
    when 'decrease' then v_before.stock_on_hand - p_quantity
    else p_quantity
  end;

  if v_stock < v_before.stock_reserved then
    raise exception 'Physical stock cannot be below reserved stock';
  end if;

  update public.inventory_items
  set stock_on_hand = v_stock, updated_at = now()
  where product_id = p_product_id
  returning * into v_after;

  insert into public.inventory_adjustments(
    product_id, mode, quantity,
    stock_on_hand_before, stock_on_hand_after,
    stock_reserved_before, stock_reserved_after,
    source, reason, actor_id
  ) values (
    p_product_id, p_mode, p_quantity,
    v_before.stock_on_hand, v_after.stock_on_hand,
    v_before.stock_reserved, v_after.stock_reserved,
    'admin_adjustment', v_reason, v_actor.id
  );

  perform private.write_audit_event(
    'inventory.adjusted', 'inventory', 'success',
    v_actor.full_name || ' adjusted the stock of ' || v_product.name || ' from ' || v_before.stock_on_hand || ' to ' || v_after.stock_on_hand || ' units.',
    v_actor.id, v_actor.full_name, 'admin',
    'product', null, v_product.name,
    jsonb_build_object('stock_on_hand', jsonb_build_object('before', v_before.stock_on_hand, 'after', v_after.stock_on_hand)),
    jsonb_build_object('product_id', v_product.id, 'sku', v_product.sku, 'mode', p_mode, 'quantity', p_quantity),
    v_reason, p_request_id, 'admin_dashboard', p_client_ip, p_user_agent
  );

  return v_after;
end;
$$;

revoke all on function public.admin_adjust_product_inventory(uuid, text, text, integer, text, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.admin_adjust_product_inventory(uuid, text, text, integer, text, uuid, text, text)
  to service_role;
