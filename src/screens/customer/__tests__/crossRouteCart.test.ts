import { beforeEach, describe, expect, it } from 'vitest';
import { selectCartItemCount, selectCartItems, useAppStore } from '../../../store';
import { authenticateCustomerFixture } from '@/test-utils/auth';

describe('cross-route cart state', () => {
  beforeEach(() => {
    const commands = useAppStore.getState().commands;
    commands.resetAppState();
    authenticateCustomerFixture();
  });

  it('makes a public product addition visible to customer cart and checkout selectors', () => {
    const initialCount = selectCartItemCount(useAppStore.getState());
    const result = useAppStore
      .getState()
      .commands.addCartItem('product-water-pump', 2);

    expect(result.ok).toBe(true);

    const customerRouteState = useAppStore.getState();
    const cartItems = selectCartItems(customerRouteState);
    const addedLine = cartItems.find((item) => item.productId === 'product-water-pump');

    expect(addedLine?.quantity).toBe(2);
    expect(selectCartItemCount(customerRouteState)).toBe(initialCount + 2);
    expect(customerRouteState.cart.lastPlacedOrderId).toBeNull();
  });

  it('clears items and records the confirmation target after checkout succeeds', () => {
    const commands = useAppStore.getState().commands;
    commands.addCartItem('product-water-pump', 1);
    const placed = commands.placeOrder({
      customerId: 'customer-01',
      items: selectCartItems(useAppStore.getState()),
      deliveryAddressId: 'address-01-a',
      deliverySchedule: {
        date: '2026-08-14',
        windowLabel: '9:00 AM–12:00 PM',
      },
      paymentMethod: 'cod',
      placedAt: '2026-08-12T12:00:00.000Z',
    });
    expect(placed.ok).toBe(true);
    if (!placed.ok) return;

    commands.clearCart();
    commands.setLastPlacedOrderId(placed.value.id);

    expect(selectCartItems(useAppStore.getState())).toEqual([]);
    expect(useAppStore.getState().cart.lastPlacedOrderId).toBe(placed.value.id);
  });
});
