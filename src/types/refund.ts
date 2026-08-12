import type { EntityId, ISODateString, MoneyCentavos } from './shared';

export type RefundStatus = 'pending' | 'processing' | 'refunded' | 'rejected';

export interface RefundRecord {
  id: EntityId;
  orderId: EntityId;
  paymentId: EntityId;
  amountCentavos: MoneyCentavos;
  status: RefundStatus;
  reason: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  resolvedAt?: ISODateString;
  resolutionNote?: string;
}

