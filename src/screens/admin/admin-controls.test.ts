import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from '@/store';
import { hydrateCatalogFixtures } from '@/test-utils/catalog';
import {
  deleteProductState,
  quickUpdateProduct,
  saveProductState,
} from './productState';

describe('Admin CRUD-style controls', () => {
  beforeEach(() => {
    useAppStore.getState().commands.resetAppState();
    hydrateCatalogFixtures();
  });

  it('applies a small product update without replacing unrelated catalog fields', () => {
    const before = useAppStore.getState().catalog.products[0];
    const result = quickUpdateProduct(before.id, {
      priceCentavos: before.priceCentavos + 1000,
      isActive: false,
      isFeatured: !before.isFeatured,
    }, '2026-08-16T00:00:00.000Z');

    expect(result.ok).toBe(true);
    const after = useAppStore.getState().catalog.products.find((item) => item.id === before.id)!;
    expect(after.name).toBe(before.name);
    expect(after.sku).toBe(before.sku);
    expect(after.priceCentavos).toBe(before.priceCentavos + 1000);
    expect(after.isActive).toBe(false);
  });

  it('blocks hard deletion when a product is referenced by operational history', () => {
    const result = deleteProductState('product-gas-11kg');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('conflict');
    expect(useAppStore.getState().catalog.products.some((item) => item.id === 'product-gas-11kg'))
      .toBe(true);
  });

  it('deletes a new unused product and its zero-stock inventory record', () => {
    const source = useAppStore.getState().catalog.products[0];
    const product = {
      ...source,
      id: 'product-delete-qa',
      slug: 'delete-qa',
      sku: 'DELETE-QA',
      name: 'Unused QA product',
      createdAt: '2026-08-16T00:00:00.000Z',
      updatedAt: '2026-08-16T00:00:00.000Z',
    };
    saveProductState(product, true);

    const result = deleteProductState(product.id);
    expect(result.ok).toBe(true);
    expect(useAppStore.getState().catalog.products.some((item) => item.id === product.id)).toBe(false);
    expect(useAppStore.getState().inventory.items.some((item) => item.productId === product.id)).toBe(false);
  });

  it('does not contain a local password authentication command', () => {
    const commands = useAppStore.getState().commands;
    expect('signIn' in commands).toBe(false);
    expect('beginCustomerRegistration' in commands).toBe(false);
  });


});
