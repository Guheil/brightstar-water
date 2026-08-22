-- Controlled product taxonomy, SKU counters, initial catalog, and opening inventory.
-- Controlled product types. These are the source of truth for dropdown/radio options.
insert into public.product_types (
  code, store, label, requires_size, allowed_size_values,
  default_size_unit, default_sales_unit, stock_tracked_default, sort_order
) values
  ('lpg_refill', 'gas', 'LPG Refill', true, array[2.7,5,11,22,50]::numeric[], 'kg', 'refill', true, 10),
  ('lpg_cylinder', 'gas', 'LPG Cylinder', true, array[2.7,5,11,22,50]::numeric[], 'kg', 'cylinder', true, 20),
  ('lpg_regulator', 'gas', 'LPG Regulator', false, '{}'::numeric[], null, 'piece', true, 30),
  ('lpg_hose', 'gas', 'LPG Hose', true, array[1.5,3]::numeric[], 'meter', 'piece', true, 40),
  ('lpg_hose_clamp', 'gas', 'LPG Hose Clamp', false, '{}'::numeric[], null, 'piece', true, 50),
  ('gas_accessory', 'gas', 'Gas Accessory', false, '{}'::numeric[], null, 'piece', true, 60),
  ('water_refill', 'water', 'Purified Water Refill', true, array[1,3,5]::numeric[], 'gallon', 'refill', true, 10),
  ('water_container', 'water', 'Water Container', true, array[3,5]::numeric[], 'gallon', 'container', true, 20),
  ('manual_dispenser', 'water', 'Manual Dispenser', false, '{}'::numeric[], null, 'piece', true, 30),
  ('electric_dispenser', 'water', 'Electric Dispenser', false, '{}'::numeric[], null, 'piece', true, 40),
  ('container_faucet', 'water', 'Container Faucet', false, '{}'::numeric[], null, 'piece', true, 50),
  ('container_cap', 'water', 'Container Cap', false, '{}'::numeric[], null, 'piece', true, 60),
  ('dispenser_stand', 'water', 'Dispenser Stand', false, '{}'::numeric[], null, 'piece', true, 70),
  ('water_accessory', 'water', 'Water Accessory', false, '{}'::numeric[], null, 'piece', true, 80)
on conflict (code) do update set
  store = excluded.store,
  label = excluded.label,
  requires_size = excluded.requires_size,
  allowed_size_values = excluded.allowed_size_values,
  default_size_unit = excluded.default_size_unit,
  default_sales_unit = excluded.default_sales_unit,
  stock_tracked_default = excluded.stock_tracked_default,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.product_sku_counters(store, last_value)
values ('gas', 10), ('water', 10)
on conflict (store) do update set last_value = greatest(public.product_sku_counters.last_value, excluded.last_value);

