import type { OrderStatus, RefundStatus } from '@/types';
import type { StatusTone } from '@/components';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_review: 'Pending review',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  assigned_for_delivery: 'Assigned for delivery',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  delivery_failed: 'Delivery failed',
};

export const ORDER_STATUS_TONES: Record<OrderStatus, StatusTone> = {
  pending_review: 'warning',
  confirmed: 'info',
  preparing: 'info',
  assigned_for_delivery: 'water',
  out_for_delivery: 'water',
  delivered: 'success',
  cancelled: 'neutral',
  delivery_failed: 'error',
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  pending: 'Refund pending',
  processing: 'Refund processing',
  refunded: 'Refunded',
  rejected: 'Refund rejected',
};

