import {
  CANCELLABLE_ORDER_STATUSES,
  ORDER_PROGRESS,
  ORDER_TRANSITIONS,
  REFUND_ELIGIBLE_PAYMENT_STATUSES,
} from '@/config';
import type { Order, OrderStatus, PaymentStatus } from '@/types';

export const canTransitionOrder = (from: OrderStatus, to: OrderStatus): boolean =>
  ORDER_TRANSITIONS[from].includes(to);

export const canCancelOrder = (order: Order): boolean =>
  CANCELLABLE_ORDER_STATUSES.includes(
    order.status as (typeof CANCELLABLE_ORDER_STATUSES)[number],
  ) && !order.cancellation;

export const canRequestRefund = (order: Order, paymentStatus: PaymentStatus): boolean => {
  const hasRefundReason =
    order.status === 'cancelled' || order.status === 'delivery_failed';

  return (
    hasRefundReason &&
    REFUND_ELIGIBLE_PAYMENT_STATUSES.includes(
      paymentStatus as (typeof REFUND_ELIGIBLE_PAYMENT_STATUSES)[number],
    ) &&
    !order.refund
  );
};

export const getOrderProgress = (status: OrderStatus): number =>
  ORDER_PROGRESS[status] ?? 0;