-- Initial 20-product catalog. Existing six product IDs are preserved so current
-- order/cart fixtures remain referentially compatible during the wider backend migration.
insert into public.products (
  id, product_type_code, store, sku, slug, name,
  short_description, description, sales_unit, size_value, size_unit,
  price_centavos, brand, image_path, image_alt,
  is_active, is_featured, stock_tracked, sort_order,
  created_at, updated_at
) values
  ('product-gas-2-7kg', 'lpg_refill', 'gas', 'MRJE-000001', 'lpg-refill-2-7kg', '2.7 kg LPG refill', 'Compact LPG refill for light household cooking.', 'A 2.7 kg LPG refill prepared for scheduled local delivery and light household cooking.', 'refill', 2.7, 'kg', 30000, 'MRJE', null, '2.7 kg LPG refill from MRJE Gas', true, false, true, 10, now(), now()),
  ('product-gas-5kg', 'lpg_refill', 'gas', 'MRJE-000002', 'lpg-refill-5kg', '5 kg LPG refill', 'Practical LPG refill for smaller households.', 'A 5 kg LPG refill prepared for scheduled delivery for households with moderate cooking needs.', 'refill', 5, 'kg', 48000, 'MRJE', null, '5 kg LPG refill from MRJE Gas', true, false, true, 20, now(), now()),
  ('product-gas-11kg', 'lpg_refill', 'gas', 'MRJE-000003', 'lpg-refill-11kg', '11 kg LPG refill', 'Everyday cylinder refill for household cooking.', 'An 11 kg LPG cylinder refill prepared for scheduled delivery within the service area.', 'refill', 11, 'kg', 92000, 'MRJE', null, '11 kg LPG refill from MRJE Gas', true, true, true, 30, now(), now()),
  ('product-gas-22kg', 'lpg_refill', 'gas', 'MRJE-000004', 'lpg-refill-22kg', '22 kg LPG refill', 'Larger refill option for higher-use households.', 'A 22 kg LPG cylinder refill for households and businesses with higher cooking usage.', 'refill', 22, 'kg', 178000, 'MRJE', null, '22 kg LPG refill from MRJE Gas', true, false, true, 40, now(), now()),
  ('product-gas-50kg', 'lpg_refill', 'gas', 'MRJE-000005', 'lpg-refill-50kg', '50 kg LPG refill', 'High-capacity LPG refill for heavy daily use.', 'A 50 kg LPG refill intended for higher-volume cooking requirements and compatible cylinder setups.', 'refill', 50, 'kg', 390000, 'MRJE', null, '50 kg LPG refill from MRJE Gas', true, false, true, 50, now(), now()),
  ('product-gas-regulator', 'lpg_regulator', 'gas', 'MRJE-000006', 'standard-lpg-regulator', 'Standard LPG regulator', 'Basic replacement regulator for compatible cylinders.', 'A standard replacement regulator for compatible LPG cylinders. Confirm compatibility before ordering.', 'piece', null, null, 35000, 'Unbranded', null, 'Standard LPG regulator for MRJE Gas customers', true, true, true, 60, now(), now()),
  ('product-gas-regulator-heavy', 'lpg_regulator', 'gas', 'MRJE-000007', 'heavy-duty-lpg-regulator', 'Heavy-duty LPG regulator', 'Higher-capacity regulator for compatible LPG setups.', 'A heavy-duty LPG regulator for compatible cylinder systems that require a sturdier replacement regulator.', 'piece', null, null, 65000, 'Unbranded', null, 'Heavy-duty LPG regulator for MRJE Gas customers', true, false, true, 70, now(), now()),
  ('product-gas-hose-1-5m', 'lpg_hose', 'gas', 'MRJE-000008', 'lpg-hose-1-5m', '1.5 m LPG hose', 'Replacement LPG hose for compatible household setups.', 'A 1.5 meter LPG hose for compatible regulators and household cooking equipment.', 'piece', 1.5, 'meter', 18000, 'Unbranded', null, '1.5 meter LPG hose from MRJE Gas', true, false, true, 80, now(), now()),
  ('product-gas-hose-3m', 'lpg_hose', 'gas', 'MRJE-000009', 'lpg-hose-3m', '3 m LPG hose', 'Longer replacement LPG hose for compatible setups.', 'A 3 meter LPG hose for compatible regulators and cooking equipment where additional reach is needed.', 'piece', 3, 'meter', 30000, 'Unbranded', null, '3 meter LPG hose from MRJE Gas', true, false, true, 90, now(), now()),
  ('product-gas-clamp-pair', 'lpg_hose_clamp', 'gas', 'MRJE-000010', 'lpg-hose-clamp-pair', 'LPG hose clamp pair', 'Two replacement clamps for securing compatible LPG hoses.', 'A pair of metal hose clamps intended for securing compatible LPG hose connections.', 'piece', null, null, 8000, 'Unbranded', null, 'Pair of LPG hose clamps from MRJE Gas', true, false, true, 100, now(), now()),

  ('product-water-refill-1gal', 'water_refill', 'water', 'BSW-000001', 'purified-water-refill-1gal', '1 gallon purified water refill', 'Small purified water refill for a clean customer container.', 'A one-gallon purified water refill for a clean and compatible customer-provided container.', 'refill', 1, 'gallon', 1000, 'Bright Star', null, '1 gallon purified water refill from Bright Star Water', true, false, true, 10, now(), now()),
  ('product-water-refill-3gal', 'water_refill', 'water', 'BSW-000002', 'purified-water-refill-3gal', '3 gallon purified water refill', 'Mid-size purified water refill for household use.', 'A three-gallon purified water refill for a clean and compatible customer-provided container.', 'refill', 3, 'gallon', 2500, 'Bright Star', null, '3 gallon purified water refill from Bright Star Water', true, false, true, 20, now(), now()),
  ('product-water-refill', 'water_refill', 'water', 'BSW-000003', 'purified-water-refill-5gal', '5 gallon purified water refill', 'Purified water refill for a customer-provided container.', 'A five-gallon purified water refill for a clean, customer-provided container.', 'refill', 5, 'gallon', 3500, 'Bright Star', null, '5 gallon purified water refill from Bright Star Water', true, true, true, 30, now(), now()),
  ('product-water-container-3gal', 'water_container', 'water', 'BSW-000004', 'new-water-container-3gal', 'New 3 gallon water container', 'New three-gallon container for purified water.', 'A new three-gallon water container supplied ready for purified water use.', 'container', 3, 'gallon', 20000, 'Bright Star', null, 'New 3 gallon water container from Bright Star Water', true, false, true, 40, now(), now()),
  ('product-water-container', 'water_container', 'water', 'BSW-000005', 'new-water-container-5gal', 'New 5 gallon water container', 'New container supplied with purified water.', 'A new five-gallon container supplied with purified water and ready for household use.', 'container', 5, 'gallon', 28000, 'Bright Star', null, 'New 5 gallon water container from Bright Star Water', true, false, true, 50, now(), now()),
  ('product-water-pump', 'manual_dispenser', 'water', 'BSW-000006', 'manual-water-dispenser-pump', 'Manual dispenser pump', 'Simple hand pump for compatible water containers.', 'A manual dispenser pump designed for compatible three-gallon and five-gallon water containers.', 'piece', null, null, 18000, 'Unbranded', null, 'Manual dispenser pump for Bright Star Water containers', true, true, true, 60, now(), now()),
  ('product-water-pump-electric', 'electric_dispenser', 'water', 'BSW-000007', 'rechargeable-electric-dispenser-pump', 'Rechargeable electric dispenser pump', 'Rechargeable pump for compatible household water containers.', 'A rechargeable electric dispenser pump for compatible water containers and convenient countertop dispensing.', 'piece', null, null, 45000, 'Unbranded', null, 'Rechargeable electric dispenser pump for Bright Star Water containers', true, false, true, 70, now(), now()),
  ('product-water-faucet', 'container_faucet', 'water', 'BSW-000008', 'replacement-water-container-faucet', 'Replacement water container faucet', 'Replacement faucet for compatible water containers.', 'A replacement faucet intended for compatible water containers and dispenser setups.', 'piece', null, null, 9000, 'Unbranded', null, 'Replacement water container faucet for Bright Star Water customers', true, false, true, 80, now(), now()),
  ('product-water-cap-set', 'container_cap', 'water', 'BSW-000009', 'water-container-cap-set', 'Water container cap set', 'Replacement cap set for compatible refillable containers.', 'A replacement cap set for compatible refillable water containers used for storage and transport.', 'piece', null, null, 6000, 'Unbranded', null, 'Water container cap set from Bright Star Water', true, false, true, 90, now(), now()),
  ('product-water-stand', 'dispenser_stand', 'water', 'BSW-000010', 'water-dispenser-stand', 'Water dispenser stand', 'Stable floor stand for compatible water containers.', 'A freestanding support for compatible household water containers and manual dispensing setups.', 'piece', null, null, 55000, 'Unbranded', null, 'Water dispenser stand for Bright Star Water containers', true, false, true, 100, now(), now())
