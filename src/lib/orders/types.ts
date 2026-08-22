import type {
  Customer,
  DelivererProfile,
  Delivery,
  LoyaltyAccount,
  LoyaltyActivity,
  Order,
  PaymentRecord,
} from '@/types';

export interface OperationalSnapshot {
  orders: Order[];
  deliveries: Delivery[];
  payments: PaymentRecord[];
  deliverers: DelivererProfile[];
  customers: Customer[];
  loyaltyAccounts: LoyaltyAccount[];
  loyaltyActivity: LoyaltyActivity[];
}

export interface PlaceOrderPayload {
  items: Array<{ productId: string; quantity: number }>;
  deliveryAddressId: string;
  deliverySchedule: {
    date: string;
    windowLabel: string;
    mode?: 'earliest_available' | 'preferred';
    estimatedDate?: string;
    estimatedWindowLabel?: string;
    preferredDate?: string;
    preferredWindowLabel?: string;
  };
  paymentMethod: 'cod' | 'gcash';
  customerNote?: string;
  idempotencyKey: string;
}

export interface OperationalCursor { placedAt: string; id: string }
export interface OperationalPage { snapshot: OperationalSnapshot; nextCursor: OperationalCursor | null }
