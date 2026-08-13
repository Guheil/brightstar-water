'use client';

import { useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import EmptyState from '@/components/ui/EmptyState';
import StatusText from '@/components/ui/StatusText';
import { selectProductsWithAvailability, useAppStore } from '@/store';
import type { ProductWithAvailability } from '@/store';
import { formatPhp } from '@/utils';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminPageHeader from '../components/AdminPageHeader';
import { setPrototypeProductActive } from '../productPrototypeState';
import { humanize } from '../utils';
import {
  EmptyResetButton,
  InlineActions,
  NewProductLink,
  Root,
  SearchField,
  TableLink,
  ToggleButton,
  Toolbar,
} from './elements';
import type { ProductsScreenProps } from './interface';

export default function ProductsScreen({ className }: ProductsScreenProps) {
  const products = useAppStore(useShallow(selectProductsWithAvailability));
  const [query, setQuery] = useState('');
  const [pendingProduct, setPendingProduct] = useState<ProductWithAvailability | null>(null);
  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.sku.toLowerCase().includes(normalized) ||
        product.category.includes(normalized),
    );
  }, [products, query]);

  const columns: readonly AdminDataColumn<ProductWithAvailability>[] = [
    {
      key: 'product',
      label: 'Product',
      render: (product) => (
        <TableLink href={`/admin/products/${product.id}/edit`}>{product.name}</TableLink>
      ),
    },
    { key: 'sku', label: 'SKU', render: (product) => product.sku },
    {
      key: 'category',
      label: 'Category',
      render: (product) => humanize(product.category),
    },
    {
      key: 'price',
      label: 'Price',
      align: 'right',
      render: (product) => formatPhp(product.priceCentavos),
    },
    {
      key: 'available',
      label: 'Available stock',
      align: 'right',
      render: (product) => product.availableStock,
    },
    {
      key: 'catalog_state',
      label: 'Catalog state',
      render: (product) => (
        <StatusText tone={product.isActive ? 'success' : 'error'}>
          {product.isActive ? 'Active' : 'Inactive'}
        </StatusText>
      ),
    },
    {
      key: 'availability',
      label: 'Availability',
      render: (product) => (
        <StatusText tone={product.isAvailable ? 'success' : 'warning'}>
          {product.isAvailable ? 'Orderable' : 'Unavailable'}
        </StatusText>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product) => (
        <InlineActions>
          <TableLink href={`/admin/products/${product.id}/edit`}>Edit</TableLink>
          <ToggleButton onClick={() => setPendingProduct(product)}>
            {product.isActive ? 'Deactivate' : 'Activate'}
          </ToggleButton>
        </InlineActions>
      ),
    },
  ];

  const confirmToggle = () => {
    if (!pendingProduct) return;
    setPrototypeProductActive(pendingProduct.id, !pendingProduct.isActive);
    setPendingProduct(null);
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Maintain the customer catalog and product availability across inventory."
        title="Products"
      />

      <Toolbar>
        <SearchField
          label="Search name, SKU, or category"
          onChange={(event) => setQuery(event.target.value)}
          value={query}
        />
        <NewProductLink href="/admin/products/new">Add product</NewProductLink>
      </Toolbar>

      {filteredProducts.length ? (
        <AdminDataTable
          ariaLabel="Product catalog"
          columns={columns}
          getRowKey={(product) => product.id}
          rows={filteredProducts}
        />
      ) : (
        <EmptyState
          action={<EmptyResetButton onClick={() => setQuery('')}>Clear search</EmptyResetButton>}
          description="Try a different product name, SKU, or category."
          title="No products match this search"
        />
      )}

      <AdminConfirmDialog
        confirmLabel={pendingProduct?.isActive ? 'Deactivate product' : 'Activate product'}
        description={
          pendingProduct?.isActive
            ? 'The product will stop appearing as orderable in the shared Customer catalog, even if stock remains.'
            : 'The product will return to the Customer catalog when shared inventory is available.'
        }
        onClose={() => setPendingProduct(null)}
        onConfirm={confirmToggle}
        open={Boolean(pendingProduct)}
        title={pendingProduct?.isActive ? 'Deactivate this product?' : 'Activate this product?'}
      />
    </Root>
  );
}
