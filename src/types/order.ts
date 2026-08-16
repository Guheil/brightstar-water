import type { CancellationRequest } from './cancellation';
import type { DeliverySchedule } from './delivery';
import type { InventoryReservationStatus } from './inventory';
import type { LoyaltyEffect } from './loyalty';
import type { PaymentMethod } from './payment';
import type { ProductCategory, ProductUnit } from './product';
import type { RefundRecord } from './refund';
import type { EntityId, ISODateString, MoneyCentavos } from './shared';
import type { UserRole } from './auth';

export type OrderStatus =
  | 'pending_review'
  | 'confirmed'
  | 'preparing'
  | 'assigned_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'delivery_failed';

export type OrderEventType =
  | 'placed'
  | 'confirmed'
  | 'preparation_started'
  | 'delivery_assigned'
  | 'delivery_accepted'
  | 'out_for_delivery'
  | 'delivered'
  | 'delivery_failed'
  | 'cancellation_requested'
  | 'cancellation_approved'
  | 'cancellation_rejected'
  | 'payment_verified'
  | 'refund_updated'
  | 'inventory_reserved'
  | 'inventory_released'
  | 'inventory_committed'
  | 'loyalty_awarded';

export interface OrderItem {
  productId: EntityId;
  sku: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  unitPriceCentavos: MoneyCentavos;
  quantity: number;
  lineTotalCentavos: MoneyCentavos;
}

export interface OrderTotals {
  subtotalCentavos: MoneyCentavos;
  deliveryFeeCentavos: MoneyCentavos;
  loyaltyDiscountCentavos: MoneyCentavos;
  totalCentavos: MoneyCentavos;
}

export interface OrderEvent {
  id: EntityId;
  orderId: EntityId;
  type: OrderEventType;
  label: string;
  description?: string;
  actorRole: UserRole | 'system';
  actorId?: EntityId;
  occurredAt: ISODateString;
}

export interface Order {
  id: EntityId;
  reference: string;
  customerId: EntityId;
  status: OrderStatus;
  items: OrderItem[];
  totals: OrderTotals;
  paymentId: EntityId;
  paymentMethod: PaymentMethod;
  deliveryId: EntityId;
  deliveryAddressId: EntityId;
  deliverySchedule: DeliverySchedule;
  customerNote?: string;
  loyalty: LoyaltyEffect;
  inventoryReservationStatus: InventoryReservationStatus;
  cancellation?: CancellationRequest;
  refund?: RefundRecord;
  events: OrderEvent[];
  placedAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PlaceOrderItemInput {
  productId: EntityId;
  quantity: number;
}

export interface PlaceOrderInput {
  customerId: EntityId;
  items: PlaceOrderItemInput[];
  deliveryAddressId: EntityId;
  deliverySchedule: DeliverySchedule;
  paymentMethod: PaymentMethod;
  paymentProofImageDataUrl?: string;
  paymentProofFileName?: string;
  customerNote?: string;
  requestedLoyaltyPoints?: number;
  placedAt?: ISODateString;
}

