import { describe, expect, it } from 'vitest';
import {
  calculateDeliveryFee,
  calculateLoyaltyDiscount,
  calculateMaxLoyaltyRedeemablePoints,
  calculateLoyaltyPoints,
  calculateLoyaltyPesoValue,
} from '@/utils';

describe('delivery fee boundaries', () => {
  it.each([
    [0, 0],
    [3, 0],
    [3.01, 3_000],
    [6, 3_000],
    [6.01, 5_000],
    [10, 5_000],
  ])('quotes %s km at %s centavos', (distanceKm, expectedFee) => {
    const quote = calculateDeliveryFee(distanceKm);
    expect(quote.serviceable).toBe(true);
    if (quote.serviceable) expect(quote.feeCentavos).toBe(expectedFee);
  });

  it.each([-1, Number.NaN, 10.01])('rejects %s km', (distanceKm) => {
    expect(calculateDeliveryFee(distanceKm).serviceable).toBe(false);
  });
});

describe('provisional loyalty calculation', () => {
  it('requires a qualifying subtotal and floors incomplete ₱100 bands', () => {
    expect(calculateLoyaltyPoints(49_999)).toBe(0);
    expect(calculateLoyaltyPoints(50_000)).toBe(5);
    expect(calculateLoyaltyPoints(59_999)).toBe(5);
  });

  it('values one point at one peso', () => {
    expect(calculateLoyaltyPesoValue(5)).toBe(500);
    expect(calculateLoyaltyPesoValue(-2)).toBe(0);
  });

  it('caps redemption by both the available balance and merchandise subtotal', () => {
    expect(calculateMaxLoyaltyRedeemablePoints(84, 92_000)).toBe(84);
    expect(calculateMaxLoyaltyRedeemablePoints(84, 5_000)).toBe(50);
    expect(calculateMaxLoyaltyRedeemablePoints(-2, 92_000)).toBe(0);
  });

  it('converts redeemed points to a merchandise-only peso discount', () => {
    expect(calculateLoyaltyDiscount(50, 92_000)).toBe(5_000);
    expect(calculateLoyaltyDiscount(100, 5_000)).toBe(5_000);
    expect(calculateLoyaltyDiscount(0, 92_000)).toBe(0);
  });
});
