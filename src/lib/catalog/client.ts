import type { AdminCatalogSnapshot, CatalogSnapshot, ProductMutationInput } from './types';
import type { InventoryItem, Product, ProductTypeDefinition } from '@/types';

interface ApiErrorBody {
  error?: string;
  issues?: Array<{ field: string; message: string }>;
}

export class CatalogApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly issues: ApiErrorBody['issues'] = [],
  ) {
    super(message);
    this.name = 'CatalogApiError';
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!response.ok) {
    throw new CatalogApiError(body.error ?? 'The request could not be completed.', response.status, body.issues);
  }
  return body as T;
}

export async function fetchPublicCatalog(signal?: AbortSignal): Promise<CatalogSnapshot> {
  const response = await fetch('/api/catalog', {
    method: 'GET',
    credentials: 'same-origin',
    signal,
  });
  return parseResponse<CatalogSnapshot>(response);
}

export async function fetchAdminCatalog(signal?: AbortSignal): Promise<AdminCatalogSnapshot> {
  const response = await fetch('/api/admin/products', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  });
  return parseResponse<AdminCatalogSnapshot>(response);
}

export async function fetchAdminProduct(
  productId: string,
  signal?: AbortSignal,
): Promise<{ product: Product; inventory: InventoryItem | null; productTypes: ProductTypeDefinition[] }> {
  const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  });
  return parseResponse(response);
}

function toProductFormData(input: ProductMutationInput, image?: File | null): FormData {
  const formData = new FormData();
  formData.set('payload', JSON.stringify(input));
  if (image) formData.set('image', image, 'product-photo.webp');
  return formData;
}

export async function createAdminProduct(
  input: ProductMutationInput,
  image?: File | null,
): Promise<{ product: Product; inventory: InventoryItem | null }> {
  const response = await fetch('/api/admin/products', {
    method: 'POST',
    credentials: 'same-origin',
    body: toProductFormData(input, image),
  });
  return parseResponse(response);
}

export async function updateAdminProduct(
  productId: string,
  input: ProductMutationInput,
  image?: File | null,
): Promise<{ product: Product; inventory: InventoryItem | null }> {
  const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    body: toProductFormData(input, image),
  });
  return parseResponse(response);
}

export async function deleteAdminProduct(productId: string): Promise<{ product: Product }> {
  const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  return parseResponse(response);
}

export async function adjustAdminInventory(
  productId: string,
  input: { mode: 'increase' | 'decrease' | 'set'; quantity: number; reason: string },
): Promise<{ inventory: InventoryItem }> {
  const response = await fetch(`/api/admin/inventory/${encodeURIComponent(productId)}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return parseResponse(response);
}
