import type { EntityId } from './shared';

export interface CartLine {
  productId: EntityId;
  quantity: number;
}

