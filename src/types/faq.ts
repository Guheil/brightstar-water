import type { BrandKey } from '@/config/brands';

export type FaqCategoryId =
  | 'ordering'
  | 'delivery'
  | 'payments'
  | 'orders'
  | 'account'
  | 'products';

export type FaqContextTag =
  | 'home'
  | 'shop'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'delivery'
  | 'payments'
  | 'orders'
  | 'addresses'
  | 'account'
  | 'loyalty'
  | 'mrje'
  | 'brightstar';

export interface FaqCategory {
  id: FaqCategoryId;
  label: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategoryId;
  keywords: readonly string[];
  contextTags: readonly FaqContextTag[];
  brands?: readonly BrandKey[];
}

export interface FaqContext {
  pathname: string;
  brandKey?: BrandKey | null;
}
