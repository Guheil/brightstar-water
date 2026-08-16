import { beforeEach, describe, expect, it } from 'vitest';
import { AUTH_ACCOUNTS } from '@/data';
import { useAppStore } from '@/store';
import {
  deleteProductState,
  quickUpdateProduct,
  saveProductState,
} from './productState';
import { updateCustomerState } from './customerState';

describe('Admin CRUD-style controls', () => {
  beforeEach(() => {
    useAppStore.getState().commands.resetAppState();
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

  it('updates customer contact and account state while preserving addresses', () => {
    const before = useAppStore.getState().customers.records[0];
    const result = updateCustomerState(before.id, {
      displayName: 'Updated QA Customer',
      email: 'updated.qa@example.test',
      phonePlaceholder: '09XX-111-2222',
      status: 'inactive',
    }, '2026-08-16T00:00:00.000Z');

    expect(result.ok).toBe(true);
    const after = useAppStore.getState().customers.records.find((item) => item.id === before.id)!;
    expect(after.displayName).toBe('Updated QA Customer');
    expect(after.status).toBe('inactive');
    expect(after.addresses).toEqual(before.addresses);
  });

  it('prevents an inactive customer account from signing in', () => {
    const account = AUTH_ACCOUNTS.find((account) => account.role === 'customer')!;
    const customer = useAppStore.getState().customers.records.find(
      (item) => item.id === account.customerId,
    )!;
    const update = updateCustomerState(customer.id, {
      displayName: customer.displayName,
      email: customer.email,
      phonePlaceholder: customer.phonePlaceholder,
      status: 'inactive',
    });
    expect(update.ok).toBe(true);

    const signIn = useAppStore.getState().commands.signIn({
      email: account.email,
      password: account.password,
    });
    expect(signIn.ok).toBe(false);
    if (!signIn.ok) expect(signIn.error.code).toBe('not_allowed');
  });

  it('rejects duplicate customer emails', () => {
    const customers = useAppStore.getState().customers.records;
    const result = updateCustomerState(customers[0].id, {
      displayName: customers[0].displayName,
      email: customers[1].email,
      phonePlaceholder: customers[0].phonePlaceholder,
      status: customers[0].status,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('conflict');
  });
});
