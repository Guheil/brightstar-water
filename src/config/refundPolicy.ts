import type { PaymentStatus, RefundStatus } from '@/types';

export const REFUND_STATUS_SEQUENCE = [
  'pending',
  'processing',
  'refunded',
] as const satisfies readonly RefundStatus[];

export const REFUND_ELIGIBLE_PAYMENT_STATUSES = [
  'verified',
  'paid',
] as const satisfies readonly PaymentStatus[];

export const REFUND_POLICY = {
  requiresRecordedPayment: true,
  eligiblePaymentStatuses: REFUND_ELIGIBLE_PAYMENT_STATUSES,
  failedDeliveryStartsRefundAutomatically: false,
  restoresInventoryAutomatically: false,
  notice: 'Prototype refund workflow pending business confirmation.',
} as const;

