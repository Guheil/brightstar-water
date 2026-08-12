import type { ReactNode } from 'react';
import type { CartLine, EntityId } from '@/types';

export interface CustomerCartContextValue {
  items: CartLine[];
  itemCount: number;
  lastPlacedOrderId: EntityId | null;
  addItem(productId: EntityId, quantity?: number): void;
  updateQuantity(productId: EntityId, quantity: number): void;
  removeItem(productId: EntityId): void;
  clearCart(): void;
  setLastPlacedOrderId(orderId: EntityId | null): void;
}

export interface CustomerAreaShellProps {
  children: ReactNode;
}

export type { CartLine } from '@/types';
