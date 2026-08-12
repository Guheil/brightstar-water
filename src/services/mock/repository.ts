import {
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
import type { DemoDataSnapshot } from '@/services/interfaces';

export const cloneDemoData = <T>(value: T): T => structuredClone(value);

export const createDemoSnapshot = (): DemoDataSnapshot =>
  cloneDemoData({
    products: PRODUCT_FIXTURES,
    customers: CUSTOMER_FIXTURES,
    deliverers: DELIVERER_FIXTURES,
    orders: ORDER_FIXTURES,
    deliveries: DELIVERY_FIXTURES,
    inventory: INVENTORY_FIXTURES,
    inventoryAdjustments: INVENTORY_ADJUSTMENT_FIXTURES,
    loyaltyAccounts: LOYALTY_ACCOUNT_FIXTURES,
    loyaltyActivity: LOYALTY_ACTIVITY_FIXTURES,
    payments: PAYMENT_FIXTURES,
  });

export class MockRepository {
  private data: DemoDataSnapshot = createDemoSnapshot();

  read(): DemoDataSnapshot {
    return this.data;
  }

  snapshot(): DemoDataSnapshot {
    return cloneDemoData(this.data);
  }

  reset(): DemoDataSnapshot {
    this.data = createDemoSnapshot();
    return this.snapshot();
  }
}

