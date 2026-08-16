import {
  AUTH_ACCOUNTS,
  CUSTOMER_DATA,
  DELIVERER_DATA,
  DELIVERY_DATA,
  INVENTORY_ADJUSTMENT_DATA,
  INVENTORY_DATA,
  LOYALTY_ACCOUNT_DATA,
  LOYALTY_ACTIVITY_DATA,
  ORDER_DATA,
  PAYMENT_DATA,
  PRODUCT_DATA,
} from '@/data';
import type { AppDataState } from './interface';

export const createInitialAppData = (): AppDataState => ({
  auth: {
    session: null,
    accessNotice: 'Use your assigned email and password to sign in.',
    accounts: structuredClone(AUTH_ACCOUNTS),
    pendingRegistration: null,
  },
  catalog: { products: structuredClone(PRODUCT_DATA) },
  cart: {
    items: [],
    lastPlacedOrderId: null,
  },
  customers: { records: structuredClone(CUSTOMER_DATA) },
  orders: { records: structuredClone(ORDER_DATA) },
  inventory: {
    items: structuredClone(INVENTORY_DATA),
    adjustments: structuredClone(INVENTORY_ADJUSTMENT_DATA),
  },
  deliveries: {
    records: structuredClone(DELIVERY_DATA),
    deliverers: structuredClone(DELIVERER_DATA),
  },
  loyalty: {
    accounts: structuredClone(LOYALTY_ACCOUNT_DATA),
    activity: structuredClone(LOYALTY_ACTIVITY_DATA),
  },
  payments: { records: structuredClone(PAYMENT_DATA) },
  meta: {
    nextOrderSequence: 5,
    nextOrderEventSequence: 12,
    nextInventoryEventSequence: 3,
    nextLoyaltyEventSequence: 3,
    nextCancellationSequence: 1,
    nextRefundSequence: 1,
    nextCustomerSequence: 4,
    nextUserSequence: 4,
    nextAddressSequence: 5,
  },
});
