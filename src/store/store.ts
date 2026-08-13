'use client';

import { create } from 'zustand';
import { CANCELLATION_POLICY } from '@/config';
import { DEMO_AUTH_ACCOUNTS } from '@/mocks';
import type {
  DeliveryAddressSnapshot,
  EntityId,
  ISODateString,
  Order,
  OrderEvent,
  OrderEventType,
  PaymentRecord,
  RefundStatus,
  UserRole,
} from '@/types';
import {
  calculateCartSubtotal,
  calculateDeliveryFee,
  calculateLineTotal,
  calculateLoyaltyDiscount,
  calculateLoyaltyPoints,
  calculateOrderTotals,
  canCancelOrder,
  canRequestRefund,
  canReserveStock,
  canTransitionDelivery,
  canTransitionOrder,
  commandFailure,
  commandSuccess,
  createOrderReference,
  createSequenceId,
} from '@/utils';
import { createInitialAppData } from './initialState';
import type { AppCommands, AppStore } from './interface';

const resolveTimestamp = (at?: ISODateString): ISODateString =>
  at ?? new Date().toISOString();

const createOrderEvent = (
  sequence: number,
  orderId: EntityId,
  type: OrderEventType,
  label: string,
  actorRole: UserRole | 'system',
  occurredAt: ISODateString,
  actorId?: EntityId,
  description?: string,
): OrderEvent => ({
  id: createSequenceId('order-event', sequence),
  orderId,
  type,
  label,
  actorRole,
  ...(actorId ? { actorId } : {}),
  ...(description ? { description } : {}),
  occurredAt,
});

const toDeliveryAddressSnapshot = (
  address: AppStore['customers']['records'][number]['addresses'][number],
): DeliveryAddressSnapshot => ({
  recipientName: address.recipientName,
  phonePlaceholder: address.phonePlaceholder,
  addressLine: address.addressLine,
  area: address.area,
  municipality: address.municipality,
  province: address.province,
  distanceKm: address.distanceKm,
  ...(address.deliveryNote ? { deliveryNote: address.deliveryNote } : {}),
});

