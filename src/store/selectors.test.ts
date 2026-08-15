import { describe, expect, it } from 'vitest';
import { selectProductsWithAvailability } from './selectors';
import { useAppStore } from './store';

describe('selectProductsWithAvailability', () => {
  it('returns the same snapshot while catalog and inventory references are unchanged', () => {
    const state = useAppStore.getState();

    const first = selectProductsWithAvailability(state);
    const second = selectProductsWithAvailability(state);

    expect(second).toBe(first);
  });

  it('returns a new snapshot after a catalog reference changes', () => {
    const originalState = useAppStore.getState();
    const first = selectProductsWithAvailability(originalState);
    const nextState = {
      ...originalState,
      catalog: {
        products: originalState.catalog.products.map((product, index) =>
          index === 0 ? { ...product, updatedAt: '2026-08-16T00:00:00.000Z' } : product,
        ),
      },
    };

    const second = selectProductsWithAvailability(nextState);

    expect(second).not.toBe(first);
  });
});
