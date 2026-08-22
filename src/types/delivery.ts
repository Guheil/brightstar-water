import type { EntityId, ISODateString, MoneyCentavos } from './shared';
import type { PaymentMethod } from './payment';

export type DeliveryStatus =
  | 'unassigned'
  | 'assigned'
  | 'accepted'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export type DeliveryFailureReason =
  | 'customer_unavailable'
  | 'incorrect_address'
  | 'customer_requested_reschedule'
  | 'payment_issue'
  | 'other';

export interface DeliveryAddressSnapshot {
  recipientName: string;
  phonePlaceholder: string;
  addressLine: string;
  area: string;
  municipality: string;
  province: string;
  distanceKm: number;
  latitude?: number;
  longitude?: number;
  deliveryNote?: string;
}

export type DeliveryScheduleMode = 'earliest_available' | 'preferred';

export interface DeliverySchedule {
  /** Effective date used by legacy sorting and delivery queues. */
  date: string;
  /** Effective window used by legacy sorting and delivery queues. */
  windowLabel: string;
  mode?: DeliveryScheduleMode;
  estimatedDate?: string;
  estimatedWindowLabel?: string;
  preferredDate?: string;
  preferredWindowLabel?: string;
}

export interface DeliveryCompletionEvidence {
  cashReceivedCentavos?: MoneyCentavos;
  proofFileName?: string;
  proofImageDataUrl?: string;
  proofAvailable?: boolean;
  note?: string;
  recordedAt: ISODateString;
  recordedBy: EntityId;
}

export interface DeliveryFailure {
  reason: DeliveryFailureReason;
  note?: string;
  reportedAt: ISODateString;
  reportedBy: EntityId;
}

export interface DelivererProfile {
  id: EntityId;
  displayName: string;
  email: string;
  phonePlaceholder: string;
  status: 'available' | 'off_duty';
}

export interface Delivery {
  id: EntityId;
  orderId: EntityId;
  customerId: EntityId;
  delivererId?: EntityId;
  status: DeliveryStatus;
  schedule: DeliverySchedule;
  address: DeliveryAddressSnapshot;
  paymentMethod: PaymentMethod;
  amountToCollectCentavos: MoneyCentavos;
  assignedAt?: ISODateString;
  acceptedAt?: ISODateString;
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  failure?: DeliveryFailure;
  completionEvidence?: DeliveryCompletionEvidence;
  updatedAt: ISODateString;
}

