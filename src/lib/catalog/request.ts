import 'server-only';

import type { NextRequest } from 'next/server';
import type { ProductMutationInput } from './types';
import { isAllowedProductBrand, productMutationSchema } from './validation';
import type { ProductTypeDefinition } from '@/types';

export const MAX_PRODUCT_FORM_BYTES = 3_500_000;

export function hasMultipartFormData(request: NextRequest): boolean {
  return (request.headers.get('content-type') ?? '').toLowerCase().startsWith('multipart/form-data;');
}

export function isProductFormWithinLimit(request: NextRequest): boolean {
  const raw = request.headers.get('content-length');
  if (!raw) return true;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 && value <= MAX_PRODUCT_FORM_BYTES;
}

export async function readProductMutationForm(request: NextRequest): Promise<
  | { ok: true; input: ProductMutationInput; image: File | null }
  | { ok: false; status: number; error: string; issues?: Array<{ field: string; message: string }> }
> {
  if (!hasMultipartFormData(request)) {
    return { ok: false, status: 415, error: 'Product form data is required.' };
  }
  if (!isProductFormWithinLimit(request)) {
    return { ok: false, status: 413, error: 'The product form or photo is too large.' };
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return { ok: false, status: 400, error: 'The product form could not be read.' };
  }

  const payload = formData.get('payload');
  if (typeof payload !== 'string' || payload.length > 16_000) {
    return { ok: false, status: 400, error: 'Product details are invalid.' };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(payload) as unknown;
  } catch {
    return { ok: false, status: 400, error: 'Product details are invalid.' };
  }

  const parsed = productMutationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: 'Check the product details and try again.',
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path[0] ? String(issue.path[0]) : 'form',
        message: issue.message,
      })),
    };
  }

  if (!isAllowedProductBrand(parsed.data.brand)) {
    return { ok: false, status: 400, error: 'Choose a valid brand or enter a simple brand name.' };
  }

  const imageValue = formData.get('image');
  const image = imageValue instanceof File && imageValue.size > 0 ? imageValue : null;
  return { ok: true, input: parsed.data, image };
}

export function validateProductTypeSelection(
  input: ProductMutationInput,
  productTypes: readonly ProductTypeDefinition[],
  existingStore?: 'gas' | 'water',
): string | null {
  const type = productTypes.find((candidate) => candidate.code === input.productTypeCode && candidate.isActive);
  if (!type) return 'Choose a valid product type.';
  if (existingStore && type.store !== existingStore) {
    return 'A product cannot be moved to a different store after it is created.';
  }

  if (type.requiresSize) {
    if (input.sizeValue == null) return 'Choose a size for this product type.';
    if (type.allowedSizeValues.length && !type.allowedSizeValues.some((value) => value === input.sizeValue)) {
      return 'Choose one of the allowed sizes for this product type.';
    }
  } else if (input.sizeValue != null) {
    return 'This product type does not use a size.';
  }

  return null;
}
