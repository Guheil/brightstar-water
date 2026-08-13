'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import { useAppStore } from '@/store';
import type { Product, ProductCategory, ProductUnit } from '@/types';
import AdminPageHeader from '../components/AdminPageHeader';
import { savePrototypeProduct } from '../productPrototypeState';
import {
  CancelLink,
  EmptyActionLink,
  FeaturedCheckbox,
  FeaturedControl,
  Field,
  FormActions,
  FullField,
  Option,
  ProductForm,
  Root,
  SaveButton,
} from './elements';
import type { ProductFormScreenProps } from './interface';

interface FormState {
  category: ProductCategory;
  description: string;
  imageAlt: string;
  imageSrc: string;
  isFeatured: boolean;
  name: string;
  pricePesos: string;
  shortDescription: string;
  sku: string;
  slug: string;
  unit: ProductUnit;
}

const createInitialForm = (product?: Product): FormState => ({
  category: product?.category ?? 'gas',
  description: product?.description ?? '',
  imageAlt: product?.imageAlt ?? '',
  imageSrc: product?.imageSrc ?? '/images/product-lpg-11kg.png',
  isFeatured: product?.isFeatured ?? false,
  name: product?.name ?? '',
  pricePesos: product ? String(product.priceCentavos / 100) : '',
  shortDescription: product?.shortDescription ?? '',
  sku: product?.sku ?? '',
  slug: product?.slug ?? '',
  unit: product?.unit ?? 'piece',
});

export default function ProductFormScreen({ productId }: ProductFormScreenProps) {
  const router = useRouter();
  const product = useAppStore((state) =>
    productId ? state.catalog.products.find((item) => item.id === productId) : undefined,
  );
  const [form, setForm] = useState<FormState>(() => createInitialForm(product));
  const [error, setError] = useState('');
  const editing = Boolean(productId);

  if (editing && !product) {
    return (
      <EmptyState
        action={<EmptyActionLink href="/admin/products">Return to products</EmptyActionLink>}
        description="The requested product could not be found."
        title="Product not found"
      />
    );
  }

  const update = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pricePesos = Number(form.pricePesos);
    if (!Number.isFinite(pricePesos) || pricePesos <= 0) {
      setError('Enter a product price greater than zero.');
      return;
    }
    if (!form.name.trim() || !form.sku.trim() || !form.slug.trim()) {
      setError('Name, SKU, and slug are required.');
      return;
    }

    const now = new Date().toISOString();
    const id = product?.id ?? `product-prototype-${Date.now()}`;
    const nextProduct: Product = {
      id,
      slug: form.slug.trim(),
      sku: form.sku.trim(),
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      category: form.category,
      unit: form.unit,
      priceCentavos: Math.round(pricePesos * 100),
      imageSrc: form.imageSrc.trim(),
      imageAlt: form.imageAlt.trim(),
      isActive: product?.isActive ?? true,
      isFeatured: form.isFeatured,
      stockTracked: true,
      createdAt: product?.createdAt ?? now,
      updatedAt: now,
    };
    savePrototypeProduct(nextProduct, !product);
    router.push('/admin/products');
  };

  return (
    <Root>
      <AdminPageHeader
        backHref="/admin/products"
        backLabel="Back to products"
        description="Enter the catalog details customers need. New products start with zero stock and require an inventory adjustment."
        title={editing ? `Edit ${product?.name}` : 'Add product'}
      />
      {error ? (
        <Notice title="Product not saved" tone="error">
          {error}
        </Notice>
      ) : null}

      <ProductForm onSubmit={handleSubmit}>
        <Field
          label="Product name"
          onChange={(event) => update('name', event.target.value)}
          required
          value={form.name}
        />
        <Field
          label="SKU"
          onChange={(event) => update('sku', event.target.value)}
          required
          value={form.sku}
        />
        <Field
          label="Slug"
          onChange={(event) => update('slug', event.target.value)}
          required
          value={form.slug}
        />
        <Field
          label="Price in pesos"
          onChange={(event) => update('pricePesos', event.target.value)}
          required
          slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
          type="number"
          value={form.pricePesos}
        />
        <Field
          label="Category"
          onChange={(event) => update('category', event.target.value as ProductCategory)}
          select
          value={form.category}
        >
          <Option value="gas">Gas</Option>
          <Option value="water">Water</Option>
        </Field>
        <Field
          label="Unit"
          onChange={(event) => update('unit', event.target.value as ProductUnit)}
          select
          value={form.unit}
        >
          <Option value="cylinder">Cylinder</Option>
          <Option value="refill">Refill</Option>
          <Option value="container">Container</Option>
          <Option value="piece">Piece</Option>
        </Field>
        <FullField
          label="Short description"
          onChange={(event) => update('shortDescription', event.target.value)}
          required
          value={form.shortDescription}
        />
        <FullField
          label="Full description"
          multiline
          onChange={(event) => update('description', event.target.value)}
          required
          rows={4}
          value={form.description}
        />
        <Field
          label="Product image path"
          onChange={(event) => update('imageSrc', event.target.value)}
          required
          value={form.imageSrc}
        />
        <Field
          label="Image alt text"
          onChange={(event) => update('imageAlt', event.target.value)}
          required
          value={form.imageAlt}
        />
        <FeaturedControl
          control={
            <FeaturedCheckbox
              checked={form.isFeatured}
              onChange={(event) => update('isFeatured', event.target.checked)}
            />
          }
          label="Feature this product in customer browsing"
        />
        <FormActions>
          <SaveButton type="submit">{editing ? 'Save product' : 'Add product'}</SaveButton>
          <CancelLink href="/admin/products">Cancel</CancelLink>
        </FormActions>
      </ProductForm>
    </Root>
  );
}
