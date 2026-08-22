import type { PreparedProductImage } from '@/lib/catalog/imageClient';
import type { Product, ProductCategory, ProductTypeDefinition } from '@/types';

export interface ProductFormScreenProps {
  productId?: string;
}

export type ProductStoreChoice = ProductCategory | '';
export type BrandChoice = 'MRJE' | 'Bright Star' | 'Unbranded' | 'Other';

export interface ProductFormState {
  store: ProductStoreChoice;
  productTypeCode: string;
  sizeValue: string;
  name: string;
  shortDescription: string;
  description: string;
  pricePesos: string;
  brandChoice: BrandChoice;
  customBrand: string;
  imageAlt: string;
  gtin: string;
  mpn: string;
  isFeatured: boolean;
  openingStock: string;
  reorderLevel: string;
}

export interface ProductFormLoadedState {
  product: Product | null;
  productTypes: ProductTypeDefinition[];
}

export type ProductImageSelection = PreparedProductImage;
