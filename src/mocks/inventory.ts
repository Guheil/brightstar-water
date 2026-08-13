import type { InventoryAdjustment, InventoryItem } from '@/types';

const INVENTORY_UPDATED_AT = '2026-08-10T09:00:00.000Z';

export const INVENTORY_FIXTURES: InventoryItem[] = [
  {
    productId: 'product-gas-11kg',
    stockOnHand: 18,
    stockReserved: 1,
    reorderLevel: 5,
    updatedAt: INVENTORY_UPDATED_AT,
  },
  {
    productId: 'product-gas-22kg',
    stockOnHand: 7,
    stockReserved: 1,
    reorderLevel: 3,
    updatedAt: INVENTORY_UPDATED_AT,
  },
  {
    productId: 'product-gas-regulator',
    stockOnHand: 9,
    stockReserved: 0,
    reorderLevel: 3,
    updatedAt: INVENTORY_UPDATED_AT,
  },
  {
    productId: 'product-water-refill',
    stockOnHand: 46,
    stockReserved: 6,
    reorderLevel: 12,
    updatedAt: INVENTORY_UPDATED_AT,
  },
  {
    productId: 'product-water-container',
    stockOnHand: 12,
    stockReserved: 1,
    reorderLevel: 4,
    updatedAt: INVENTORY_UPDATED_AT,
  },
  {
    productId: 'product-water-pump',
    stockOnHand: 6,
    stockReserved: 0,
    reorderLevel: 2,
    updatedAt: INVENTORY_UPDATED_AT,
  },
];

export const INVENTORY_ADJUSTMENT_FIXTURES: InventoryAdjustment[] = [
  {
    id: 'inventory-event-0001',
    productId: 'product-water-refill',
    mode: 'increase',
    quantity: 20,
    stockOnHandBefore: 28,
    stockOnHandAfter: 48,
    stockReservedBefore: 0,
    stockReservedAfter: 0,
    source: 'admin_adjustment',
    reason: 'Opening stock count.',
    actorId: 'user-admin-demo',
    createdAt: '2026-08-01T08:15:00.000Z',
  },
  {
    id: 'inventory-event-0002',
    productId: 'product-gas-11kg',
    mode: 'decrease',
    quantity: 1,
    stockOnHandBefore: 19,
    stockOnHandAfter: 18,
    stockReservedBefore: 1,
    stockReservedAfter: 0,
    source: 'order_commit',
    reason: 'Committed by delivered order MRJE-0003.',
    actorId: 'system',
    createdAt: '2026-08-09T06:35:00.000Z',
  },
];
