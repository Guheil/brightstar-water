import type { EntityId, ISODateString } from './shared';

export type CancellationStatus = 'requested' | 'approved' | 'rejected';

export interface CancellationRequest {
  id: EntityId;
  orderId: EntityId;
  status: CancellationStatus;
  reason: string;
  requestedAt: ISODateString;
  requestedBy: EntityId;
  reviewedAt?: ISODateString;
  reviewedBy?: EntityId;
  reviewNote?: string;
}

