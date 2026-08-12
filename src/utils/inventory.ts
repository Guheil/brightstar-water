import type { InventoryItem } from '@/types';

export const getAvailableStock = (item: InventoryItem): number =>
  Math.max(0, item.stockOnHand - item.stockReserved);

export const isLowStock = (item: InventoryItem): boolean =>
  getAvailableStock(item) <= item.reorderLevel;

export const canReserveStock = (item: InventoryItem, quantity: number): boolean =>
  Number.isInteger(quantity) && quantity > 0 && getAvailableStock(item) >= quantity;

