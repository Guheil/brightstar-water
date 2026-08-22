import type { AuditStamp, EntityId, MoneyCentavos } from './shared';

export type ProductCategory = 'gas' | 'water';
export type ProductUnit = 'cylinder' | 'refill' | 'container' | 'piece';
export type ProductSizeUnit = 'kg' | 'gallon' | 'liter' | 'meter';

export interface ProductTypeDefinition {
  code: string;
  store: ProductCategory;
  label: string;
  requiresSize: boolean;
  allowedSizeValues: number[];
  defaultSizeUnit: ProductSizeUnit | null;
  defaultSalesUnit: ProductUnit;
  stockTrackedDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface Product extends AuditStamp {
  id: EntityId;
  productTypeCode: string;
  productTypeLabel: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  unit: ProductUnit;
  sizeValue: number | null;
  sizeUnit: ProductSizeUnit | null;
  priceCentavos: MoneyCentavos;
  currencyCode: 'PHP';
  brand: string | null;
  gtin: string | null;
  mpn: string | null;
  imagePath: string | null;
  imageSrc: string;
  imageAlt: string;
  imageWidth: number | null;
  imageHeight: number | null;
  imageBytes: number | null;
  isActive: boolean;
  isFeatured: boolean;
  stockTracked: boolean;
  sortOrder: number;
  deletedAt: string | null;
}
