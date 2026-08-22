import { INVENTORY_FIXTURES, PRODUCT_FIXTURES } from '@/mocks';
import { useAppStore } from '@/store';

/**
 * Hydrates deterministic catalog fixtures for unit tests only.
 * Production runtime catalog data is loaded from Supabase through /api/catalog.
 */
export function hydrateCatalogFixtures() {
  useAppStore.getState().commands.syncCatalogSnapshot({
    products: structuredClone(PRODUCT_FIXTURES),
    inventory: structuredClone(INVENTORY_FIXTURES),
  });
}
