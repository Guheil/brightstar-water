import type { EntityId, ISODateString, MoneyCentavos } from './shared';

export type PaymentMethod = 'cod' | 'gcash';
export type PaymentStatus =
  | 'collection_due'
  | 'awaiting_verification'
  | 'verified'
  | 'paid'
  | 'cancelled'
  | 'failed'
  | 'refunded';

export interface PaymentRecord {
  id: EntityId;
  orderId: EntityId;
  method: PaymentMethod;
  status: PaymentStatus;
  amountCentavos: MoneyCentavos;
  /** Fictional presentation reference only; never a real GCash transaction ID. */
  demoReference?: string;
  verifiedAt?: ISODateString;
  paidAt?: ISODateString;
  updatedAt: ISODateString;
}

