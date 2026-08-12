import type { DeliveryStatus, OrderStatus } from '@/types';

export const ORDER_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  pending_review: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'assigned_for_delivery', 'cancelled'],
  preparing: ['assigned_for_delivery', 'cancelled'],
  assigned_for_delivery: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'delivery_failed'],
  delivered: [],
  cancelled: [],
  delivery_failed: [],
};

export const DELIVERY_TRANSITIONS: Readonly<
  Record<DeliveryStatus, readonly DeliveryStatus[]>
> = {
  unassigned: ['assigned', 'cancelled'],
  assigned: ['accepted', 'out_for_delivery', 'cancelled'],
  accepted: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'failed'],
  delivered: [],
  failed: [],
  cancelled: [],
};

export const ORDER_PROGRESS: Readonly<Partial<Record<OrderStatus, number>>> = {
  pending_review: 10,
  confirmed: 30,
  preparing: 50,
  assigned_for_delivery: 65,
  out_for_delivery: 82,
  delivered: 100,
};

