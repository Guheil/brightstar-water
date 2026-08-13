import {
  CART_FIXTURES,
  CUSTOMER_FIXTURES,
  DELIVERER_FIXTURES,
  DELIVERY_FIXTURES,
  INVENTORY_ADJUSTMENT_FIXTURES,
  INVENTORY_FIXTURES,
  LOYALTY_ACCOUNT_FIXTURES,
  LOYALTY_ACTIVITY_FIXTURES,
  ORDER_FIXTURES,
  PAYMENT_FIXTURES,
  PRODUCT_FIXTURES,
} from '@/mocks';
import type { AppDataState } from './interface';

export const createInitialAppData = (): AppDataState => ({
  auth: {
    session: null,
    prototypeNotice: 'Use your assigned email and password to sign in.',
  },
  catalog: { products: structuredClone(PRODUCT_FIXTURES) },
  cart: {
    items: structuredClone(CART_FIXTURES),
    lastPlacedOrderId: null,
  },
  customers: { records: structuredClone(CUSTOMER_FIXTURES) },
  orders: { records: structuredClone(ORDER_FIXTURES) },
  inventory: {
    items: structuredClone(INVENTORY_FIXTURES),
    adjustments: structuredClone(INVENTORY_ADJUSTMENT_FIXTURES),
  },
  deliveries: {
    records: structuredClone(DELIVERY_FIXTURES),
    deliverers: structuredClone(DELIVERER_FIXTURES),
  },
  loyalty: {
    accounts: structuredClone(LOYALTY_ACCOUNT_FIXTURES),
    activity: structuredClone(LOYALTY_ACTIVITY_FIXTURES),
  },
  payments: { records: structuredClone(PAYMENT_FIXTURES) },
  meta: {
    nextOrderSequence: 5,
    nextOrderEventSequence: 12,
    nextInventoryEventSequence: 3,
    nextLoyaltyEventSequence: 3,
    nextCancellationSequence: 1,
    nextRefundSequence: 1,
  },
});
