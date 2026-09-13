import { describe, expect, it } from 'vitest';
import { placeOrderSchema } from './validation';

const baseOrder = {
  items: [{ productId: 'product-gas-regulator', quantity: 1 }],
  deliveryAddressId: '4a220da8-2a63-42d9-8311-4efdb94fe845',
  deliverySchedule: {
    date: '2026-09-14',
    windowLabel: '9:00 AM–12:00 PM',
  },
  paymentMethod: 'cod' as const,
  idempotencyKey: 'de74ae14-19f2-49a7-bf75-e47ea8e46dc6',
};

describe('loyalty redemption order validation', () => {
  it('accepts a whole-number redemption with the balance snapshot the customer saw', () => {
    expect(placeOrderSchema.safeParse({
      ...baseOrder,
      requestedLoyaltyPoints: 25,
      loyaltyPointsAvailableSnapshot: 84,
    }).success).toBe(true);
  });

  it('requires a balance snapshot when points are redeemed', () => {
    const result = placeOrderSchema.safeParse({
      ...baseOrder,
      requestedLoyaltyPoints: 25,
    });
    expect(result.success).toBe(false);
  });

  it('rejects fractional and negative redemption values', () => {
    expect(placeOrderSchema.safeParse({
      ...baseOrder,
      requestedLoyaltyPoints: 1.5,
      loyaltyPointsAvailableSnapshot: 84,
    }).success).toBe(false);
    expect(placeOrderSchema.safeParse({
      ...baseOrder,
      requestedLoyaltyPoints: -1,
      loyaltyPointsAvailableSnapshot: 84,
    }).success).toBe(false);
  });

  it('does not accept a loyalty snapshot when no points are being redeemed', () => {
    expect(placeOrderSchema.safeParse({
      ...baseOrder,
      requestedLoyaltyPoints: 0,
      loyaltyPointsAvailableSnapshot: 84,
    }).success).toBe(false);
  });
});