export const useAppStore = create<AppStore>()((set, get) => {
  const signIn: AppCommands['signIn'] = (credentials, at) => {
    const normalizedEmail = credentials.email.trim().toLocaleLowerCase();
    const account = DEMO_AUTH_ACCOUNTS.find(
      (candidate) => candidate.email.toLocaleLowerCase() === normalizedEmail,
    );

    if (!account || account.demoPassword !== credentials.password) {
      return commandFailure('invalid_input', 'The email or password is incorrect.');
    }

    const session = {
      user: {
        id: account.id,
        role: account.role,
        displayName: account.displayName,
        email: account.email,
        ...(account.customerId ? { customerId: account.customerId } : {}),
        ...(account.delivererId ? { delivererId: account.delivererId } : {}),
      },
      signedInAt: resolveTimestamp(at),
      isPrototypeSession: true as const,
    };

    set((state) => ({ auth: { ...state.auth, session } }));
    return commandSuccess(session);
  };

  const signOut: AppCommands['signOut'] = () => {
    set((state) => ({ auth: { ...state.auth, session: null } }));
  };

  const addCartItem: AppCommands['addCartItem'] = (productId, quantity = 1) => {
    const state = get();
    const product = state.catalog.products.find((item) => item.id === productId);
    const inventoryItem = state.inventory.items.find((item) => item.productId === productId);
    if (!product || !product.isActive || !inventoryItem) {
      return commandFailure('not_found', 'This product is currently unavailable.');
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return commandFailure('invalid_input', 'Cart quantity must be a positive whole number.');
    }
    const current = state.cart.items.find((item) => item.productId === productId);
    const nextQuantity = (current?.quantity ?? 0) + quantity;
    if (!canReserveStock(inventoryItem, nextQuantity)) {
      return commandFailure(
        'insufficient_stock',
        `${product.name} does not have enough available stock.`,
      );
    }
    const nextLine = { productId, quantity: nextQuantity };
    set({
      cart: {
        ...state.cart,
        items: current
          ? state.cart.items.map((item) =>
              item.productId === productId ? nextLine : item,
            )
          : [...state.cart.items, nextLine],
      },
    });
    return commandSuccess(nextLine);
  };

  const updateCartItemQuantity: AppCommands['updateCartItemQuantity'] = (
    productId,
    quantity,
  ) => {
    const state = get();
    const current = state.cart.items.find((item) => item.productId === productId);
    if (!current) return commandFailure('not_found', 'Cart item not found.');
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return commandFailure('invalid_input', 'Cart quantity must be a positive whole number.');
    }
    const product = state.catalog.products.find((item) => item.id === productId);
    const inventoryItem = state.inventory.items.find((item) => item.productId === productId);
    if (!product || !product.isActive || !inventoryItem) {
      return commandFailure('not_found', 'This product is currently unavailable.');
    }
    if (!canReserveStock(inventoryItem, quantity)) {
      return commandFailure(
        'insufficient_stock',
        `${product.name} does not have enough available stock.`,
      );
    }
    const nextLine = { productId, quantity };
    set({
      cart: {
        ...state.cart,
        items: state.cart.items.map((item) =>
          item.productId === productId ? nextLine : item,
        ),
      },
    });
    return commandSuccess(nextLine);
  };

  const removeCartItem: AppCommands['removeCartItem'] = (productId) => {
    set((state) => ({
      cart: {
        ...state.cart,
        items: state.cart.items.filter((item) => item.productId !== productId),
      },
    }));
  };

  const clearCart: AppCommands['clearCart'] = () => {
    set((state) => ({ cart: { ...state.cart, items: [] } }));
  };

  const setLastPlacedOrderId: AppCommands['setLastPlacedOrderId'] = (orderId) => {
    set((state) => ({ cart: { ...state.cart, lastPlacedOrderId: orderId } }));
  };

  const placeOrder: AppCommands['placeOrder'] = (input) => {
    const state = get();
    const customer = state.customers.records.find((item) => item.id === input.customerId);

    if (!customer || customer.status !== 'active') {
      return commandFailure('not_found', 'The selected customer is unavailable.', 'customerId');
    }

    const address = customer.addresses.find((item) => item.id === input.deliveryAddressId);
    if (!address) {
      return commandFailure('not_found', 'Choose a delivery address from this account.', 'deliveryAddressId');
    }

    if (!input.items.length) {
      return commandFailure('invalid_input', 'Add at least one product before placing an order.', 'items');
    }

    if ((input.requestedLoyaltyPoints ?? 0) > 0) {
      return commandFailure(
        'not_allowed',
        'Loyalty point redemption is currently unavailable.',
        'requestedLoyaltyPoints',
      );
    }

    const quantities = new Map<EntityId, number>();
    for (const item of input.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return commandFailure('invalid_input', 'Product quantities must be positive whole numbers.', 'items');
      }
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    }

    const orderItems: Order['items'] = [];
    for (const [productId, quantity] of quantities) {
      const product = state.catalog.products.find((item) => item.id === productId);
      const inventoryItem = state.inventory.items.find((item) => item.productId === productId);

      if (!product || !product.isActive || !inventoryItem) {
        return commandFailure('not_found', 'One of the selected products is unavailable.', 'items');
      }
      if (!canReserveStock(inventoryItem, quantity)) {
        return commandFailure(
          'insufficient_stock',
          `${product.name} does not have enough available stock.`,
          'items',
        );
      }

      orderItems.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        category: product.category,
        unit: product.unit,
        unitPriceCentavos: product.priceCentavos,
        quantity,
        lineTotalCentavos: calculateLineTotal(product.priceCentavos, quantity),
      });
    }

    const deliveryQuote = calculateDeliveryFee(address.distanceKm);
    if (!deliveryQuote.serviceable) {
      return commandFailure('outside_service_area', deliveryQuote.label, 'deliveryAddressId');
    }

    const occurredAt = resolveTimestamp(input.placedAt);
    const sequence = state.meta.nextOrderSequence;
    const orderId = createSequenceId('order', sequence);
    const paymentId = createSequenceId('payment', sequence);
    const deliveryId = createSequenceId('delivery', sequence);
    const subtotalCentavos = calculateCartSubtotal(orderItems);
    const loyaltyDiscountCentavos = calculateLoyaltyDiscount(
      input.requestedLoyaltyPoints ?? 0,
    );
    const totals = calculateOrderTotals(
      subtotalCentavos,
      deliveryQuote.feeCentavos,
      loyaltyDiscountCentavos,
    );
    const pointsPending = calculateLoyaltyPoints(subtotalCentavos);
    const placedEvent = createOrderEvent(
      state.meta.nextOrderEventSequence,
      orderId,
      'placed',
      'Order placed',
      'customer',
      occurredAt,
      state.auth.session?.user.customerId === customer.id
        ? state.auth.session.user.id
        : customer.id,
      'The order is waiting for Admin review.',
    );
    const reservationEvent = createOrderEvent(
      state.meta.nextOrderEventSequence + 1,
      orderId,
      'inventory_reserved',
      'Stock reserved',
      'system',
      occurredAt,
    );
    const order: Order = {
      id: orderId,
      reference: createOrderReference(sequence),
      customerId: customer.id,
      status: 'pending_review',
      items: orderItems,
      totals,
      paymentId,
      paymentMethod: input.paymentMethod,
      deliveryId,
      deliveryAddressId: address.id,
      deliverySchedule: input.deliverySchedule,
      ...(input.customerNote?.trim() ? { customerNote: input.customerNote.trim() } : {}),
      loyalty: {
        qualifyingSubtotalCentavos: subtotalCentavos,
        pointsPending,
        pointsAwarded: 0,
        discountCentavos: loyaltyDiscountCentavos,
      },
      inventoryReservationStatus: 'reserved',
      events: [placedEvent, reservationEvent],
      placedAt: occurredAt,
      updatedAt: occurredAt,
    };
    const payment: PaymentRecord = {
      id: paymentId,
      orderId,
      method: input.paymentMethod,
      status: input.paymentMethod === 'cod' ? 'collection_due' : 'awaiting_verification',
      amountCentavos: totals.totalCentavos,
      updatedAt: occurredAt,
    };
    const delivery: AppStore['deliveries']['records'][number] = {
      id: deliveryId,
      orderId,
      customerId: customer.id,
      status: 'unassigned',
      schedule: input.deliverySchedule,
      address: toDeliveryAddressSnapshot(address),
      paymentMethod: input.paymentMethod,
      amountToCollectCentavos: input.paymentMethod === 'cod' ? totals.totalCentavos : 0,
      updatedAt: occurredAt,
    };
    const nextInventoryItems = state.inventory.items.map((inventoryItem) => {
      const quantity = quantities.get(inventoryItem.productId);
      return quantity
        ? { ...inventoryItem, stockReserved: inventoryItem.stockReserved + quantity, updatedAt: occurredAt }
        : inventoryItem;
    });
    let inventorySequence = state.meta.nextInventoryEventSequence;
    const reservationAdjustments = orderItems.map((item) => {
      const before = state.inventory.items.find(
        (inventoryItem) => inventoryItem.productId === item.productId,
      )!;
      const adjustment = {
        id: createSequenceId('inventory-event', inventorySequence),
        productId: item.productId,
        mode: 'reserve' as const,
        quantity: item.quantity,
        stockOnHandBefore: before.stockOnHand,
        stockOnHandAfter: before.stockOnHand,
        stockReservedBefore: before.stockReserved,
        stockReservedAfter: before.stockReserved + item.quantity,
        source: 'order_reservation' as const,
        reason: `Reserved by ${order.reference}.`,
        actorId: 'system' as const,
        createdAt: occurredAt,
      };
      inventorySequence += 1;
      return adjustment;
    });

    set({
      orders: { records: [order, ...state.orders.records] },
      payments: { records: [payment, ...state.payments.records] },
      deliveries: { ...state.deliveries, records: [delivery, ...state.deliveries.records] },
      inventory: {
        items: nextInventoryItems,
        adjustments: [...reservationAdjustments.reverse(), ...state.inventory.adjustments],
      },
      meta: {
        ...state.meta,
        nextOrderSequence: sequence + 1,
        nextOrderEventSequence: state.meta.nextOrderEventSequence + 2,
        nextInventoryEventSequence: inventorySequence,
      },
    });

    return commandSuccess(order);
  };

  const transitionOrder = (
    orderId: EntityId,
    nextStatus: Order['status'],
    eventType: OrderEventType,
    label: string,
    actorId: EntityId,
    at?: ISODateString,
  ) => {
    const state = get();
    const order = state.orders.records.find((item) => item.id === orderId);
    if (!order) return commandFailure<Order>('not_found', 'Order not found.');
    if (!canTransitionOrder(order.status, nextStatus)) {
      return commandFailure<Order>(
        'invalid_transition',
        `Order cannot move from ${order.status} to ${nextStatus}.`,
      );
    }
    const occurredAt = resolveTimestamp(at);
    const event = createOrderEvent(
      state.meta.nextOrderEventSequence,
      order.id,
      eventType,
      label,
      'admin',
      occurredAt,
      actorId,
    );
    const nextOrder = {
      ...order,
      status: nextStatus,
      events: [...order.events, event],
      updatedAt: occurredAt,
    };
    set({
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      meta: { ...state.meta, nextOrderEventSequence: state.meta.nextOrderEventSequence + 1 },
    });
    return commandSuccess(nextOrder);
  };

  const confirmOrder: AppCommands['confirmOrder'] = (orderId, actorId, at) =>
    transitionOrder(orderId, 'confirmed', 'confirmed', 'Order confirmed', actorId, at);

  const markOrderPreparing: AppCommands['markOrderPreparing'] = (orderId, actorId, at) =>
    transitionOrder(
      orderId,
      'preparing',
      'preparation_started',
      'Order preparation started',
      actorId,
      at,
    );

  const assignDelivery: AppCommands['assignDelivery'] = (
    orderId,
    delivererId,
    actorId,
    at,
  ) => {
    const state = get();
    const order = state.orders.records.find((item) => item.id === orderId);
    const delivery = state.deliveries.records.find((item) => item.orderId === orderId);
    const deliverer = state.deliveries.deliverers.find((item) => item.id === delivererId);

    if (!order || !delivery) {
      return commandFailure('not_found', 'Order delivery record not found.');
    }
    if (!deliverer || deliverer.status !== 'available') {
      return commandFailure('not_found', 'The selected deliverer is unavailable.');
    }

    const isInitialAssignment = delivery.status === 'unassigned';
    const canReassign =
      ['assigned', 'accepted'].includes(delivery.status) &&
      order.status === 'assigned_for_delivery';

    if (!isInitialAssignment && !canReassign) {
      return commandFailure(
        'invalid_transition',
        'A delivery can only be assigned or reassigned before it starts.',
      );
    }
    if (
      isInitialAssignment &&
      !['confirmed', 'preparing'].includes(order.status)
    ) {
      return commandFailure(
        'invalid_transition',
        'Confirm the order before assigning a deliverer.',
      );
    }

    const occurredAt = resolveTimestamp(at);
    const event = createOrderEvent(
      state.meta.nextOrderEventSequence,
      order.id,
      'delivery_assigned',
      `${deliverer.displayName} assigned`,
      'admin',
      occurredAt,
      actorId,
      canReassign ? 'The delivery was reassigned before departure.' : undefined,
    );
    const nextOrder: Order = {
      ...order,
      status: 'assigned_for_delivery',
      events: [...order.events, event],
      updatedAt: occurredAt,
    };
    const nextDelivery = {
      ...delivery,
      delivererId,
      status: 'assigned' as const,
      assignedAt: occurredAt,
      acceptedAt: undefined,
      updatedAt: occurredAt,
    };

    set({
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      deliveries: {
        ...state.deliveries,
        records: state.deliveries.records.map((item) =>
          item.id === delivery.id ? nextDelivery : item,
        ),
      },
      meta: { ...state.meta, nextOrderEventSequence: state.meta.nextOrderEventSequence + 1 },
    });
    return commandSuccess(nextDelivery);
  };

  const acceptDelivery: AppCommands['acceptDelivery'] = (
    deliveryId,
    delivererId,
    at,
  ) => {
    const state = get();
    const delivery = state.deliveries.records.find((item) => item.id === deliveryId);
    if (!delivery) return commandFailure('not_found', 'Delivery not found.');
    if (delivery.delivererId !== delivererId) {
      return commandFailure('not_allowed', 'This delivery is assigned to another deliverer.');
    }
    if (!canTransitionDelivery(delivery.status, 'accepted')) {
      return commandFailure('invalid_transition', 'Only an assigned delivery can be accepted.');
    }
    const order = state.orders.records.find((item) => item.id === delivery.orderId);
    if (!order) return commandFailure('not_found', 'Related order not found.');
    const occurredAt = resolveTimestamp(at);
    const event = createOrderEvent(
      state.meta.nextOrderEventSequence,
      order.id,
      'delivery_accepted',
      'Assignment accepted',
      'deliverer',
      occurredAt,
      delivererId,
    );
    const nextDelivery = {
      ...delivery,
      status: 'accepted' as const,
      acceptedAt: occurredAt,
      updatedAt: occurredAt,
    };
    const nextOrder = {
      ...order,
      events: [...order.events, event],
      updatedAt: occurredAt,
    };

    set({
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      deliveries: {
        ...state.deliveries,
        records: state.deliveries.records.map((item) =>
          item.id === delivery.id ? nextDelivery : item,
        ),
      },
      meta: { ...state.meta, nextOrderEventSequence: state.meta.nextOrderEventSequence + 1 },
    });
    return commandSuccess(nextDelivery);
  };

  const startDelivery: AppCommands['startDelivery'] = (
    deliveryId,
    delivererId,
    at,
  ) => {
    const state = get();
    const delivery = state.deliveries.records.find((item) => item.id === deliveryId);
    if (!delivery) return commandFailure('not_found', 'Delivery not found.');
    if (delivery.delivererId !== delivererId) {
      return commandFailure('not_allowed', 'This delivery is assigned to another deliverer.');
    }
    if (!canTransitionDelivery(delivery.status, 'out_for_delivery')) {
      return commandFailure('invalid_transition', 'This delivery cannot be started from its current state.');
    }
    const order = state.orders.records.find((item) => item.id === delivery.orderId);
    if (!order || !canTransitionOrder(order.status, 'out_for_delivery')) {
      return commandFailure('invalid_transition', 'The related order is not ready for delivery.');
    }
    const occurredAt = resolveTimestamp(at);
    const event = createOrderEvent(
      state.meta.nextOrderEventSequence,
      order.id,
      'out_for_delivery',
      'Out for delivery',
      'deliverer',
      occurredAt,
      delivererId,
    );
    const nextDelivery = {
      ...delivery,
      status: 'out_for_delivery' as const,
      startedAt: occurredAt,
      updatedAt: occurredAt,
    };
    const nextOrder: Order = {
      ...order,
      status: 'out_for_delivery',
      events: [...order.events, event],
      updatedAt: occurredAt,
    };

    set({
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      deliveries: {
        ...state.deliveries,
        records: state.deliveries.records.map((item) =>
          item.id === delivery.id ? nextDelivery : item,
        ),
      },
      meta: { ...state.meta, nextOrderEventSequence: state.meta.nextOrderEventSequence + 1 },
    });
    return commandSuccess(nextDelivery);
  };

  const completeDelivery: AppCommands['completeDelivery'] = (
    deliveryId,
    delivererId,
    at,
  ) => {
    const state = get();
    const delivery = state.deliveries.records.find((item) => item.id === deliveryId);
    if (!delivery) return commandFailure('not_found', 'Delivery not found.');
    if (delivery.delivererId !== delivererId) {
      return commandFailure('not_allowed', 'This delivery is assigned to another deliverer.');
    }
    if (!canTransitionDelivery(delivery.status, 'delivered')) {
      return commandFailure('invalid_transition', 'Start the delivery before marking it delivered.');
    }
    const order = state.orders.records.find((item) => item.id === delivery.orderId);
    const payment = state.payments.records.find((item) => item.id === order?.paymentId);
    if (!order || !payment || !canTransitionOrder(order.status, 'delivered')) {
      return commandFailure('invalid_transition', 'The related order cannot be completed.');
    }
    if (order.inventoryReservationStatus !== 'reserved') {
      return commandFailure('conflict', 'The order no longer has an active stock reservation.');
    }
    if (payment.method === 'gcash' && !['verified', 'paid'].includes(payment.status)) {
      return commandFailure(
        'not_allowed',
        'Verify the GCash payment before completing this delivery.',
      );
    }

    for (const item of order.items) {
      const inventoryItem = state.inventory.items.find(
        (candidate) => candidate.productId === item.productId,
      );
      if (
        !inventoryItem ||
        inventoryItem.stockReserved < item.quantity ||
        inventoryItem.stockOnHand < item.quantity
      ) {
        return commandFailure('conflict', `Inventory is inconsistent for ${item.name}.`);
      }
    }

    const occurredAt = resolveTimestamp(at);
    let inventorySequence = state.meta.nextInventoryEventSequence;
    const commitAdjustments = order.items.map((item) => {
      const before = state.inventory.items.find(
        (candidate) => candidate.productId === item.productId,
      )!;
      const adjustment = {
        id: createSequenceId('inventory-event', inventorySequence),
        productId: item.productId,
        mode: 'commit' as const,
        quantity: item.quantity,
        stockOnHandBefore: before.stockOnHand,
        stockOnHandAfter: before.stockOnHand - item.quantity,
        stockReservedBefore: before.stockReserved,
        stockReservedAfter: before.stockReserved - item.quantity,
        source: 'order_commit' as const,
        reason: `Committed by delivered order ${order.reference}.`,
        actorId: 'system' as const,
        createdAt: occurredAt,
      };
      inventorySequence += 1;
      return adjustment;
    });
    const nextInventoryItems = state.inventory.items.map((inventoryItem) => {
      const orderItem = order.items.find((item) => item.productId === inventoryItem.productId);
      return orderItem
        ? {
            ...inventoryItem,
            stockOnHand: inventoryItem.stockOnHand - orderItem.quantity,
            stockReserved: inventoryItem.stockReserved - orderItem.quantity,
            updatedAt: occurredAt,
          }
        : inventoryItem;
    });

    let eventSequence = state.meta.nextOrderEventSequence;
    const deliveredEvent = createOrderEvent(
      eventSequence++,
      order.id,
      'delivered',
      'Delivery completed',
      'deliverer',
      occurredAt,
      delivererId,
    );
    const inventoryEvent = createOrderEvent(
      eventSequence++,
      order.id,
      'inventory_committed',
      'Reserved stock committed',
      'system',
      occurredAt,
    );
    const events = [...order.events, deliveredEvent, inventoryEvent];
    const pointsToAward = order.loyalty.pointsPending;
    let nextLoyaltyAccounts = state.loyalty.accounts;
    let nextLoyaltyActivity = state.loyalty.activity;
    let nextLoyaltyEventSequence = state.meta.nextLoyaltyEventSequence;

    if (pointsToAward > 0) {
      const existingAccount = state.loyalty.accounts.find(
        (account) => account.customerId === order.customerId,
      );
      const nextAccount = {
        customerId: order.customerId,
        pointsAvailable: (existingAccount?.pointsAvailable ?? 0) + pointsToAward,
        updatedAt: occurredAt,
      };
      nextLoyaltyAccounts = existingAccount
        ? state.loyalty.accounts.map((account) =>
            account.customerId === order.customerId ? nextAccount : account,
          )
        : [nextAccount, ...state.loyalty.accounts];
      nextLoyaltyActivity = [
        {
          id: createSequenceId('loyalty-event', nextLoyaltyEventSequence),
          customerId: order.customerId,
          type: 'earned',
          points: pointsToAward,
          description: `Points earned from delivered order ${order.reference}.`,
          orderId: order.id,
          createdAt: occurredAt,
        },
        ...state.loyalty.activity,
      ];
      nextLoyaltyEventSequence += 1;
      events.push(
        createOrderEvent(
          eventSequence++,
          order.id,
          'loyalty_awarded',
          `${pointsToAward} loyalty points added`,
          'system',
          occurredAt,
        ),
      );
    }

    const nextOrder: Order = {
      ...order,
      status: 'delivered',
      inventoryReservationStatus: 'committed',
      loyalty: {
        ...order.loyalty,
        pointsPending: 0,
        pointsAwarded: order.loyalty.pointsAwarded + pointsToAward,
        settledAt: occurredAt,
      },
      events,
      updatedAt: occurredAt,
    };
    const nextDelivery = {
      ...delivery,
      status: 'delivered' as const,
      completedAt: occurredAt,
      updatedAt: occurredAt,
    };
    const nextPayment: PaymentRecord = {
      ...payment,
      status: 'paid',
      paidAt: occurredAt,
      updatedAt: occurredAt,
    };

    set({
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      deliveries: {
        ...state.deliveries,
        records: state.deliveries.records.map((item) =>
          item.id === delivery.id ? nextDelivery : item,
        ),
      },
      payments: {
        records: state.payments.records.map((item) =>
          item.id === payment.id ? nextPayment : item,
        ),
      },
      inventory: {
        items: nextInventoryItems,
        adjustments: [...commitAdjustments.reverse(), ...state.inventory.adjustments],
      },
      loyalty: { accounts: nextLoyaltyAccounts, activity: nextLoyaltyActivity },
      meta: {
        ...state.meta,
        nextOrderEventSequence: eventSequence,
        nextInventoryEventSequence: inventorySequence,
        nextLoyaltyEventSequence,
      },
    });
    return commandSuccess(nextDelivery);
  };

  const failDelivery: AppCommands['failDelivery'] = (
    deliveryId,
    delivererId,
    reason,
    note,
    at,
  ) => {
    const state = get();
    const delivery = state.deliveries.records.find((item) => item.id === deliveryId);
    if (!delivery) return commandFailure('not_found', 'Delivery not found.');
    if (delivery.delivererId !== delivererId) {
      return commandFailure('not_allowed', 'This delivery is assigned to another deliverer.');
    }
    if (!canTransitionDelivery(delivery.status, 'failed')) {
      return commandFailure('invalid_transition', 'Start the delivery before reporting a failure.');
    }
    const order = state.orders.records.find((item) => item.id === delivery.orderId);
    if (!order || !canTransitionOrder(order.status, 'delivery_failed')) {
      return commandFailure('invalid_transition', 'The related order cannot be marked failed.');
    }

    const occurredAt = resolveTimestamp(at);
    const event = createOrderEvent(
      state.meta.nextOrderEventSequence,
      order.id,
      'delivery_failed',
      'Delivery attempt failed',
      'deliverer',
      occurredAt,
      delivererId,
      note?.trim() || 'The failed delivery requires Admin review.',
    );
    const nextDelivery = {
      ...delivery,
      status: 'failed' as const,
      failure: {
        reason,
        ...(note?.trim() ? { note: note.trim() } : {}),
        reportedAt: occurredAt,
        reportedBy: delivererId,
      },
      updatedAt: occurredAt,
    };
    const nextOrder: Order = {
      ...order,
      status: 'delivery_failed',
      events: [...order.events, event],
      updatedAt: occurredAt,
    };

    set({
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      deliveries: {
        ...state.deliveries,
        records: state.deliveries.records.map((item) =>
          item.id === delivery.id ? nextDelivery : item,
        ),
      },
      meta: { ...state.meta, nextOrderEventSequence: state.meta.nextOrderEventSequence + 1 },
    });
    return commandSuccess(nextDelivery);
  };

  const requestCancellation: AppCommands['requestCancellation'] = (
    orderId,
    customerId,
    reason,
    at,
  ) => {
    const state = get();
    const order = state.orders.records.find((item) => item.id === orderId);
    if (!order) return commandFailure('not_found', 'Order not found.');
    if (order.customerId !== customerId) {
      return commandFailure('not_allowed', 'Customers can request cancellation only for their own order.');
    }
    if (!canCancelOrder(order)) {
      return commandFailure(
        'not_allowed',
        'This order can no longer receive a cancellation request.',
      );
    }
    const cleanReason = reason.trim();
    if (cleanReason.length < CANCELLATION_POLICY.minimumReasonLength) {
      return commandFailure(
        'invalid_input',
        'Give a short reason for the cancellation request.',
        'reason',
      );
    }

    const occurredAt = resolveTimestamp(at);
    const cancellation = {
      id: createSequenceId('cancellation', state.meta.nextCancellationSequence),
      orderId: order.id,
      status: 'requested' as const,
      reason: cleanReason,
      requestedAt: occurredAt,
      requestedBy: customerId,
    };
    const event = createOrderEvent(
      state.meta.nextOrderEventSequence,
      order.id,
      'cancellation_requested',
      'Cancellation requested',
      'customer',
      occurredAt,
      customerId,
      cleanReason,
    );
    const nextOrder: Order = {
      ...order,
      cancellation,
      events: [...order.events, event],
      updatedAt: occurredAt,
    };

    set({
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      meta: {
        ...state.meta,
        nextOrderEventSequence: state.meta.nextOrderEventSequence + 1,
        nextCancellationSequence: state.meta.nextCancellationSequence + 1,
      },
    });
    return commandSuccess(nextOrder);
  };

  const resolveCancellation: AppCommands['resolveCancellation'] = (
    orderId,
    actorId,
    decision,
    note,
    at,
  ) => {
    const state = get();
    const order = state.orders.records.find((item) => item.id === orderId);
    if (!order) return commandFailure('not_found', 'Order not found.');
    if (!order.cancellation || order.cancellation.status !== 'requested') {
      return commandFailure('invalid_transition', 'This order has no pending cancellation request.');
    }
    if (decision === 'approve' && !canTransitionOrder(order.status, 'cancelled')) {
      return commandFailure('invalid_transition', 'This order can no longer be cancelled.');
    }

    const occurredAt = resolveTimestamp(at);
    const approved = decision === 'approve';
    const nextCancellation = {
      ...order.cancellation,
      status: approved ? ('approved' as const) : ('rejected' as const),
      reviewedAt: occurredAt,
      reviewedBy: actorId,
      ...(note?.trim() ? { reviewNote: note.trim() } : {}),
    };
    let eventSequence = state.meta.nextOrderEventSequence;
    const reviewEvent = createOrderEvent(
      eventSequence++,
      order.id,
      approved ? 'cancellation_approved' : 'cancellation_rejected',
      approved ? 'Cancellation approved' : 'Cancellation rejected',
      'admin',
      occurredAt,
      actorId,
      note?.trim(),
    );

    if (!approved) {
      const nextOrder: Order = {
        ...order,
        cancellation: nextCancellation,
        events: [...order.events, reviewEvent],
        updatedAt: occurredAt,
      };
      set({
        orders: {
          records: state.orders.records.map((item) =>
            item.id === order.id ? nextOrder : item,
          ),
        },
        meta: { ...state.meta, nextOrderEventSequence: eventSequence },
      });
      return commandSuccess(nextOrder);
    }

    const shouldRelease = order.inventoryReservationStatus === 'reserved';
    let inventorySequence = state.meta.nextInventoryEventSequence;
    const releaseAdjustments = shouldRelease
      ? order.items.map((item) => {
          const before = state.inventory.items.find(
            (candidate) => candidate.productId === item.productId,
          );
          if (!before || before.stockReserved < item.quantity) return null;
          const adjustment = {
            id: createSequenceId('inventory-event', inventorySequence),
            productId: item.productId,
            mode: 'release' as const,
            quantity: item.quantity,
            stockOnHandBefore: before.stockOnHand,
            stockOnHandAfter: before.stockOnHand,
            stockReservedBefore: before.stockReserved,
            stockReservedAfter: before.stockReserved - item.quantity,
            source: 'order_release' as const,
            reason: `Released after cancellation of ${order.reference}.`,
            actorId: 'system' as const,
            createdAt: occurredAt,
          };
          inventorySequence += 1;
          return adjustment;
        })
      : [];

    if (releaseAdjustments.some((item) => item === null)) {
      return commandFailure('conflict', 'Reserved stock is inconsistent; cancellation was not applied.');
    }

    const inventoryReleaseEvent = shouldRelease
      ? createOrderEvent(
          eventSequence++,
          order.id,
          'inventory_released',
          'Reserved stock released',
          'system',
          occurredAt,
        )
      : null;
    const nextOrder: Order = {
      ...order,
      status: 'cancelled',
      cancellation: nextCancellation,
      inventoryReservationStatus: shouldRelease ? 'released' : order.inventoryReservationStatus,
      loyalty: { ...order.loyalty, pointsPending: 0 },
      events: [
        ...order.events,
        reviewEvent,
        ...(inventoryReleaseEvent ? [inventoryReleaseEvent] : []),
      ],
      updatedAt: occurredAt,
    };
    const nextInventoryItems = shouldRelease
      ? state.inventory.items.map((inventoryItem) => {
          const item = order.items.find((candidate) => candidate.productId === inventoryItem.productId);
          return item
            ? {
                ...inventoryItem,
                stockReserved: inventoryItem.stockReserved - item.quantity,
                updatedAt: occurredAt,
              }
            : inventoryItem;
        })
      : state.inventory.items;
    const delivery = state.deliveries.records.find((item) => item.id === order.deliveryId);
    const payment = state.payments.records.find((item) => item.id === order.paymentId);
    const nextPayment =
      payment && ['collection_due', 'awaiting_verification'].includes(payment.status)
        ? { ...payment, status: 'cancelled' as const, updatedAt: occurredAt }
        : payment;

    set({
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      deliveries: {
        ...state.deliveries,
        records: state.deliveries.records.map((item) =>
          item.id === delivery?.id
            ? { ...item, status: 'cancelled' as const, updatedAt: occurredAt }
            : item,
        ),
      },
      payments: {
        records: state.payments.records.map((item) =>
          item.id === nextPayment?.id ? nextPayment : item,
        ),
      },
      inventory: {
        items: nextInventoryItems,
        adjustments: [
          ...releaseAdjustments.filter(
            (item): item is NonNullable<typeof item> => item !== null,
          ).reverse(),
          ...state.inventory.adjustments,
        ],
      },
      meta: {
        ...state.meta,
        nextOrderEventSequence: eventSequence,
        nextInventoryEventSequence: inventorySequence,
      },
    });
    return commandSuccess(nextOrder);
  };

  const verifyPayment: AppCommands['verifyPayment'] = (
    orderId,
    actorId,
    demoReference,
    at,
  ) => {
    const state = get();
    const order = state.orders.records.find((item) => item.id === orderId);
    const payment = state.payments.records.find((item) => item.id === order?.paymentId);
    if (!order || !payment) return commandFailure('not_found', 'Payment record not found.');
    if (payment.method !== 'gcash' || payment.status !== 'awaiting_verification') {
      return commandFailure(
        'invalid_transition',
        'Only a GCash payment awaiting verification can be verified.',
      );
    }
    const occurredAt = resolveTimestamp(at);
    const nextPayment: PaymentRecord = {
      ...payment,
      status: 'verified',
      demoReference: demoReference?.trim() || `GCASH-${order.reference}`,
      verifiedAt: occurredAt,
      updatedAt: occurredAt,
    };
    const event = createOrderEvent(
      state.meta.nextOrderEventSequence,
      order.id,
      'payment_verified',
      'GCash payment verified',
      'admin',
      occurredAt,
      actorId,
    );
    const nextOrder = {
      ...order,
      events: [...order.events, event],
      updatedAt: occurredAt,
    };

    set({
      payments: {
        records: state.payments.records.map((item) =>
          item.id === payment.id ? nextPayment : item,
        ),
      },
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      meta: { ...state.meta, nextOrderEventSequence: state.meta.nextOrderEventSequence + 1 },
    });
    return commandSuccess(nextPayment);
  };

  const updateRefund: AppCommands['updateRefund'] = (
    orderId,
    actorId,
    targetStatus,
    note,
    at,
  ) => {
    const state = get();
    const order = state.orders.records.find((item) => item.id === orderId);
    const payment = state.payments.records.find((item) => item.id === order?.paymentId);
    if (!order || !payment) return commandFailure('not_found', 'Order payment record not found.');

    const allowedTransitions: Record<RefundStatus, readonly RefundStatus[]> = {
      pending: ['processing', 'rejected'],
      processing: ['refunded', 'rejected'],
      refunded: [],
      rejected: [],
    };
    const occurredAt = resolveTimestamp(at);
    let refund = order.refund;
    let nextRefundSequence = state.meta.nextRefundSequence;

    if (!refund) {
      if (targetStatus !== 'pending' || !canRequestRefund(order, payment.status)) {
        return commandFailure(
          'not_allowed',
          'A refund can begin only for an eligible recorded payment after cancellation or failure.',
        );
      }
      refund = {
        id: createSequenceId('refund', nextRefundSequence),
        orderId: order.id,
        paymentId: payment.id,
        amountCentavos: payment.amountCentavos,
        status: 'pending',
        reason:
          order.status === 'cancelled'
            ? 'Approved order cancellation.'
            : 'Failed delivery under Admin review.',
        createdAt: occurredAt,
        updatedAt: occurredAt,
      };
      nextRefundSequence += 1;
    } else {
      if (!allowedTransitions[refund.status].includes(targetStatus)) {
        return commandFailure(
          'invalid_transition',
          `Refund cannot move from ${refund.status} to ${targetStatus}.`,
        );
      }
      refund = {
        ...refund,
        status: targetStatus,
        updatedAt: occurredAt,
        ...(['refunded', 'rejected'].includes(targetStatus)
          ? {
              resolvedAt: occurredAt,
              ...(note?.trim() ? { resolutionNote: note.trim() } : {}),
            }
          : {}),
      };
    }

    const event = createOrderEvent(
      state.meta.nextOrderEventSequence,
      order.id,
      'refund_updated',
      `Refund ${targetStatus.replace('_', ' ')}`,
      'admin',
      occurredAt,
      actorId,
      note?.trim(),
    );
    const nextOrder: Order = {
      ...order,
      refund,
      events: [...order.events, event],
      updatedAt: occurredAt,
    };
    const nextPayment: PaymentRecord =
      targetStatus === 'refunded'
        ? { ...payment, status: 'refunded', updatedAt: occurredAt }
        : payment;

    set({
      orders: {
        records: state.orders.records.map((item) => (item.id === order.id ? nextOrder : item)),
      },
      payments: {
        records: state.payments.records.map((item) =>
          item.id === payment.id ? nextPayment : item,
        ),
      },
      meta: {
        ...state.meta,
        nextOrderEventSequence: state.meta.nextOrderEventSequence + 1,
        nextRefundSequence,
      },
    });
    return commandSuccess(nextOrder);
  };

  const adjustStock: AppCommands['adjustStock'] = (input) => {
    const state = get();
    const inventoryItem = state.inventory.items.find(
      (item) => item.productId === input.productId,
    );
    if (!inventoryItem) return commandFailure('not_found', 'Inventory item not found.');
    if (!Number.isInteger(input.quantity) || input.quantity < 0) {
      return commandFailure('invalid_input', 'Stock quantity must be a whole number.', 'quantity');
    }
    if (input.mode !== 'set' && input.quantity === 0) {
      return commandFailure('invalid_input', 'Enter a quantity greater than zero.', 'quantity');
    }
    const cleanReason = input.reason.trim();
    if (cleanReason.length < 4) {
      return commandFailure('invalid_input', 'Record a reason for the stock adjustment.', 'reason');
    }

    const stockOnHandAfter =
      input.mode === 'increase'
        ? inventoryItem.stockOnHand + input.quantity
        : input.mode === 'decrease'
          ? inventoryItem.stockOnHand - input.quantity
          : input.quantity;
    if (stockOnHandAfter < inventoryItem.stockReserved) {
      return commandFailure(
        'conflict',
        'Physical stock cannot be set below the quantity reserved by active orders.',
        'quantity',
      );
    }
    const occurredAt = resolveTimestamp(input.at);
    const nextItem = {
      ...inventoryItem,
      stockOnHand: stockOnHandAfter,
      updatedAt: occurredAt,
    };
    const adjustment = {
      id: createSequenceId('inventory-event', state.meta.nextInventoryEventSequence),
      productId: inventoryItem.productId,
      mode: input.mode,
      quantity: input.quantity,
      stockOnHandBefore: inventoryItem.stockOnHand,
      stockOnHandAfter,
      stockReservedBefore: inventoryItem.stockReserved,
      stockReservedAfter: inventoryItem.stockReserved,
      source: 'admin_adjustment' as const,
      reason: cleanReason,
      actorId: input.actorId,
      createdAt: occurredAt,
    };

    set({
      inventory: {
        items: state.inventory.items.map((item) =>
          item.productId === inventoryItem.productId ? nextItem : item,
        ),
        adjustments: [adjustment, ...state.inventory.adjustments],
      },
      meta: {
        ...state.meta,
        nextInventoryEventSequence: state.meta.nextInventoryEventSequence + 1,
      },
    });
    return commandSuccess(nextItem);
  };

  const adjustLoyalty: AppCommands['adjustLoyalty'] = (input) => {
    const state = get();
    const customer = state.customers.records.find((item) => item.id === input.customerId);
    if (!customer) return commandFailure('not_found', 'Customer not found.');
    if (!Number.isInteger(input.pointsDelta) || input.pointsDelta === 0) {
      return commandFailure(
        'invalid_input',
        'Loyalty adjustment must be a non-zero whole number.',
        'pointsDelta',
      );
    }
    const cleanReason = input.reason.trim();
    if (cleanReason.length < 4) {
      return commandFailure('invalid_input', 'Record a reason for the loyalty adjustment.', 'reason');
    }
    const existingAccount = state.loyalty.accounts.find(
      (account) => account.customerId === input.customerId,
    );
    const pointsAvailable = (existingAccount?.pointsAvailable ?? 0) + input.pointsDelta;
    if (pointsAvailable < 0) {
      return commandFailure('conflict', 'Loyalty points cannot fall below zero.', 'pointsDelta');
    }
    const occurredAt = resolveTimestamp(input.at);
    const nextAccount = {
      customerId: input.customerId,
      pointsAvailable,
      updatedAt: occurredAt,
    };
    const activity = {
      id: createSequenceId('loyalty-event', state.meta.nextLoyaltyEventSequence),
      customerId: input.customerId,
      type: input.pointsDelta > 0 ? ('manual_credit' as const) : ('manual_debit' as const),
      points: Math.abs(input.pointsDelta),
      description: `Admin ${input.pointsDelta > 0 ? 'added' : 'deducted'} ${Math.abs(input.pointsDelta)} points.`,
      reason: cleanReason,
      createdAt: occurredAt,
    };
    const accounts = existingAccount
      ? state.loyalty.accounts.map((account) =>
          account.customerId === input.customerId ? nextAccount : account,
        )
      : [nextAccount, ...state.loyalty.accounts];

    set({
      loyalty: { accounts, activity: [activity, ...state.loyalty.activity] },
      meta: {
        ...state.meta,
        nextLoyaltyEventSequence: state.meta.nextLoyaltyEventSequence + 1,
      },
    });
    return commandSuccess(nextAccount);
  };

  const resetDemoState: AppCommands['resetDemoState'] = () => {
    set(createInitialAppData());
  };

  return {
    ...createInitialAppData(),
    commands: {
      signIn,
      signOut,
      addCartItem,
      updateCartItemQuantity,
      removeCartItem,
      clearCart,
      setLastPlacedOrderId,
      placeOrder,
      confirmOrder,
      markOrderPreparing,
      assignDelivery,
      acceptDelivery,
      startDelivery,
      completeDelivery,
      failDelivery,
      requestCancellation,
      resolveCancellation,
      verifyPayment,
      updateRefund,
      adjustStock,
      adjustLoyalty,
      resetDemoState,
    },
  };
});
