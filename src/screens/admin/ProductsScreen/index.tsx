'use client';

import { Eye, Pencil, Power, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { selectProductsWithAvailability, useAppStore } from '@/store';
import type { ProductWithAvailability } from '@/store';
import { formatPhp } from '@/utils';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminEntityActionMenu from '../components/AdminEntityActionMenu';
import AdminFormDialog from '../components/AdminFormDialog';
import AdminPageHeader from '../components/AdminPageHeader';
import {
  deletePrototypeProduct,
  quickUpdatePrototypeProduct,
  setPrototypeProductActive,
} from '../productPrototypeState';
import { humanize } from '../utils';
import {
  EmptyResetButton,
  NewProductLink,
  QuickEditCheckbox,
  QuickEditControl,
  QuickEditField,
  QuickEditForm,
  QuickEditOptions,
  Root,
  SearchField,
  TableLink,
  Toolbar,
} from './elements';
import type { ProductsScreenProps } from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

export default function ProductsScreen({ className }: ProductsScreenProps) {
  const router = useRouter();
  const products = useAppStore(selectProductsWithAvailability);
  const [query, setQuery] = useState('');
  const [pendingToggle, setPendingToggle] = useState<ProductWithAvailability | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductWithAvailability | null>(null);
  const [quickEditProduct, setQuickEditProduct] = useState<ProductWithAvailability | null>(null);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickFeatured, setQuickFeatured] = useState(false);
  const [quickActive, setQuickActive] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

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

  const openQuickEdit = (product: ProductWithAvailability) => {
    setQuickEditProduct(product);
    setQuickPrice(String(product.priceCentavos / 100));
    setQuickFeatured(product.isFeatured);
    setQuickActive(product.isActive);
  };

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
        <AdminEntityActionMenu
          actions={[
            {
              label: 'Open product',
              icon: Eye,
              onSelect: () => router.push(`/admin/products/${product.id}/edit`),
            },
            {
              label: 'Edit full details',
              icon: Pencil,
              onSelect: () => router.push(`/admin/products/${product.id}/edit`),
            },
            {
              label: 'Quick update',
              icon: SlidersHorizontal,
              onSelect: () => openQuickEdit(product),
            },
            {
              label: product.isActive ? 'Deactivate' : 'Activate',
              icon: Power,
              onSelect: () => setPendingToggle(product),
            },
            {
              label: 'Delete product',
              icon: Trash2,
              tone: 'danger',
              onSelect: () => setPendingDelete(product),
            },
          ]}
          ariaLabel={`Actions for ${product.name}`}
        />
      ),
    },
  ];

  const confirmToggle = () => {
    if (!pendingToggle) return;
    const nextActive = !pendingToggle.isActive;
    setPrototypeProductActive(pendingToggle.id, nextActive);
    setFeedback({
      tone: 'success',
      title: nextActive ? 'Product activated' : 'Product deactivated',
      message: nextActive
        ? `${pendingToggle.name} can appear in customer browsing when stock is available.`
        : `${pendingToggle.name} is now hidden from customer ordering while its records remain intact.`,
    });
    setPendingToggle(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const result = deletePrototypeProduct(pendingDelete.id);
    setFeedback(
      result.ok
        ? {
            tone: 'success',
            title: 'Product deleted',
            message: `${pendingDelete.name} and its unused inventory record were removed from this prototype.`,
          }
        : {
            tone: 'error',
            title: 'Product cannot be deleted',
            message: result.error.message,
          },
    );
    setPendingDelete(null);
  };

  const submitQuickEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quickEditProduct) return;
    const pricePesos = Number(quickPrice);
    const result = quickUpdatePrototypeProduct(quickEditProduct.id, {
      priceCentavos: Math.round(pricePesos * 100),
      isFeatured: quickFeatured,
      isActive: quickActive,
    });
    if (!result.ok) {
      setFeedback({ tone: 'error', title: 'Product not updated', message: result.error.message });
      return;
    }
    setFeedback({
      tone: 'success',
      title: 'Product updated',
      message: `${result.value.name} pricing and catalog settings were updated.`,
    });
    setQuickEditProduct(null);
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        actions={<NewProductLink href="/admin/products/new">Add product</NewProductLink>}
        description="Maintain product details, pricing, customer visibility, and catalog availability."
        title="Products"
      />

      {feedback ? (
        <Notice title={feedback.title} tone={feedback.tone}>
          {feedback.message}
        </Notice>
      ) : null}

      <Toolbar>
        <SearchField
          label="Search name, SKU, or category"
          onChange={(event) => setQuery(event.target.value)}
          value={query}
        />
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

      <AdminFormDialog
        description="Use this for small catalog changes. Open the full editor when you need to change descriptions, images, SKU, category, or units."
        formId="quick-product-form"
        onClose={() => setQuickEditProduct(null)}
        open={Boolean(quickEditProduct)}
        submitLabel="Save quick update"
        title={quickEditProduct ? `Quick update: ${quickEditProduct.name}` : 'Quick update'}
      >
        <QuickEditForm id="quick-product-form" onSubmit={submitQuickEdit}>
          <QuickEditField
            label="Price in pesos"
            onChange={(event) => setQuickPrice(event.target.value)}
            required
            slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
            type="number"
            value={quickPrice}
          />
          <QuickEditOptions>
            <QuickEditControl
              control={
                <QuickEditCheckbox
                  checked={quickActive}
                  onChange={(event) => setQuickActive(event.target.checked)}
                />
              }
              label="Active in catalog"
            />
            <QuickEditControl
              control={
                <QuickEditCheckbox
                  checked={quickFeatured}
                  onChange={(event) => setQuickFeatured(event.target.checked)}
                />
              }
              label="Featured product"
            />
          </QuickEditOptions>
        </QuickEditForm>
      </AdminFormDialog>

      <AdminConfirmDialog
        confirmLabel={pendingToggle?.isActive ? 'Deactivate product' : 'Activate product'}
        confirmTone="primary"
        description={
          pendingToggle?.isActive
            ? 'The product will stop appearing as orderable in the customer catalog, while order and inventory history remain available.'
            : 'The product will return to customer browsing when inventory is available.'
        }
        onClose={() => setPendingToggle(null)}
        onConfirm={confirmToggle}
        open={Boolean(pendingToggle)}
        title={pendingToggle?.isActive ? 'Deactivate this product?' : 'Activate this product?'}
      />

      <AdminConfirmDialog
        confirmLabel="Delete product"
        description="Deletion is allowed only when the product has no order, cart, reserved stock, or inventory-history references. Otherwise the system will preserve the record and ask you to deactivate it instead."
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        open={Boolean(pendingDelete)}
        title={pendingDelete ? `Delete ${pendingDelete.name}?` : 'Delete this product?'}
      />
    </Root>
  );
}
