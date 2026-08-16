import {
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
import type { DataSnapshot } from '@/services/interfaces';

export const cloneData = <T>(value: T): T => structuredClone(value);

export const createDataSnapshot = (): DataSnapshot =>
  cloneData({
    products: PRODUCT_DATA,
    customers: CUSTOMER_DATA,
    deliverers: DELIVERER_DATA,
    orders: ORDER_DATA,
    deliveries: DELIVERY_DATA,
    inventory: INVENTORY_DATA,
    inventoryAdjustments: INVENTORY_ADJUSTMENT_DATA,
    loyaltyAccounts: LOYALTY_ACCOUNT_DATA,
    loyaltyActivity: LOYALTY_ACTIVITY_DATA,
    payments: PAYMENT_DATA,
  });

export class LocalRepository {
  private data: DataSnapshot = createDataSnapshot();

  read(): DataSnapshot {
    return this.data;
  }

  snapshot(): DataSnapshot {
    return cloneData(this.data);
  }

  reset(): DataSnapshot {
    this.data = createDataSnapshot();
    return this.snapshot();
  }
}

