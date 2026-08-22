import { describe, expect, it } from 'vitest';
import { replaceCustomerCartSchema } from './validation';

describe('persistent customer cart validation', () => {
  it('accepts a bounded cart of product ids and whole-number quantities', () => {
    expect(replaceCustomerCartSchema.safeParse({
      items: [{ productId: 'product-water-pump', quantity: 2 }],
    }).success).toBe(true);
  });

  it('rejects duplicate products and unsafe identifiers', () => {
    expect(replaceCustomerCartSchema.safeParse({
      items: [
        { productId: 'product-water-pump', quantity: 1 },
        { productId: 'product-water-pump', quantity: 2 },
      ],
    }).success).toBe(false);
    expect(replaceCustomerCartSchema.safeParse({
      items: [{ productId: '<script>', quantity: 1 }],
    }).success).toBe(false);
  });

  it('rejects excessive line quantities and oversized carts', () => {
    expect(replaceCustomerCartSchema.safeParse({
      items: [{ productId: 'product-water-pump', quantity: 101 }],
    }).success).toBe(false);
    expect(replaceCustomerCartSchema.safeParse({
      items: Array.from({ length: 51 }, (_, index) => ({ productId: `product-${index}`, quantity: 1 })),
    }).success).toBe(false);
  });
});
