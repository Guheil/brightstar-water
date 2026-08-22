'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import {
  CatalogApiError,
  createAdminProduct,
  fetchAdminCatalog,
  fetchAdminProduct,
  updateAdminProduct,
} from '@/lib/catalog/client';
import {
  prepareProductImage,
  ProductImagePreparationError,
  type PreparedProductImage,
} from '@/lib/catalog/imageClient';
import type { Product, ProductCategory, ProductTypeDefinition } from '@/types';
import AdminPageHeader from '../components/AdminPageHeader';
import {
  AdvancedDetails,
  AdvancedGrid,
  AdvancedSummary,
  CancelLink,
  ChoiceControl,
  ChoiceLabel,
  ChoiceRadio,
  DraftButton,
  EmptyActionLink,
  FeaturedCheckbox,
  FeaturedControl,
  Field,
  FileMeta,
  FormActions,
  FormSection,
  FullField,
  HiddenFileInput,
  ImagePreview,
  Option,
  PreviewImage,
  ProductForm,
  PublishButton,
  ReadOnlyItem,
  ReadOnlyLabel,
  ReadOnlyPair,
  ReadOnlyValue,
  Root,
  SectionCopy,
  SectionHeading,
  SectionTitle,
  SizeChoice,
  SizeChoices,
  StoreChoice,
  StoreChoices,
  SuggestedName,
  SuggestedNameRow,
  SuggestionButton,
  UploadArea,
  UploadButton,
  UploadCopy,
  UploadText,
  UploadTitle,
} from './elements';
import type { BrandChoice, ProductFormScreenProps, ProductFormState } from './interface';

const BRAND_OPTIONS: BrandChoice[] = ['MRJE', 'Bright Star', 'Unbranded', 'Other'];

const emptyForm = (): ProductFormState => ({
  store: '',
  productTypeCode: '',
  sizeValue: '',
  name: '',
  shortDescription: '',
  description: '',
  pricePesos: '',
  brandChoice: 'Unbranded',
  customBrand: '',
  imageAlt: '',
  gtin: '',
  mpn: '',
  isFeatured: false,
  openingStock: '0',
  reorderLevel: '5',
});

function brandState(product: Product): Pick<ProductFormState, 'brandChoice' | 'customBrand'> {
  if (!product.brand) return { brandChoice: 'Unbranded', customBrand: '' };
  if (product.brand === 'MRJE' || product.brand === 'Bright Star' || product.brand === 'Unbranded') {
    return { brandChoice: product.brand, customBrand: '' };
  }
  return { brandChoice: 'Other', customBrand: product.brand };
}

function productToForm(product: Product, reorderLevel: number): ProductFormState {
  return {
    store: product.category,
    productTypeCode: product.productTypeCode,
    sizeValue: product.sizeValue === null ? '' : String(product.sizeValue),
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    pricePesos: (product.priceCentavos / 100).toFixed(2),
    ...brandState(product),
    imageAlt: product.imageAlt,
    gtin: product.gtin ?? '',
    mpn: product.mpn ?? '',
    isFeatured: product.isFeatured,
    openingStock: '0',
    reorderLevel: String(reorderLevel),
  };
}

function formatSize(value: number, unit: ProductTypeDefinition['defaultSizeUnit']) {
  if (unit === 'gallon') return `${value} ${value === 1 ? 'gallon' : 'gallons'}`;
  return `${value} ${unit ?? ''}`.trim();
}

function suggestedName(type: ProductTypeDefinition | undefined, sizeValue: string) {
  if (!type) return '';
  if (!type.requiresSize) return type.label;
  const numeric = Number(sizeValue);
  if (!Number.isFinite(numeric)) return type.label;
  return `${formatSize(numeric, type.defaultSizeUnit)} ${type.label}`;
}

function parseMoneyToCentavos(value: string) {
  const clean = value.trim().replace(/,/g, '');
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(clean)) return null;
  const numeric = Number(clean);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * 100);
}

function parseWholeNumber(value: string) {
  if (!/^\d+$/.test(value.trim())) return null;
  const numeric = Number(value);
  return Number.isSafeInteger(numeric) && numeric >= 0 ? numeric : null;
}

function humanBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProductFormScreen({ productId }: ProductFormScreenProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormState>(() => emptyForm());
  const [productTypes, setProductTypes] = useState<ProductTypeDefinition[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<PreparedProductImage | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const editing = Boolean(productId);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        if (productId) {
          const loaded = await fetchAdminProduct(productId, controller.signal);
          setProduct(loaded.product);
          setProductTypes(loaded.productTypes);
          setForm(productToForm(loaded.product, loaded.inventory?.reorderLevel ?? 5));
        } else {
          const snapshot = await fetchAdminCatalog(controller.signal);
          setProductTypes(snapshot.productTypes);
        }
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'The product editor could not be loaded.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => {
      controller.abort();
    };
  }, [productId]);

  useEffect(() => () => {
    if (selectedImage?.previewUrl) URL.revokeObjectURL(selectedImage.previewUrl);
  }, [selectedImage]);

  const availableTypes = useMemo(
    () => productTypes.filter((type) => type.isActive && (!form.store || type.store === form.store)),
    [form.store, productTypes],
  );
  const selectedType = productTypes.find((type) => type.code === form.productTypeCode);
  const suggested = suggestedName(selectedType, form.sizeValue);
  const currentPreview = selectedImage?.previewUrl ?? product?.imageSrc ?? null;

  const update = <Key extends keyof ProductFormState>(key: Key, value: ProductFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const chooseStore = (store: ProductCategory) => {
    setForm((current) => ({
      ...current,
      store,
      productTypeCode: current.store === store ? current.productTypeCode : '',
      sizeValue: current.store === store ? current.sizeValue : '',
      brandChoice: store === 'gas' ? 'MRJE' : 'Bright Star',
      customBrand: '',
    }));
  };

  const chooseProductType = (code: string) => {
    const type = productTypes.find((item) => item.code === code);
    setForm((current) => ({
      ...current,
      productTypeCode: code,
      sizeValue: type?.requiresSize ? '' : '',
    }));
  };

  const handleImage = async (file?: File | null) => {
    if (!file) return;
    setError('');
    try {
      const prepared = await prepareProductImage(file);
      setSelectedImage((current) => {
        if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
        return prepared;
      });
    } catch (imageError) {
      setError(
        imageError instanceof ProductImagePreparationError
          ? imageError.message
          : 'The selected product photo could not be prepared.',
      );
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setError('');

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const publish = submitter?.value === 'publish';
    const priceCentavos = parseMoneyToCentavos(form.pricePesos);
    const reorderLevel = parseWholeNumber(form.reorderLevel);
    const openingStock = parseWholeNumber(form.openingStock);
    const sizeValue = selectedType?.requiresSize ? Number(form.sizeValue) : null;
    const brand = form.brandChoice === 'Other'
      ? form.customBrand.trim()
      : form.brandChoice === 'Unbranded'
        ? null
        : form.brandChoice;

    if (!form.store || !selectedType || selectedType.store !== form.store) {
      setError('Choose the store and product type before saving.');
      return;
    }
    if (selectedType.requiresSize && !selectedType.allowedSizeValues.includes(sizeValue ?? Number.NaN)) {
      setError('Choose one of the approved sizes for this product type.');
      return;
    }
    if (!form.name.trim() || !form.shortDescription.trim() || !form.description.trim()) {
      setError('Complete the product name and descriptions.');
      return;
    }
    if (priceCentavos === null) {
      setError('Enter a valid price greater than zero with no more than two decimal places.');
      return;
    }
    if (reorderLevel === null || (!editing && openingStock === null)) {
      setError('Opening stock and low-stock warning must be whole numbers of zero or more.');
      return;
    }
    if (form.brandChoice === 'Other' && !brand) {
      setError('Enter the brand name, or choose Unbranded.');
      return;
    }

    const input = {
      productTypeCode: selectedType.code,
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      sizeValue,
      priceCentavos,
      brand,
      gtin: form.gtin.trim() || null,
      mpn: form.mpn.trim() || null,
      imageAlt: form.imageAlt.trim() || `${form.name.trim()} from ${form.store === 'gas' ? 'MRJE Gas' : 'Bright Star Water'}`,
      isFeatured: form.isFeatured,
      isActive: publish,
      reorderLevel,
      ...(!editing ? { openingStock: openingStock ?? 0 } : {}),
    };

    setSaving(true);
    try {
      if (productId) {
        await updateAdminProduct(productId, input, selectedImage?.file);
      } else {
        await createAdminProduct(input, selectedImage?.file);
      }
      router.push('/admin/products');
      router.refresh();
    } catch (saveError) {
      if (saveError instanceof CatalogApiError && saveError.issues?.length) {
        setError(saveError.issues.map((issue) => issue.message).join(' '));
      } else {
        setError(saveError instanceof Error ? saveError.message : 'The product could not be saved.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Notice title="Loading product editor">Product types and current catalog settings are being loaded.</Notice>;
  }

  if (editing && !product) {
    return (
      <EmptyState
        action={<EmptyActionLink href="/admin/products">Return to products</EmptyActionLink>}
        description={error || 'The requested product could not be found.'}
        title="Product not found"
      />
    );
  }

  return (
    <Root>
      <AdminPageHeader
        backHref="/admin/products"
        backLabel="Back to products"
        description="Use the guided choices below so product records stay consistent across the catalog, storefront, inventory, and activity history."
        title={editing ? `Edit ${product?.name}` : 'Add product'}
      />

      {error ? (
        <Notice title="Product not saved" tone="error">{error}</Notice>
      ) : null}

      <ProductForm onSubmit={submit}>
        <FormSection aria-labelledby="product-identity-title">
          <SectionHeading>
            <SectionTitle id="product-identity-title">Product identity</SectionTitle>
            <SectionCopy>Choose from controlled values first. The system generates the SKU, URL, unit, and currency.</SectionCopy>
          </SectionHeading>

          <ChoiceControl required>
            <ChoiceLabel>Store</ChoiceLabel>
            <StoreChoices
              onChange={(_event, value) => value && chooseStore(value as ProductCategory)}
              value={form.store}
            >
              <StoreChoice disabled={editing} control={<ChoiceRadio />} label="MRJE Gas" value="gas" />
              <StoreChoice disabled={editing} control={<ChoiceRadio />} label="Bright Star Water" value="water" />
            </StoreChoices>
          </ChoiceControl>

          <Field
            disabled={!form.store}
            label="Product type"
            onChange={(event) => chooseProductType(event.target.value)}
            required
            select
            value={form.productTypeCode}
          >
            {availableTypes.map((type) => <Option key={type.code} value={type.code}>{type.label}</Option>)}
          </Field>

          <Field
            disabled
            label="Currency"
            value="Philippine Peso (PHP)"
          />

          {selectedType?.requiresSize ? (
            <ChoiceControl required>
              <ChoiceLabel>Approved size</ChoiceLabel>
              <SizeChoices
                exclusive
                onChange={(_event, value) => value !== null && update('sizeValue', String(value))}
                value={form.sizeValue}
              >
                {selectedType.allowedSizeValues.map((value) => (
                  <SizeChoice key={value} value={String(value)}>
                    {formatSize(value, selectedType.defaultSizeUnit)}
                  </SizeChoice>
                ))}
              </SizeChoices>
            </ChoiceControl>
          ) : null}

          <FullField
            label="Product name"
            onChange={(event) => update('name', event.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: 120 } }}
            value={form.name}
          />

          {suggested && suggested !== form.name ? (
            <SuggestedNameRow>
              <SuggestedName>Suggested name: {suggested}</SuggestedName>
              <SuggestionButton onClick={() => update('name', suggested)} type="button">Use suggestion</SuggestionButton>
            </SuggestedNameRow>
          ) : null}

          <ReadOnlyPair>
            <ReadOnlyItem>
              <ReadOnlyLabel>SKU</ReadOnlyLabel>
              <ReadOnlyValue>{product?.sku ?? 'Generated automatically when saved'}</ReadOnlyValue>
            </ReadOnlyItem>
            <ReadOnlyItem>
              <ReadOnlyLabel>Sales unit</ReadOnlyLabel>
              <ReadOnlyValue>{selectedType?.defaultSalesUnit ?? 'Choose a product type'}</ReadOnlyValue>
            </ReadOnlyItem>
          </ReadOnlyPair>
        </FormSection>

        <FormSection aria-labelledby="product-information-title">
          <SectionHeading>
            <SectionTitle id="product-information-title">Product information</SectionTitle>
            <SectionCopy>Descriptions remain flexible because they are customer-facing content, while brand selection stays controlled.</SectionCopy>
          </SectionHeading>
          <FullField
            helperText={`${form.shortDescription.length}/180 characters`}
            label="Short description"
            onChange={(event) => update('shortDescription', event.target.value)}
            required
            slotProps={{ htmlInput: { maxLength: 180 } }}
            value={form.shortDescription}
          />
          <FullField
            helperText={`${form.description.length}/2000 characters`}
            label="Full description"
            multiline
            onChange={(event) => update('description', event.target.value)}
            required
            rows={5}
            slotProps={{ htmlInput: { maxLength: 2000 } }}
            value={form.description}
          />
          <Field
            label="Brand"
            onChange={(event) => update('brandChoice', event.target.value as BrandChoice)}
            select
            value={form.brandChoice}
          >
            {BRAND_OPTIONS.map((brand) => <Option key={brand} value={brand}>{brand}</Option>)}
          </Field>
          {form.brandChoice === 'Other' ? (
            <Field
              label="Brand name"
              onChange={(event) => update('customBrand', event.target.value)}
              required
              slotProps={{ htmlInput: { maxLength: 80 } }}
              value={form.customBrand}
            />
          ) : <div />}
        </FormSection>

        <FormSection aria-labelledby="pricing-inventory-title">
          <SectionHeading>
            <SectionTitle id="pricing-inventory-title">Pricing and inventory</SectionTitle>
            <SectionCopy>Price is stored safely in centavos. Inventory accepts only whole units and cannot go below reserved stock.</SectionCopy>
          </SectionHeading>
          <Field
            label="Price"
            onChange={(event) => update('pricePesos', event.target.value.replace(/[^0-9.,]/g, ''))}
            placeholder="850.00"
            required
            slotProps={{ htmlInput: { inputMode: 'decimal', maxLength: 12 } }}
            value={form.pricePesos}
          />
          <Field disabled label="Currency" value="₱ PHP" />
          {!editing ? (
            <Field
              label="Opening stock"
              onChange={(event) => update('openingStock', event.target.value.replace(/\D/g, ''))}
              required
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 7 } }}
              value={form.openingStock}
            />
          ) : null}
          <Field
            label="Low stock warning at"
            onChange={(event) => update('reorderLevel', event.target.value.replace(/\D/g, ''))}
            required
            slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 7 } }}
            value={form.reorderLevel}
          />
          <FeaturedControl
            control={<FeaturedCheckbox checked={form.isFeatured} onChange={(event) => update('isFeatured', event.target.checked)} />}
            label="Feature this product on customer storefronts"
          />
        </FormSection>

        <FormSection aria-labelledby="product-photo-title">
          <SectionHeading>
            <SectionTitle id="product-photo-title">Product photo</SectionTitle>
            <SectionCopy>Upload JPEG, PNG, or WebP. The browser prepares it first, then the server validates it again, removes metadata, resizes it, and stores a compressed WebP.</SectionCopy>
          </SectionHeading>
          <UploadArea
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void handleImage(event.dataTransfer.files[0]);
            }}
          >
            <ImagePreview>
              {currentPreview ? (
                <PreviewImage alt={form.imageAlt || form.name || 'Product photo preview'} fill sizes="272px" src={currentPreview} unoptimized={Boolean(selectedImage)} />
              ) : null}
            </ImagePreview>
            <UploadCopy>
              <UploadTitle>{selectedImage ? 'Photo ready for secure upload' : product?.imagePath ? 'Current product photo' : 'Add a product photo'}</UploadTitle>
              <UploadText>Drop a photo here or browse your device. Final storage accepts WebP only and uses a generated filename.</UploadText>
              <HiddenFileInput
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void handleImage(event.target.files?.[0])}
                ref={imageInputRef}
                type="file"
              />
              <UploadButton
                onClick={() => imageInputRef.current?.click()}
                type="button"
                variant="contained"
              >
                {selectedImage || product?.imagePath ? 'Replace photo' : 'Choose photo'}
              </UploadButton>
              {selectedImage ? (
                <FileMeta>Original {humanBytes(selectedImage.originalBytes)} → prepared {humanBytes(selectedImage.preparedBytes)} · {selectedImage.width} × {selectedImage.height}. The server compresses it once more before storage.</FileMeta>
              ) : product?.imageBytes ? (
                <FileMeta>Stored WebP: {humanBytes(product.imageBytes)}{product.imageWidth && product.imageHeight ? ` · ${product.imageWidth} × ${product.imageHeight}` : ''}</FileMeta>
              ) : (
                <FileMeta>A branded storefront image is used as a temporary fallback until an authentic product photo is uploaded.</FileMeta>
              )}
            </UploadCopy>
          </UploadArea>

          <AdvancedDetails>
            <AdvancedSummary>SEO, accessibility, and manufacturer identifiers</AdvancedSummary>
            <AdvancedGrid>
              <FullField
                helperText="Leave blank to generate a sensible description from the product name and store."
                label="Image alt text"
                onChange={(event) => update('imageAlt', event.target.value)}
                slotProps={{ htmlInput: { maxLength: 180 } }}
                value={form.imageAlt}
              />
              <Field
                helperText="Optional. Only enter a real GTIN/barcode assigned to this product."
                label="GTIN / barcode"
                onChange={(event) => update('gtin', event.target.value.replace(/\D/g, ''))}
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 14 } }}
                value={form.gtin}
              />
              <Field
                helperText="Optional. Do not invent a manufacturer part number."
                label="Manufacturer part number"
                onChange={(event) => update('mpn', event.target.value)}
                slotProps={{ htmlInput: { maxLength: 80 } }}
                value={form.mpn}
              />
            </AdvancedGrid>
          </AdvancedDetails>
        </FormSection>

        <FormActions>
          <PublishButton disabled={saving} name="catalogAction" type="submit" value="publish" variant="contained">
            {saving ? 'Saving…' : editing ? 'Save and publish' : 'Publish product'}
          </PublishButton>
          <DraftButton disabled={saving} name="catalogAction" type="submit" value="draft" variant="outlined">
            {editing ? 'Save as draft' : 'Save draft'}
          </DraftButton>
          <CancelLink href="/admin/products">Cancel</CancelLink>
        </FormActions>
      </ProductForm>
    </Root>
  );
}
