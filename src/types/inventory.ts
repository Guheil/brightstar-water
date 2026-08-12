import type { EntityId, ISODateString } from './shared';

export interface InventoryItem {
  productId: EntityId;
  stockOnHand: number;
  stockReserved: number;
  reorderLevel: number;
  updatedAt: ISODateString;
}

export type InventoryAdjustmentMode =
  | 'increase'
  | 'decrease'
  | 'set'
  | 'reserve'
  | 'release'
  | 'commit';
export type InventoryAdjustmentSource =
  | 'admin_adjustment'
  | 'order_reservation'
  | 'order_release'
  | 'order_commit';

export interface InventoryAdjustment {
  id: EntityId;
  productId: EntityId;
  mode: InventoryAdjustmentMode;
  quantity: number;
  stockOnHandBefore: number;
  stockOnHandAfter: number;
  stockReservedBefore: number;
  stockReservedAfter: number;
  source: InventoryAdjustmentSource;
  reason: string;
  actorId: EntityId | 'system';
  createdAt: ISODateString;
}

export type InventoryReservationStatus =
  | 'not_required'
  | 'reserved'
  | 'released'
  | 'committed';