on conflict (id) do nothing;

insert into public.inventory_items(product_id, stock_on_hand, stock_reserved, reorder_level)
values
  ('product-gas-2-7kg', 24, 0, 6),
  ('product-gas-5kg', 20, 0, 5),
  ('product-gas-11kg', 18, 1, 5),
  ('product-gas-22kg', 7, 1, 3),
  ('product-gas-50kg', 3, 0, 1),
  ('product-gas-regulator', 9, 0, 3),
  ('product-gas-regulator-heavy', 5, 0, 2),
  ('product-gas-hose-1-5m', 14, 0, 4),
  ('product-gas-hose-3m', 10, 0, 3),
  ('product-gas-clamp-pair', 25, 0, 8),
  ('product-water-refill-1gal', 60, 4, 15),
  ('product-water-refill-3gal', 52, 4, 14),
  ('product-water-refill', 46, 6, 12),
  ('product-water-container-3gal', 18, 1, 5),
  ('product-water-container', 12, 1, 4),
  ('product-water-pump', 6, 0, 2),
  ('product-water-pump-electric', 8, 0, 2),
  ('product-water-faucet', 20, 0, 5),
  ('product-water-cap-set', 30, 0, 8),
  ('product-water-stand', 4, 0, 2)
on conflict (product_id) do nothing;

comment on table public.products is 'MRJE Gas and Bright Star Water catalog. Browser roles have no direct table access; catalog reads are projected through server routes.';
comment on table public.product_types is 'Controlled product taxonomy used by Admin form choices and database validation.';
comment on table public.inventory_items is 'Current physical and reserved stock per product. Product availability is derived from this table.';
comment on table public.inventory_adjustments is 'Append-oriented stock adjustment history used by Admin Inventory and audit traceability.';
