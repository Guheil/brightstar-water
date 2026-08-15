import type { ProductCategory } from '@/types';

export type ShopCategoryFilter = 'all' | ProductCategory | 'accessories';
export type ShopSort = 'featured' | 'price-low' | 'price-high' | 'name';

export interface ShopScreenProps {
  coverageHref?: string;
  initialCategory?: string;
  initialQuery?: string;
  introduction?: string;
  lockedCategory?: ProductCategory;
  productHrefPrefix?: string;
  title?: string;
}

export interface ShopProductView {
  availableStock: number;
  category: ProductCategory;
  id: string;
  imageAlt: string;
  imageSrc: string;
  isAvailable: boolean;
  name: string;
  priceCentavos: number;
  shortDescription: string;
  unit: string;
}
