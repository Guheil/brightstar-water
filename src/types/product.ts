import type { AuditStamp, EntityId, MoneyCentavos } from './shared';

export type ProductCategory = 'gas' | 'water';
export type ProductUnit = 'cylinder' | 'refill' | 'container' | 'piece';

export interface Product extends AuditStamp {
  id: EntityId;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ProductCategory;
  unit: ProductUnit;
  priceCentavos: MoneyCentavos;
  imageSrc: string;
  imageAlt: string;
  isActive: boolean;
  isFeatured: boolean;
  stockTracked: true;
}

