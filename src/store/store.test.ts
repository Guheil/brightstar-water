import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/store';
import { authenticateCustomerFixture } from '@/test-utils/auth';
import { hydrateCatalogFixtures } from '@/test-utils/catalog';

const CUSTOMER_ID = 'customer-01';
const ADMIN_ID = 'user-admin-01';
const DELIVERER_ID = 'deliverer-01';
const PRODUCT_ID = 'product-gas-regulator';
const AT = '2026-08-12T04:00:00.000Z';

const placeCodOrder = () =>
  useAppStore.getState().commands.placeOrder({
    customerId: CUSTOMER_ID,
    items: [{ productId: PRODUCT_ID, quantity: 2 }],
    deliveryAddressId: 'address-01-a',
    deliverySchedule: {
      date: '2026-08-14',
      windowLabel: '9:00 AM–12:00 PM',
    },
    paymentMethod: 'cod',
    placedAt: AT,
  });

describe('frontend order workflow', () => {
  beforeEach(() => {
    const commands = useAppStore.getState().commands;
    commands.resetAppState();
    hydrateCatalogFixtures();
    authenticateCustomerFixture(AT);
  });

  it('reserves stock atomically when placing an order', () => {
    const before = useAppStore
      .getState()
      .inventory.items.find((item) => item.productId === PRODUCT_ID)!;
    const result = placeCodOrder();

    expect(result.ok).toBe(true);
    const after = useAppStore
      .getState()
      .inventory.items.find((item) => item.productId === PRODUCT_ID)!;
    expect(after.stockReserved).toBe(before.stockReserved + 2);
    if (result.ok) {
      expect(result.value.status).toBe('pending_review');
      expect(result.value.inventoryReservationStatus).toBe('reserved');
    }
  });

  it('rejects an order without sufficient stock without partial writes', () => {
    const orderCount = useAppStore.getState().orders.records.length;
    const result = useAppStore.getState().commands.placeOrder({
      customerId: CUSTOMER_ID,
      items: [{ productId: PRODUCT_ID, quantity: 999 }],
      deliveryAddressId: 'address-01-a',
      deliverySchedule: { date: '2026-08-14', windowLabel: '1:00 PM–4:00 PM' },
      paymentMethod: 'cod',
      placedAt: AT,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('insufficient_stock');
    expect(useAppStore.getState().orders.records).toHaveLength(orderCount);
  });

  it('releases reserved stock after an approved cancellation', () => {
    const placed = placeCodOrder();
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    const request = useAppStore
      .getState()
      .commands.requestCancellation(placed.value.id, CUSTOMER_ID, 'No longer needed', AT);
    expect(request.ok).toBe(true);
    const resolution = useAppStore
      .getState()
      .commands.resolveCancellation(placed.value.id, ADMIN_ID, 'approve', 'Approved', AT);

    expect(resolution.ok).toBe(true);
    if (resolution.ok) {
      expect(resolution.value.status).toBe('cancelled');
      expect(resolution.value.inventoryReservationStatus).toBe('released');
    }
  });

  it('redeems available loyalty points and calculates future earnings from net merchandise spend', () => {
    const beforeAccount = useAppStore
      .getState()
      .loyalty.accounts.find((account) => account.customerId === CUSTOMER_ID)!;

    const placed = useAppStore.getState().commands.placeOrder({
      customerId: CUSTOMER_ID,
      items: [{ productId: PRODUCT_ID, quantity: 2 }],
      deliveryAddressId: 'address-01-a',
      deliverySchedule: { date: '2026-08-14', windowLabel: '9:00 AM–12:00 PM' },
      paymentMethod: 'cod',
      requestedLoyaltyPoints: 10,
      placedAt: AT,
    });

    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    expect(placed.value.loyalty.pointsRedeemed).toBe(10);
    expect(placed.value.loyalty.discountCentavos).toBe(1_000);
    expect(placed.value.loyalty.qualifyingSubtotalCentavos).toBe(69_000);
    expect(placed.value.loyalty.pointsPending).toBe(6);
    expect(placed.value.totals.subtotalCentavos).toBe(70_000);
    expect(placed.value.totals.deliveryFeeCentavos).toBe(0);
    expect(placed.value.totals.totalCentavos).toBe(69_000);

    const afterAccount = useAppStore
      .getState()
      .loyalty.accounts.find((account) => account.customerId === CUSTOMER_ID)!;
    expect(afterAccount.pointsAvailable).toBe(beforeAccount.pointsAvailable - 10);
    expect(
      useAppStore.getState().loyalty.activity.some(
        (activity) => activity.orderId === placed.value.id && activity.type === 'redeemed' && activity.points === 10,
      ),
    ).toBe(true);
  });

  it('rejects loyalty redemption above the available balance without partial writes', () => {
    const before = useAppStore.getState();
    const beforeOrderCount = before.orders.records.length;
    const beforeInventory = before.inventory.items.find((item) => item.productId === PRODUCT_ID)!;
    const beforeBalance = before.loyalty.accounts.find((account) => account.customerId === CUSTOMER_ID)!.pointsAvailable;

    const result = useAppStore.getState().commands.placeOrder({
      customerId: CUSTOMER_ID,
      items: [{ productId: PRODUCT_ID, quantity: 2 }],
      deliveryAddressId: 'address-01-a',
      deliverySchedule: { date: '2026-08-14', windowLabel: '9:00 AM–12:00 PM' },
      paymentMethod: 'cod',
      requestedLoyaltyPoints: beforeBalance + 1,
      placedAt: AT,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.field).toBe('requestedLoyaltyPoints');
    const after = useAppStore.getState();
    expect(after.orders.records).toHaveLength(beforeOrderCount);
    expect(after.inventory.items.find((item) => item.productId === PRODUCT_ID)!.stockReserved).toBe(beforeInventory.stockReserved);
    expect(after.loyalty.accounts.find((account) => account.customerId === CUSTOMER_ID)!.pointsAvailable).toBe(beforeBalance);
  });

  it('restores redeemed points exactly once after an approved cancellation', () => {
    const beforeBalance = useAppStore
      .getState()
      .loyalty.accounts.find((account) => account.customerId === CUSTOMER_ID)!.pointsAvailable;
    const placed = useAppStore.getState().commands.placeOrder({
      customerId: CUSTOMER_ID,
      items: [{ productId: PRODUCT_ID, quantity: 2 }],
      deliveryAddressId: 'address-01-a',
      deliverySchedule: { date: '2026-08-14', windowLabel: '9:00 AM–12:00 PM' },
      paymentMethod: 'cod',
      requestedLoyaltyPoints: 12,
      placedAt: AT,
    });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    expect(useAppStore.getState().commands.requestCancellation(
      placed.value.id,
      CUSTOMER_ID,
      'No longer needed',
      AT,
    ).ok).toBe(true);

    const resolved = useAppStore.getState().commands.resolveCancellation(
      placed.value.id,
      ADMIN_ID,
      'approve',
      'Approved',
      AT,
    );
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;

    const afterBalance = useAppStore
      .getState()
      .loyalty.accounts.find((account) => account.customerId === CUSTOMER_ID)!.pointsAvailable;
    expect(afterBalance).toBe(beforeBalance);
    expect(resolved.value.loyalty.redemptionRestoredAt).toBe(AT);
    expect(
      useAppStore.getState().loyalty.activity.filter(
        (activity) => activity.orderId === placed.value.id && activity.type === 'restored',
      ),
    ).toHaveLength(1);

    const secondResolution = useAppStore.getState().commands.resolveCancellation(
      placed.value.id,
      ADMIN_ID,
      'approve',
      'Duplicate attempt',
      AT,
    );
    expect(secondResolution.ok).toBe(false);
    expect(
      useAppStore.getState().loyalty.accounts.find((account) => account.customerId === CUSTOMER_ID)!.pointsAvailable,
    ).toBe(beforeBalance);
  });

  it('restores redeemed points when an active delivery becomes terminally failed', () => {
    const beforeBalance = useAppStore
      .getState()
      .loyalty.accounts.find((account) => account.customerId === CUSTOMER_ID)!.pointsAvailable;
    const placed = useAppStore.getState().commands.placeOrder({
      customerId: CUSTOMER_ID,
      items: [{ productId: PRODUCT_ID, quantity: 2 }],
      deliveryAddressId: 'address-01-a',
      deliverySchedule: { date: '2026-08-14', windowLabel: '9:00 AM–12:00 PM' },
      paymentMethod: 'cod',
      requestedLoyaltyPoints: 8,
      placedAt: AT,
    });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    expect(useAppStore.getState().commands.confirmOrder(placed.value.id, ADMIN_ID, AT).ok).toBe(true);
    const assigned = useAppStore.getState().commands.assignDelivery(placed.value.id, DELIVERER_ID, ADMIN_ID, AT);
    expect(assigned.ok).toBe(true);
    if (!assigned.ok) return;
    expect(useAppStore.getState().commands.acceptDelivery(assigned.value.id, DELIVERER_ID, AT).ok).toBe(true);
    expect(useAppStore.getState().commands.startDelivery(assigned.value.id, DELIVERER_ID, AT).ok).toBe(true);

    const failed = useAppStore.getState().commands.failDelivery(
      assigned.value.id,
      DELIVERER_ID,
      'customer_unavailable',
      'Customer could not receive the order.',
      AT,
    );
    expect(failed.ok).toBe(true);

    const order = useAppStore.getState().orders.records.find((item) => item.id === placed.value.id)!;
    expect(order.status).toBe('delivery_failed');
    expect(order.loyalty.pointsPending).toBe(0);
    expect(order.loyalty.redemptionRestoredAt).toBe(AT);
    expect(
      useAppStore.getState().loyalty.accounts.find((account) => account.customerId === CUSTOMER_ID)!.pointsAvailable,
    ).toBe(beforeBalance);
  });

  it('commits inventory and loyalty only after the delivery succeeds', () => {
    const placed = placeCodOrder();
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    const confirm = useAppStore
      .getState()
      .commands.confirmOrder(placed.value.id, ADMIN_ID, AT);
    expect(confirm.ok).toBe(true);
    const assigned = useAppStore
      .getState()
      .commands.assignDelivery(placed.value.id, DELIVERER_ID, ADMIN_ID, AT);
    expect(assigned.ok).toBe(true);
    if (!assigned.ok) return;

    expect(
      useAppStore.getState().commands.acceptDelivery(assigned.value.id, DELIVERER_ID, AT).ok,
    ).toBe(true);
    expect(
      useAppStore.getState().commands.startDelivery(assigned.value.id, DELIVERER_ID, AT).ok,
    ).toBe(true);
    const completed = useAppStore
      .getState()
      .commands.completeDelivery(assigned.value.id, DELIVERER_ID, AT);

    expect(completed.ok).toBe(true);
    const order = useAppStore
      .getState()
      .orders.records.find((item) => item.id === placed.value.id)!;
    expect(order.status).toBe('delivered');
    expect(order.inventoryReservationStatus).toBe('committed');
    expect(order.loyalty.pointsPending).toBe(0);
  });

  it('gates completion for an unverified GCash payment', () => {
    const placed = useAppStore.getState().commands.placeOrder({
      customerId: CUSTOMER_ID,
      items: [{ productId: PRODUCT_ID, quantity: 1 }],
      deliveryAddressId: 'address-01-a',
      deliverySchedule: { date: '2026-08-14', windowLabel: '1:00 PM–4:00 PM' },
      paymentMethod: 'gcash',
      paymentProofImageDataUrl: 'data:image/png;base64,aGVsbG8=',
      paymentProofFileName: 'payment.png',
      placedAt: AT,
    });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;
    useAppStore.getState().commands.confirmOrder(placed.value.id, ADMIN_ID, AT);
    const assigned = useAppStore
      .getState()
      .commands.assignDelivery(placed.value.id, DELIVERER_ID, ADMIN_ID, AT);
    expect(assigned.ok).toBe(true);
    if (!assigned.ok) return;
    useAppStore.getState().commands.acceptDelivery(assigned.value.id, DELIVERER_ID, AT);
    useAppStore.getState().commands.startDelivery(assigned.value.id, DELIVERER_ID, AT);

    const blocked = useAppStore
      .getState()
      .commands.completeDelivery(assigned.value.id, DELIVERER_ID, AT);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error.code).toBe('not_allowed');

    expect(
      useAppStore.getState().commands.verifyPayment(placed.value.id, ADMIN_ID, 'GCASH-OK', AT)
        .ok,
    ).toBe(true);
    expect(
      useAppStore.getState().commands.completeDelivery(assigned.value.id, DELIVERER_ID, AT).ok,
    ).toBe(true);
  });
});
