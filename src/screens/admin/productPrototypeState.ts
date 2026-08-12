import { useAppStore } from '@/store';
import type { Product } from '@/types';

/**
 * Scoped frontend-only catalog update used until a production ProductService exists.
 * It stays immutable so Customer and Admin selectors receive the same catalog change.
 */
export function setPrototypeProductActive(
  productId: string,
  isActive: boolean,
  updatedAt = new Date().toISOString(),
) {
  useAppStore.setState((state) => ({
    catalog: {
      products: state.catalog.products.map((product) =>
        product.id === productId
          ? { ...product, isActive, updatedAt }
          : product,
      ),
    },
  }));
}

/**
 * Adds or replaces a fictional product in browser memory. New products receive a
 * zero-stock inventory record so catalog availability remains domain-consistent.
 */
export function savePrototypeProduct(product: Product, isNew: boolean) {
  useAppStore.setState((state) => ({
    catalog: {
      products: isNew
        ? [product, ...state.catalog.products]
        : state.catalog.products.map((item) =>
            item.id === product.id ? product : item,
          ),
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
