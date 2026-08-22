import { useAppStore } from '@/store';
import type { CommandResult, Product } from '@/types';
import { commandFailure, commandSuccess } from '@/utils';
import { canHardDeleteProduct } from './productDeletionPolicy';

/**
 * Frontend-only catalog update used until a production ProductService exists.
 * It stays immutable so Customer and Admin selectors receive the same catalog change.
 */
export function setPrototypeProductActive(
  productId: string,
  isActive: boolean,
  updatedAt = new Date().toISOString(),
) {
  useAppStore.setState((state) => ({
    catalog: {
      ...state.catalog,
      products: state.catalog.products.map((product) =>
        product.id === productId ? { ...product, isActive, updatedAt } : product,
      ),
    },
  }));
}

export function quickUpdatePrototypeProduct(
  productId: string,
  input: Pick<Product, 'isActive' | 'isFeatured' | 'priceCentavos'>,
  updatedAt = new Date().toISOString(),
): CommandResult<Product> {
  const state = useAppStore.getState();
  const product = state.catalog.products.find((item) => item.id === productId);
  if (!product) return commandFailure('not_found', 'Product not found.');
  if (!Number.isInteger(input.priceCentavos) || input.priceCentavos <= 0) {
    return commandFailure('invalid_input', 'Enter a valid price greater than zero.');
  }

  const updatedProduct = { ...product, ...input, updatedAt };
  useAppStore.setState((current) => ({
    catalog: {
      ...current.catalog,
      products: current.catalog.products.map((item) =>
        item.id === productId ? updatedProduct : item,
      ),
    },
  }));
  return commandSuccess(updatedProduct);
}

/**
 * Hard deletion is intentionally limited to products without historical references.
 * Referenced products should be deactivated so order and inventory history remains intact.
 */
export function deletePrototypeProduct(productId: string): CommandResult<Product> {
  const state = useAppStore.getState();
  const product = state.catalog.products.find((item) => item.id === productId);
  if (!product) return commandFailure('not_found', 'Product not found.');

  const hasOrderHistory = state.orders.records.some((order) =>
    order.items.some((item) => item.productId === productId),
  );
  const hasInventoryHistory = state.inventory.adjustments.some(
    (adjustment) => adjustment.productId === productId,
  );
  const inventoryItem = state.inventory.items.find((item) => item.productId === productId);
  const hasReservedStock = Boolean(inventoryItem?.stockReserved);
  const isInCart = state.cart.items.some((item) => item.productId === productId);

  if (!canHardDeleteProduct({
    hasOrderHistory,
    hasInventoryHistory,
    hasReservedStock,
    isInCart,
  })) {
    return commandFailure(
      'conflict',
      'This product has active or historical references. Deactivate it instead so records remain consistent.',
    );
  }

  useAppStore.setState((current) => ({
    catalog: {
      ...current.catalog,
      products: current.catalog.products.filter((item) => item.id !== productId),
    },
    inventory: {
      ...current.inventory,
      items: current.inventory.items.filter((item) => item.productId !== productId),
    },
  }));
  return commandSuccess(product);
}

/**
 * Adds or replaces a fictional product in browser memory. New products receive a
 * zero-stock inventory record so catalog availability remains domain-consistent.
 */
export function savePrototypeProduct(product: Product, isNew: boolean) {
  useAppStore.setState((state) => ({
    catalog: {
      ...state.catalog,
      products: isNew
        ? [product, ...state.catalog.products]
        : state.catalog.products.map((item) => (item.id === product.id ? product : item)),
    },
    inventory: isNew
      ? {
          ...state.inventory,
          items: [
            {
              productId: product.id,
              stockOnHand: 0,
              stockReserved: 0,
              reorderLevel: 0,
              updatedAt: product.updatedAt,
            },
            ...state.inventory.items,
          ],
        }
      : state.inventory,
  }));
}
