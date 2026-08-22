import type { InventoryItem, Product, ProductCategory } from '@/types';

export interface ProductDetailScreenProps {
  deliveryHref?: string;
  expectedCategory?: ProductCategory;
  productId: string;
  initialProduct?: Product | null;
  initialInventory?: InventoryItem | null;
  shopHref?: string;
}
