import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '../../../store';
import {
  selectDeliveryForOrder,
  selectOrderById,
  selectPaymentForOrder,
} from '../../../store/selectors';
import { authenticateCustomerFixture } from '@/test-utils/auth';
import { getAvailableStock } from '../../../utils';

const ORDER_INPUT = {
  customerId: 'customer-01',
  items: [
    { productId: 'product-gas-regulator', quantity: 1 },
    { productId: 'product-water-pump', quantity: 1 },
  ],
  deliveryAddressId: 'address-01-a',
  deliverySchedule: {
    date: '2026-08-14',
    windowLabel: '9:00 AM–12:00 PM',
  },
  paymentMethod: 'cod' as const,
  placedAt: '2026-08-12T12:00:00.000Z',
};

describe('customer order continuity', () => {
  beforeEach(() => {
    const commands = useAppStore.getState().commands;
    commands.resetAppState();
    authenticateCustomerFixture();
  });

  it('keeps one placed order synchronized for confirmation and detail selectors', () => {
    const before = useAppStore.getState();
    const gasStockBefore = before.inventory.items.find(
      (item) => item.productId === 'product-gas-regulator',
    );
    expect(gasStockBefore).toBeDefined();

    const result = before.commands.placeOrder(ORDER_INPUT);
    expect(result.ok).toBe(true);
    if (!result.ok || !gasStockBefore) return;

    const state = useAppStore.getState();
    const order = selectOrderById(result.value.id)(state);
    const delivery = selectDeliveryForOrder(result.value.id)(state);
    const payment = selectPaymentForOrder(result.value.id)(state);
    const gasStockAfter = state.inventory.items.find(
      (item) => item.productId === 'product-gas-regulator',
    );

    expect(order?.reference).toBe(result.value.reference);
    expect(delivery?.id).toBe(order?.deliveryId);
    expect(payment?.id).toBe(order?.paymentId);
    expect(payment?.status).toBe('collection_due');
    expect(order?.totals.deliveryFeeCentavos).toBe(0);
    expect(order?.inventoryReservationStatus).toBe('reserved');
    expect(gasStockAfter && getAvailableStock(gasStockAfter)).toBe(
      getAvailableStock(gasStockBefore) - 1,
    );
  });

  it('rejects invalid, cross-customer, and duplicate cancellation requests', () => {
    const placed = useAppStore.getState().commands.placeOrder(ORDER_INPUT);
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    const commands = useAppStore.getState().commands;
    expect(
      commands.requestCancellation(
        placed.value.id,
        'customer-02',
        'Wrong customer request',
      ).ok,
    ).toBe(false);
    expect(
      commands.requestCancellation(placed.value.id, 'customer-01', 'no').ok,
    ).toBe(false);

    const requested = commands.requestCancellation(
      placed.value.id,
      'customer-01',
      'No longer needed',
      '2026-08-12T12:05:00.000Z',
    );
    expect(requested.ok).toBe(true);
    expect(
      commands.requestCancellation(
        placed.value.id,
        'customer-01',
        'Second request',
      ).ok,
    ).toBe(false);
    expect(
      useAppStore.getState().orders.records.find((order) => order.id === placed.value.id)
        ?.cancellation?.status,
    ).toBe('requested');
  });

  it('releases reserved stock once after an approved cancellation', () => {
    const initial = useAppStore.getState();
    const stockBefore = initial.inventory.items.find(
      (item) => item.productId === 'product-water-pump',
    );
    const placed = initial.commands.placeOrder(ORDER_INPUT);
    expect(placed.ok).toBe(true);
    if (!placed.ok || !stockBefore) return;

    const requested = useAppStore.getState().commands.requestCancellation(
      placed.value.id,
      'customer-01',
      'Schedule changed',
      '2026-08-12T12:05:00.000Z',
    );
    expect(requested.ok).toBe(true);

    const approved = useAppStore.getState().commands.resolveCancellation(
      placed.value.id,
      'user-admin-01',
      'approve',
      'Approved in QA.',
      '2026-08-12T12:10:00.000Z',
    );
    expect(approved.ok).toBe(true);
    const finalState = useAppStore.getState();
    const stockAfter = finalState.inventory.items.find(
      (item) => item.productId === 'product-water-pump',
    );
    expect(stockAfter?.stockReserved).toBe(stockBefore.stockReserved);
    expect(approved.ok && approved.value.inventoryReservationStatus).toBe('released');
    expect(
      finalState.commands.resolveCancellation(
        placed.value.id,
        'user-admin-01',
        'approve',
      ).ok,
    ).toBe(false);
    expect(
      finalState.inventory.items.find((item) => item.productId === 'product-water-pump')
        ?.stockReserved,
    ).toBe(stockBefore.stockReserved);
  });
});
