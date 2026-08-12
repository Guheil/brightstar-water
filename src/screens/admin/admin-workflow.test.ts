import { beforeEach, describe, expect, it } from 'vitest';
import { selectDelivererQueue, useAppStore } from '@/store';
import type { CommandResult, Product } from '@/types';
import {
  savePrototypeProduct,
  setPrototypeProductActive,
} from './productPrototypeState';
import { ADMIN_ACTOR_ID } from './utils';

function expectSuccess<Value>(result: CommandResult<Value>): Value {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

describe('Admin high-impact prototype workflows', () => {
  beforeEach(() => {
    useAppStore.getState().commands.resetDemoState();
  });

  it('confirms, prepares, and assigns one order across role queues', () => {
    const commands = useAppStore.getState().commands;

    expectSuccess(commands.confirmOrder('order-0001', ADMIN_ACTOR_ID));
    expect(useAppStore.getState().orders.records.find((item) => item.id === 'order-0001')?.status)
      .toBe('confirmed');

    expectSuccess(commands.markOrderPreparing('order-0001', ADMIN_ACTOR_ID));
    expect(useAppStore.getState().orders.records.find((item) => item.id === 'order-0001')?.status)
      .toBe('preparing');

    expectSuccess(
      commands.assignDelivery(
        'order-0001',
        'deliverer-demo-02',
        ADMIN_ACTOR_ID,
      ),
    );

    const state = useAppStore.getState();
    expect(state.orders.records.find((item) => item.id === 'order-0001')?.status)
      .toBe('assigned_for_delivery');
    expect(state.deliveries.records.find((item) => item.id === 'delivery-0001'))
      .toMatchObject({ status: 'assigned', delivererId: 'deliverer-demo-02' });
    expect(selectDelivererQueue('deliverer-demo-02')(state).map((item) => item.id))
      .toContain('delivery-0001');
  });

  it('places and verifies a fictional GCash order without external payment state', () => {
    const commands = useAppStore.getState().commands;
    const order = expectSuccess(
      commands.placeOrder({
        customerId: 'customer-demo-01',
        items: [{ productId: 'product-water-pump', quantity: 1 }],
        deliveryAddressId: 'address-demo-01-a',
        deliverySchedule: {
          date: '2026-08-14',
          windowLabel: '9:00 AM to 12:00 PM',
        },
        paymentMethod: 'gcash',
      }),
    );

    expect(useAppStore.getState().payments.records.find((item) => item.orderId === order.id))
      .toMatchObject({ method: 'gcash', status: 'awaiting_verification' });

    expectSuccess(
      commands.verifyPayment(
        order.id,
        ADMIN_ACTOR_ID,
        'DEMO-QA-GCASH',
      ),
    );
    expect(useAppStore.getState().payments.records.find((item) => item.orderId === order.id))
      .toMatchObject({ status: 'verified', demoReference: 'DEMO-QA-GCASH' });
  });

  it('approves cancellation and synchronizes inventory, delivery, and payment', () => {
    const commands = useAppStore.getState().commands;
    const reservedBefore = useAppStore
      .getState()
      .inventory.items.find((item) => item.productId === 'product-gas-11kg')
      ?.stockReserved;

    expectSuccess(
      commands.requestCancellation(
        'order-0001',
        'customer-demo-01',
        'QA cancellation request',
      ),
    );
    expectSuccess(
      commands.resolveCancellation(
        'order-0001',
        ADMIN_ACTOR_ID,
        'approve',
        'Approved during Admin QA.',
      ),
    );

    const state = useAppStore.getState();
    expect(state.orders.records.find((item) => item.id === 'order-0001'))
      .toMatchObject({
        status: 'cancelled',
        inventoryReservationStatus: 'released',
        cancellation: { status: 'approved' },
      });
    expect(state.deliveries.records.find((item) => item.id === 'delivery-0001')?.status)
      .toBe('cancelled');
    expect(state.payments.records.find((item) => item.id === 'payment-0001')?.status)
      .toBe('cancelled');
    expect(
      state.inventory.items.find((item) => item.productId === 'product-gas-11kg')
        ?.stockReserved,
    ).toBe((reservedBefore ?? 1) - 1);
  });

  it('rejects a cancellation without changing the order workflow state', () => {
    const commands = useAppStore.getState().commands;
    expectSuccess(
      commands.requestCancellation(
        'order-0001',
        'customer-demo-01',
        'QA rejection request',
      ),
    );
    expectSuccess(
      commands.resolveCancellation(
        'order-0001',
        ADMIN_ACTOR_ID,
        'reject',
        'Rejected during Admin QA.',
      ),
    );

    expect(useAppStore.getState().orders.records.find((item) => item.id === 'order-0001'))
      .toMatchObject({ status: 'pending_review', cancellation: { status: 'rejected' } });
  });

  it('advances an eligible refund and synchronizes its payment record', () => {
    const commands = useAppStore.getState().commands;

    expectSuccess(
      commands.updateRefund(
        'order-0004',
        ADMIN_ACTOR_ID,
        'pending',
        'Begin failed-delivery refund QA.',
      ),
    );
    expectSuccess(
      commands.updateRefund(
        'order-0004',
        ADMIN_ACTOR_ID,
        'processing',
        'Processing during QA.',
      ),
    );
    expectSuccess(
      commands.updateRefund(
        'order-0004',
        ADMIN_ACTOR_ID,
        'refunded',
        'Completed during QA.',
      ),
    );

    const state = useAppStore.getState();
    expect(state.orders.records.find((item) => item.id === 'order-0004')?.refund?.status)
      .toBe('refunded');
    expect(state.payments.records.find((item) => item.id === 'payment-0004')?.status)
      .toBe('refunded');
  });

  it('records inventory and loyalty adjustments with audit reasons', () => {
    const commands = useAppStore.getState().commands;
    const stockBefore = useAppStore
      .getState()
      .inventory.items.find((item) => item.productId === 'product-gas-regulator')
      ?.stockOnHand;
    const pointsBefore = useAppStore
      .getState()
      .loyalty.accounts.find((item) => item.customerId === 'customer-demo-01')
      ?.pointsAvailable;

    expectSuccess(
      commands.adjustStock({
        productId: 'product-gas-regulator',
        mode: 'increase',
        quantity: 3,
        reason: 'QA physical count adjustment.',
        actorId: ADMIN_ACTOR_ID,
      }),
    );
    expectSuccess(
      commands.adjustLoyalty({
        customerId: 'customer-demo-01',
        pointsDelta: 5,
        reason: 'QA loyalty adjustment.',
        actorId: ADMIN_ACTOR_ID,
      }),
    );

    const state = useAppStore.getState();
    expect(
      state.inventory.items.find((item) => item.productId === 'product-gas-regulator')
        ?.stockOnHand,
    ).toBe((stockBefore ?? 0) + 3);
    expect(state.inventory.adjustments[0]).toMatchObject({
      productId: 'product-gas-regulator',
      reason: 'QA physical count adjustment.',
    });
    expect(
      state.loyalty.accounts.find((item) => item.customerId === 'customer-demo-01')
        ?.pointsAvailable,
    ).toBe((pointsBefore ?? 0) + 5);
    expect(state.loyalty.activity[0]).toMatchObject({
      customerId: 'customer-demo-01',
      reason: 'QA loyalty adjustment.',
    });
  });

  it('keeps product create, edit, activation, inventory, and reset state consistent', () => {
    const original = useAppStore
      .getState()
      .catalog.products.find((item) => item.id === 'product-gas-regulator')!;

    setPrototypeProductActive(original.id, false, '2026-08-12T00:00:00.000Z');
    expect(useAppStore.getState().catalog.products.find((item) => item.id === original.id)?.isActive)
      .toBe(false);

    savePrototypeProduct(
      { ...original, name: 'QA regulator edit', updatedAt: '2026-08-12T01:00:00.000Z' },
      false,
    );
    expect(useAppStore.getState().catalog.products.find((item) => item.id === original.id)?.name)
      .toBe('QA regulator edit');

    const newProduct: Product = {
      ...original,
      id: 'product-admin-qa',
      slug: 'admin-qa-product',
      sku: 'QA-PRODUCT',
      name: 'Admin QA product',
      createdAt: '2026-08-12T02:00:00.000Z',
      updatedAt: '2026-08-12T02:00:00.000Z',
    };
    savePrototypeProduct(newProduct, true);
    expect(useAppStore.getState().catalog.products[0]).toEqual(newProduct);
    expect(useAppStore.getState().inventory.items[0]).toMatchObject({
      productId: newProduct.id,
      stockOnHand: 0,
      stockReserved: 0,
    });

    useAppStore.getState().commands.resetDemoState();
    expect(useAppStore.getState().catalog.products.some((item) => item.id === newProduct.id))
      .toBe(false);
    expect(useAppStore.getState().catalog.products.find((item) => item.id === original.id))
      .toMatchObject({ name: original.name, isActive: true });
  });
});
