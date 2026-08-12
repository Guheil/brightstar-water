import type { CartLine, Delivery, LoyaltyAccount, Order, Product } from '@/types';
import { getAvailableStock, isLowStock } from '@/utils';
import type { AppStore } from './interface';

export interface ProductWithAvailability extends Product {
  availableStock: number;
  isAvailable: boolean;
  isLowStock: boolean;
}

export const selectCartItems = (state: AppStore): CartLine[] => state.cart.items;

export const selectCartItemCount = (state: AppStore): number =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

export const selectLastPlacedOrderId = (state: AppStore): string | null =>
  state.cart.lastPlacedOrderId;

export const selectProductsWithAvailability = (
  state: AppStore,
): ProductWithAvailability[] =>
  state.catalog.products.map((product) => {
    const inventory = state.inventory.items.find((item) => item.productId === product.id);
    const availableStock = inventory ? getAvailableStock(inventory) : 0;

    return {
      ...product,
      availableStock,
      isAvailable: product.isActive && availableStock > 0,
      isLowStock: inventory ? isLowStock(inventory) : true,
    };
  });

export const selectOrderById =
  (orderId: string) =>
  (state: AppStore): Order | undefined =>
    state.orders.records.find((order) => order.id === orderId);

export const selectDeliveryById =
  (deliveryId: string) =>
  (state: AppStore): Delivery | undefined =>
    state.deliveries.records.find((delivery) => delivery.id === deliveryId);

export const selectPaymentForOrder =
  (orderId: string) =>
  (state: AppStore) =>
    state.payments.records.find((payment) => payment.orderId === orderId);

export const selectCustomerOrders =
  (customerId: string) =>
  (state: AppStore): Order[] =>
    state.orders.records
      .filter((order) => order.customerId === customerId)
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));

export const selectDelivererQueue =
  (delivererId: string) =>
  (state: AppStore): Delivery[] =>
    state.deliveries.records
      .filter(
        (delivery) =>
          delivery.delivererId === delivererId &&
          ['assigned', 'accepted', 'out_for_delivery'].includes(delivery.status),
      )
      .sort((a, b) => {
        const dateOrder = a.schedule.date.localeCompare(b.schedule.date);
        return dateOrder || a.schedule.windowLabel.localeCompare(b.schedule.windowLabel);
      });

export const selectLoyaltyForCustomer =
  (customerId: string) =>
  (state: AppStore): LoyaltyAccount | undefined =>
    state.loyalty.accounts.find((account) => account.customerId === customerId);

export const selectCustomerById =
  (customerId: string) =>
  (state: AppStore) =>
    state.customers.records.find((customer) => customer.id === customerId);

export const selectDeliveryForOrder =
  (orderId: string) =>
  (state: AppStore) =>
    state.deliveries.records.find((delivery) => delivery.orderId === orderId);

export const selectAdminWorkCounts = (state: AppStore) => ({
  pendingOrders: state.orders.records.filter((order) => order.status === 'pending_review').length,
  unassignedDeliveries: state.deliveries.records.filter(
    (delivery) => delivery.status === 'unassigned',
  ).length,
  failedDeliveries: state.deliveries.records.filter(
    (delivery) => delivery.status === 'failed',
  ).length,
  pendingCancellations: state.orders.records.filter(
    (order) => order.cancellation?.status === 'requested',
  ).length,
  pendingRefunds: state.orders.records.filter(
    (order) => order.refund && ['pending', 'processing'].includes(order.refund.status),
  ).length,
  lowStockProducts: state.inventory.items.filter((item) => isLowStock(item)).length,
});
