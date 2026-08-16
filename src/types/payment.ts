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
  /** Payment verification reference recorded with the order. */
  reference?: string;
  proofImageDataUrl?: string;
  proofFileName?: string;
  verifiedAt?: ISODateString;
  paidAt?: ISODateString;
  updatedAt: ISODateString;
}

