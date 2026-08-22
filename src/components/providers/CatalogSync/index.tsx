'use client';

import { useEffect } from 'react';
import { fetchPublicCatalog } from '@/lib/catalog/client';
import { useAppStore } from '@/store';
import { CatalogBoundary } from './elements';
import type { CatalogSyncProps } from './interface';

export default function CatalogSync({ children }: CatalogSyncProps) {
  const syncCatalogSnapshot = useAppStore((state) => state.commands.syncCatalogSnapshot);
  const markCatalogLoadFailed = useAppStore((state) => state.commands.markCatalogLoadFailed);

  useEffect(() => {
    const controller = new AbortController();

    fetchPublicCatalog(controller.signal)
      .then((snapshot) => syncCatalogSnapshot(snapshot))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        markCatalogLoadFailed(error instanceof Error ? error.message : 'Catalog could not be loaded.');
      });

    return () => controller.abort();
  }, [markCatalogLoadFailed, syncCatalogSnapshot]);

  return <CatalogBoundary>{children}</CatalogBoundary>;
}
