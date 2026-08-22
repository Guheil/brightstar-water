import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { STOREFRONT_MEDIA } from '@/config';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
  InventoryAdjustment,
  InventoryAdjustmentMode,
  InventoryAdjustmentSource,
  InventoryItem,
  Product,
  ProductCategory,
  ProductSizeUnit,
  ProductTypeDefinition,
  ProductUnit,
} from '@/types';
import type { AdminCatalogSnapshot, CatalogSnapshot } from './types';
import { productIdSchema } from './validation';

interface ProductTypeRow {
  code: string;
  store: ProductCategory;
  label: string;
  requires_size: boolean;
  allowed_size_values: Array<number | string> | null;
  default_size_unit: ProductSizeUnit | null;
  default_sales_unit: ProductUnit;
  stock_tracked_default: boolean;
  is_active: boolean;
  sort_order: number;
}

interface ProductRow {
  id: string;
  product_type_code: string;
  store: ProductCategory;
  sku: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  sales_unit: ProductUnit;
  size_value: number | string | null;
  size_unit: ProductSizeUnit | null;
  price_centavos: number | string;
  currency_code: 'PHP';
  brand: string | null;
  gtin: string | null;
  mpn: string | null;
  image_path: string | null;
  image_alt: string;
  image_width: number | null;
  image_height: number | null;
  image_bytes: number | null;
  is_active: boolean;
  is_featured: boolean;
  stock_tracked: boolean;
  sort_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface InventoryRow {
  product_id: string;
  stock_on_hand: number;
  stock_reserved: number;
  reorder_level: number;
  updated_at: string;
}

interface InventoryAdjustmentRow {
  id: string;
  product_id: string;
  mode: InventoryAdjustmentMode;
  quantity: number;
  stock_on_hand_before: number;
  stock_on_hand_after: number;
  stock_reserved_before: number;
  stock_reserved_after: number;
  source: InventoryAdjustmentSource;
  reason: string;
  actor_id: string | null;
  created_at: string;
}

const PRODUCT_SELECT = [
  'id',
  'product_type_code',
  'store',
  'sku',
  'slug',
  'name',
  'short_description',
  'description',
  'sales_unit',
  'size_value',
  'size_unit',
  'price_centavos',
  'currency_code',
  'brand',
  'gtin',
  'mpn',
  'image_path',
  'image_alt',
  'image_width',
  'image_height',
  'image_bytes',
  'is_active',
  'is_featured',
  'stock_tracked',
  'sort_order',
  'deleted_at',
  'created_at',
  'updated_at',
].join(',');

const PRODUCT_TYPE_SELECT =
  'code,store,label,requires_size,allowed_size_values,default_size_unit,default_sales_unit,stock_tracked_default,is_active,sort_order';
const INVENTORY_SELECT = 'product_id,stock_on_hand,stock_reserved,reorder_level,updated_at';
const ADJUSTMENT_SELECT =
  'id,product_id,mode,quantity,stock_on_hand_before,stock_on_hand_after,stock_reserved_before,stock_reserved_after,source,reason,actor_id,created_at';

function mapProductType(row: ProductTypeRow): ProductTypeDefinition {
  return {
    code: row.code,
    store: row.store,
    label: row.label,
    requiresSize: row.requires_size,
    allowedSizeValues: (row.allowed_size_values ?? []).map(Number).filter(Number.isFinite),
    defaultSizeUnit: row.default_size_unit,
    defaultSalesUnit: row.default_sales_unit,
    stockTrackedDefault: row.stock_tracked_default,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

function fallbackImage(category: ProductCategory, productTypeCode: string): string {
  if (category === 'gas') {
    return productTypeCode === 'lpg_refill'
      ? STOREFRONT_MEDIA.gas.hero.src
      : STOREFRONT_MEDIA.gas.cylinder.src;
  }
  return productTypeCode === 'water_refill'
    ? STOREFRONT_MEDIA.water.hero.src
    : STOREFRONT_MEDIA.water.dispenser.src;
}

function mapProduct(
  client: SupabaseClient,
  row: ProductRow,
  productTypes: ReadonlyMap<string, ProductTypeDefinition>,
): Product {
  const imageSrc = row.image_path
    ? client.storage.from('product-images').getPublicUrl(row.image_path).data.publicUrl
    : fallbackImage(row.store, row.product_type_code);

  return {
    id: row.id,
    productTypeCode: row.product_type_code,
    productTypeLabel: productTypes.get(row.product_type_code)?.label ?? row.product_type_code,
    slug: row.slug,
    sku: row.sku,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    category: row.store,
    unit: row.sales_unit,
    sizeValue: row.size_value == null ? null : Number(row.size_value),
    sizeUnit: row.size_unit,
    priceCentavos: Number(row.price_centavos),
    currencyCode: row.currency_code,
    brand: row.brand,
    gtin: row.gtin,
    mpn: row.mpn,
    imagePath: row.image_path,
    imageSrc,
    imageAlt: row.image_alt,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    imageBytes: row.image_bytes,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    stockTracked: row.stock_tracked,
    sortOrder: row.sort_order,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapInventory(row: InventoryRow): InventoryItem {
  return {
    productId: row.product_id,
    stockOnHand: row.stock_on_hand,
    stockReserved: row.stock_reserved,
    reorderLevel: row.reorder_level,
    updatedAt: row.updated_at,
  };
}

function mapAdjustment(row: InventoryAdjustmentRow): InventoryAdjustment {
  return {
    id: row.id,
    productId: row.product_id,
    mode: row.mode,
    quantity: row.quantity,
    stockOnHandBefore: row.stock_on_hand_before,
    stockOnHandAfter: row.stock_on_hand_after,
    stockReservedBefore: row.stock_reserved_before,
    stockReservedAfter: row.stock_reserved_after,
    source: row.source,
    reason: row.reason,
    actorId: row.actor_id ?? 'system',
    createdAt: row.created_at,
  };
}

async function loadProductTypes(client: SupabaseClient): Promise<ProductTypeDefinition[]> {
  const { data, error } = await client
    .from('product_types')
    .select(PRODUCT_TYPE_SELECT)
    .eq('is_active', true)
    .order('store')
    .order('sort_order');
  if (error) throw error;
  return ((data ?? []) as ProductTypeRow[]).map(mapProductType);
}

async function loadInventory(client: SupabaseClient, productIds: string[]): Promise<InventoryItem[]> {
  if (!productIds.length) return [];
  const { data, error } = await client
    .from('inventory_items')
    .select(INVENTORY_SELECT)
    .in('product_id', productIds);
  if (error) throw error;
  return ((data ?? []) as InventoryRow[]).map(mapInventory);
}

export async function getPublicCatalogSnapshot(): Promise<CatalogSnapshot> {
  const client = createAdminClient();
  const productTypes = await loadProductTypes(client);
  const productTypeMap = new Map(productTypes.map((item) => [item.code, item]));
  const { data, error } = await client
    .from('products')
    .select(PRODUCT_SELECT)
    .is('deleted_at', null)
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('sort_order')
    .order('name');
  if (error) throw error;

  const products = ((data ?? []) as unknown as ProductRow[]).map((row) =>
    mapProduct(client, row, productTypeMap),
  );
  const inventory = await loadInventory(client, products.map((product) => product.id));
  return { products, inventory };
}

export async function getAdminCatalogSnapshot(): Promise<AdminCatalogSnapshot> {
  const client = createAdminClient();
  const productTypes = await loadProductTypes(client);
  const productTypeMap = new Map(productTypes.map((item) => [item.code, item]));
  const [{ data: productRows, error: productError }, { data: adjustmentRows, error: adjustmentError }] =
    await Promise.all([
      client
        .from('products')
        .select(PRODUCT_SELECT)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .order('id'),
      client
        .from('inventory_adjustments')
        .select(ADJUSTMENT_SELECT)
        .order('created_at', { ascending: false })
        .limit(200),
    ]);

  if (productError) throw productError;
  if (adjustmentError) throw adjustmentError;

  const products = ((productRows ?? []) as unknown as ProductRow[]).map((row) =>
    mapProduct(client, row, productTypeMap),
  );
  const inventory = await loadInventory(client, products.map((product) => product.id));

  return {
    products,
    inventory,
    productTypes,
    adjustments: ((adjustmentRows ?? []) as InventoryAdjustmentRow[]).map(mapAdjustment),
  };
}

export async function getAdminProduct(productId: string): Promise<{
  product: Product;
  inventory: InventoryItem | null;
  productTypes: ProductTypeDefinition[];
} | null> {
  const parsedId = productIdSchema.safeParse(productId);
  if (!parsedId.success) return null;

  const client = createAdminClient();
  const productTypes = await loadProductTypes(client);
  const productTypeMap = new Map(productTypes.map((item) => [item.code, item]));
  const { data, error } = await client
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', parsedId.data)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const product = mapProduct(client, data as unknown as ProductRow, productTypeMap);
  const inventory = (await loadInventory(client, [product.id]))[0] ?? null;
  return { product, inventory, productTypes };
}

export async function getPublicProduct(identifier: string): Promise<{
  product: Product;
  inventory: InventoryItem | null;
} | null> {
  const cleanIdentifier = identifier.trim().slice(0, 160);
  if (!cleanIdentifier) return null;

  const client = createAdminClient();
  const productTypes = await loadProductTypes(client);
  const productTypeMap = new Map(productTypes.map((item) => [item.code, item]));

  const parsedId = productIdSchema.safeParse(cleanIdentifier);
  const parsedSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanIdentifier)
    ? cleanIdentifier
    : null;
  if (!parsedId.success && !parsedSlug) return null;

  let query = client
    .from('products')
    .select(PRODUCT_SELECT)
    .is('deleted_at', null)
    .eq('is_active', true);
  query = parsedId.success
    ? query.eq('id', parsedId.data)
    : query.eq('slug', parsedSlug as string);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const product = mapProduct(client, data as unknown as ProductRow, productTypeMap);
  const inventory = (await loadInventory(client, [product.id]))[0] ?? null;
  return { product, inventory };
}
