import type { OrderStatus } from '@/types';

/** Prototype policy: requests are allowed until a delivery has started. */
export const CANCELLABLE_ORDER_STATUSES = [
  'pending_review',
  'confirmed',
  'preparing',
  'assigned_for_delivery',
] as const satisfies readonly OrderStatus[];

export const CANCELLATION_POLICY = {
  requiresAdminReview: true,
  minimumReasonLength: 4,
  allowedStatuses: CANCELLABLE_ORDER_STATUSES,
  releaseReservedStockOnApproval: true,
  notice: 'Prototype cancellation policy pending business confirmation.',
} as const;

