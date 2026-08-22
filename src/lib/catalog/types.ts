import type {
  InventoryAdjustment,
  InventoryItem,
  Product,
  ProductCategory,
  ProductSizeUnit,
  ProductTypeDefinition,
} from '@/types';

export interface CatalogSnapshot {
  products: Product[];
  inventory: InventoryItem[];
}

export interface AdminCatalogSnapshot extends CatalogSnapshot {
  productTypes: ProductTypeDefinition[];
  adjustments: InventoryAdjustment[];
}

export interface ProductImageMeta {
  path: string;
  publicUrl: string;
  width: number;
  height: number;
  bytes: number;
}

export interface ProductMutationInput {
  productTypeCode: string;
  name: string;
  shortDescription: string;
  description: string;
  sizeValue: number | null;
  priceCentavos: number;
  brand: string | null;
  gtin: string | null;
  mpn: string | null;
  imageAlt: string;
  isFeatured: boolean;
  isActive: boolean;
  reorderLevel: number;
  openingStock?: number;
}

export interface ProductFormOptionView {
  code: string;
  label: string;
  store: ProductCategory;
  requiresSize: boolean;
  allowedSizeValues: number[];
  defaultSizeUnit: ProductSizeUnit | null;
}
