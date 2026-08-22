import {
  CUSTOMER_DATA,
  DELIVERER_DATA,
  DELIVERY_DATA,
  LOYALTY_ACCOUNT_DATA,
  LOYALTY_ACTIVITY_DATA,
  ORDER_DATA,
  PAYMENT_DATA,
} from '@/data';
import type { AppDataState } from './interface';

const includeOperationalFixtures = process.env.NODE_ENV === 'test';

export const createInitialAppData = (): AppDataState => ({
  auth: {
    session: null,
    accessNotice: 'Sign in with your verified account to continue.',
    initialized: false,
  },
  catalog: { products: [], initialized: false, error: null },
  cart: {
    items: [],
    lastPlacedOrderId: null,
    ownerCustomerId: null,
    initialized: false,
    error: null,
  },
  customers: { records: structuredClone(CUSTOMER_DATA), addressesInitialized: false, addressesError: null },
  orders: { records: includeOperationalFixtures ? structuredClone(ORDER_DATA) : [] },
  inventory: {
    items: [],
    adjustments: [],
  },
  deliveries: {
    records: includeOperationalFixtures ? structuredClone(DELIVERY_DATA) : [],
    deliverers: includeOperationalFixtures ? structuredClone(DELIVERER_DATA) : [],
  },
  loyalty: {
    accounts: includeOperationalFixtures ? structuredClone(LOYALTY_ACCOUNT_DATA) : [],
    activity: includeOperationalFixtures ? structuredClone(LOYALTY_ACTIVITY_DATA) : [],
  },
  payments: { records: includeOperationalFixtures ? structuredClone(PAYMENT_DATA) : [] },
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
