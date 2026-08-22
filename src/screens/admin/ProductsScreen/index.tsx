'use client';

import { Eye, Pencil, Power, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import {
  CatalogApiError,
  deleteAdminProduct,
  fetchAdminCatalog,
  updateAdminProduct,
} from '@/lib/catalog/client';
import type { AdminCatalogSnapshot, ProductMutationInput } from '@/lib/catalog/types';
import { deriveProductsWithAvailability, type ProductWithAvailability } from '@/store';
import type { InventoryItem, Product } from '@/types';
import { formatPhp } from '@/utils';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminEntityActionMenu from '../components/AdminEntityActionMenu';
import AdminFormDialog from '../components/AdminFormDialog';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminMetricStrip from '../components/AdminMetricStrip';
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

function productInput(
  product: Product,
  inventory: InventoryItem | undefined,
  overrides: Partial<Pick<Product, 'priceCentavos' | 'isFeatured' | 'isActive'>> = {},
): ProductMutationInput {
  return {
    productTypeCode: product.productTypeCode,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    sizeValue: product.sizeValue,
    priceCentavos: overrides.priceCentavos ?? product.priceCentavos,
    brand: product.brand,
    gtin: product.gtin,
    mpn: product.mpn,
    imageAlt: product.imageAlt,
    isFeatured: overrides.isFeatured ?? product.isFeatured,
    isActive: overrides.isActive ?? product.isActive,
    reorderLevel: inventory?.reorderLevel ?? 5,
  };
}

function parsePrice(value: string) {
  const clean = value.trim().replace(/,/g, '');
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(clean)) return null;
  const numeric = Number(clean);
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric * 100) : null;
}

