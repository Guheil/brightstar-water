import { describe, expect, it } from 'vitest';
import {
  calculateDeliveryFee,
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

  it('values one point at one peso while redemption stays separately gated', () => {
    expect(calculateLoyaltyPesoValue(5)).toBe(500);
    expect(calculateLoyaltyPesoValue(-2)).toBe(0);
  });
});
