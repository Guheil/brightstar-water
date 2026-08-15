import type { ProductCategory } from '@/types';

export interface ProductDetailScreenProps {
  deliveryHref?: string;
  expectedCategory?: ProductCategory;
  productId: string;
  shopHref?: string;
}