export default function ProductsScreen({ className }: ProductsScreenProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<AdminCatalogSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [pendingToggle, setPendingToggle] = useState<ProductWithAvailability | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductWithAvailability | null>(null);
  const [quickEditProduct, setQuickEditProduct] = useState<ProductWithAvailability | null>(null);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickFeatured, setQuickFeatured] = useState(false);
  const [quickActive, setQuickActive] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [mutating, setMutating] = useState(false);

  const reload = async (signal?: AbortSignal) => {
    const next = await fetchAdminCatalog(signal);
    setSnapshot(next);
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchAdminCatalog(controller.signal)
      .then((next) => {
        if (!controller.signal.aborted) setSnapshot(next);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setFeedback({ tone: 'error', title: 'Products could not be loaded', message: error instanceof Error ? error.message : 'Try again.' });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const products = useMemo(
    () => deriveProductsWithAvailability(snapshot?.products ?? [], snapshot?.inventory ?? []),
    [snapshot],
  );
  const productMetrics = [
    { label: 'Catalog products', value: products.length },
    { label: 'MRJE Gas', value: products.filter((product) => product.category === 'gas').length, tone: 'gas' as const },
    { label: 'Bright Star Water', value: products.filter((product) => product.category === 'water').length, tone: 'water' as const },
    { label: 'Featured', value: products.filter((product) => product.isFeatured).length, tone: 'success' as const },
    { label: 'Draft / inactive', value: products.filter((product) => !product.isActive).length, tone: 'warning' as const },
  ];

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return products.filter((product) =>
      !normalized ||
      product.name.toLowerCase().includes(normalized) ||
      product.sku.toLowerCase().includes(normalized) ||
      product.productTypeLabel.toLowerCase().includes(normalized) ||
      product.category.includes(normalized),
    );
  }, [products, query]);

  const inventoryFor = (productId: string) => snapshot?.inventory.find((item) => item.productId === productId);

  const openQuickEdit = (product: ProductWithAvailability) => {
    setQuickEditProduct(product);
    setQuickPrice((product.priceCentavos / 100).toFixed(2));
    setQuickFeatured(product.isFeatured);
    setQuickActive(product.isActive);
  };

  const columns: readonly AdminDataColumn<ProductWithAvailability>[] = [
    { key: 'product', label: 'Product', render: (product) => <TableLink href={`/admin/products/${product.id}/edit`}>{product.name}</TableLink> },
    { key: 'sku', label: 'SKU', render: (product) => product.sku },
    { key: 'category', label: 'Store / type', render: (product) => `${product.category === 'gas' ? 'MRJE Gas' : 'Bright Star'} · ${product.productTypeLabel}` },
    { key: 'price', label: 'Price', align: 'right', render: (product) => formatPhp(product.priceCentavos) },
    { key: 'available', label: 'Available stock', align: 'right', render: (product) => product.availableStock },
    {
      key: 'catalog_state',
      label: 'Catalog state',
      render: (product) => <StatusText tone={product.isActive ? 'success' : 'warning'}>{product.isActive ? 'Published' : 'Draft'}</StatusText>,
    },
    {
      key: 'availability',
      label: 'Availability',
      render: (product) => <StatusText tone={product.isAvailable ? 'success' : 'warning'}>{product.isAvailable ? 'Orderable' : 'Unavailable'}</StatusText>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product) => (
        <AdminEntityActionMenu
          actions={[
            { label: 'Open product', icon: Eye, onSelect: () => router.push(`/admin/products/${product.id}/edit`) },
            { label: 'Edit full details', icon: Pencil, onSelect: () => router.push(`/admin/products/${product.id}/edit`) },
            { label: 'Quick update', icon: SlidersHorizontal, onSelect: () => openQuickEdit(product) },
            { label: product.isActive ? 'Move to draft' : 'Publish', icon: Power, onSelect: () => setPendingToggle(product) },
            { label: 'Remove product', icon: Trash2, tone: 'danger', onSelect: () => setPendingDelete(product) },
          ]}
          ariaLabel={`Actions for ${product.name}`}
        />
      ),
    },
  ];

  const confirmToggle = async () => {
    if (!pendingToggle || mutating) return;
    setMutating(true);
    try {
      const nextActive = !pendingToggle.isActive;
      await updateAdminProduct(
        pendingToggle.id,
        productInput(pendingToggle, inventoryFor(pendingToggle.id), { isActive: nextActive }),
      );
      await reload();
      setFeedback({
        tone: 'success',
        title: nextActive ? 'Product published' : 'Product moved to draft',
        message: nextActive
          ? `${pendingToggle.name} can now appear in customer browsing when stock is available.`
          : `${pendingToggle.name} is hidden from customer ordering while its history remains intact.`,
      });
      setPendingToggle(null);
    } catch (error) {
      setFeedback({ tone: 'error', title: 'Product not updated', message: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setMutating(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || mutating) return;
    setMutating(true);
    try {
      await deleteAdminProduct(pendingDelete.id);
      await reload();
      setFeedback({
        tone: 'success',
        title: 'Product removed',
        message: `${pendingDelete.name} was removed from the active catalog. Historical records are preserved.`,
      });
      setPendingDelete(null);
    } catch (error) {
      setFeedback({ tone: 'error', title: 'Product cannot be removed', message: error instanceof Error ? error.message : 'Try again.' });
    } finally {
      setMutating(false);
    }
  };

  const submitQuickEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quickEditProduct || mutating) return;
    const priceCentavos = parsePrice(quickPrice);
    if (priceCentavos === null) {
      setFeedback({ tone: 'error', title: 'Product not updated', message: 'Enter a valid price greater than zero with no more than two decimal places.' });
      return;
    }
    setMutating(true);
    try {
      await updateAdminProduct(
        quickEditProduct.id,
        productInput(quickEditProduct, inventoryFor(quickEditProduct.id), {
          priceCentavos,
          isFeatured: quickFeatured,
          isActive: quickActive,
        }),
      );
      await reload();
      setFeedback({ tone: 'success', title: 'Product updated', message: `${quickEditProduct.name} pricing and catalog settings were saved to the database.` });
      setQuickEditProduct(null);
    } catch (error) {
      const message = error instanceof CatalogApiError ? error.message : error instanceof Error ? error.message : 'Try again.';
      setFeedback({ tone: 'error', title: 'Product not updated', message });
    } finally {
      setMutating(false);
    }
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        actions={<NewProductLink href="/admin/products/new">Add product</NewProductLink>}
        description="Maintain database-backed products, pricing, product photos, publication state, and storefront availability across both brands."
        title="Products"
      />

      <AdminMetricStrip ariaLabel="Product catalog summary" items={productMetrics} />

      {feedback ? <Notice title={feedback.title} tone={feedback.tone}>{feedback.message}</Notice> : null}

      <Toolbar>
        <SearchField label="Search name, SKU, type, or store" onChange={(event) => setQuery(event.target.value)} value={query} />
      </Toolbar>

      {loading ? (
        <Notice title="Loading products">The catalog and inventory are being loaded from the database.</Notice>
      ) : filteredProducts.length ? (
        <AdminDataTable ariaLabel="Product catalog" columns={columns} getRowKey={(product) => product.id} rows={filteredProducts} />
      ) : (
        <EmptyState
          action={<EmptyResetButton onClick={() => setQuery('')}>Clear search</EmptyResetButton>}
          description="Try a different product name, SKU, product type, or store."
          title="No products match this search"
        />
      )}

      <AdminFormDialog
        description="Use this for pricing, publication, and featured placement. Open the full editor for product type, descriptions, sizes, brand details, or photos."
        formId="quick-product-form"
        onClose={() => setQuickEditProduct(null)}
        open={Boolean(quickEditProduct)}
        submitLabel={mutating ? 'Saving…' : 'Save quick update'}
        title={quickEditProduct ? `Quick update: ${quickEditProduct.name}` : 'Quick update'}
      >
        <QuickEditForm id="quick-product-form" onSubmit={submitQuickEdit}>
          <QuickEditField
            label="Price in pesos"
            onChange={(event) => setQuickPrice(event.target.value.replace(/[^0-9.,]/g, ''))}
            required
            slotProps={{ htmlInput: { inputMode: 'decimal', maxLength: 12 } }}
            value={quickPrice}
          />
          <QuickEditOptions>
            <QuickEditControl control={<QuickEditCheckbox checked={quickActive} onChange={(event) => setQuickActive(event.target.checked)} />} label="Published in catalog" />
            <QuickEditControl control={<QuickEditCheckbox checked={quickFeatured} onChange={(event) => setQuickFeatured(event.target.checked)} />} label="Featured product" />
          </QuickEditOptions>
        </QuickEditForm>
      </AdminFormDialog>

      <AdminConfirmDialog
        confirmLabel={pendingToggle?.isActive ? 'Move to draft' : 'Publish product'}
        confirmTone="primary"
        description={pendingToggle?.isActive
          ? 'The product will stop appearing in customer ordering while its inventory and historical records remain available.'
          : 'The product will return to customer browsing when inventory is available.'}
        onClose={() => setPendingToggle(null)}
        onConfirm={() => void confirmToggle()}
        open={Boolean(pendingToggle)}
        title={pendingToggle?.isActive ? 'Move this product to draft?' : 'Publish this product?'}
      />

      <AdminConfirmDialog
        confirmLabel="Remove product"
        description="The product will be soft-deleted from the active catalog. Orders, inventory history, and audit records remain preserved. Products with reserved stock cannot be removed."
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        open={Boolean(pendingDelete)}
        title={pendingDelete ? `Remove ${pendingDelete.name}?` : 'Remove this product?'}
      />
    </Root>
  );
}
