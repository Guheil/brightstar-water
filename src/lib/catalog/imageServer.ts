import 'server-only';

import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProductImageMeta } from './types';

export const PRODUCT_IMAGE_BUCKET = 'product-images';
export const MAX_SERVER_IMAGE_INPUT_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;
const TARGET_IMAGE_BYTES = 250 * 1024;
const MAX_OUTPUT_IMAGE_BYTES = 500 * 1024;
const MAX_OUTPUT_DIMENSION = 1600;
const SERVER_ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export class ProductImageError extends Error {
  constructor(message: string, public readonly code: 'invalid_image' | 'too_large' | 'storage_failed') {
    super(message);
    this.name = 'ProductImageError';
  }
}

export async function ensureProductImageBucket(client: SupabaseClient): Promise<void> {
  const { data, error } = await client.storage.getBucket(PRODUCT_IMAGE_BUCKET);
  if (data && !error) return;

  const { error: createError } = await client.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
    public: true,
    allowedMimeTypes: ['image/webp'],
    fileSizeLimit: MAX_OUTPUT_IMAGE_BYTES,
  });

  if (createError && !/already exists|duplicate/i.test(createError.message)) {
    throw new ProductImageError('Product image storage is not available.', 'storage_failed');
  }
}

async function encodeWithinTarget(input: Buffer): Promise<{
  buffer: Buffer;
  width: number;
  height: number;
}> {
  const dimensionSteps = [1600, 1400, 1200, 1000];
  const qualitySteps = [82, 76, 70, 64];
  let best: { buffer: Buffer; width: number; height: number } | null = null;

  for (const dimension of dimensionSteps) {
    for (const quality of qualitySteps) {
      const { data, info } = await sharp(input, {
        failOn: 'warning',
        limitInputPixels: MAX_IMAGE_PIXELS,
        sequentialRead: true,
      })
        .rotate()
        .resize({
          width: Math.min(dimension, MAX_OUTPUT_DIMENSION),
          height: Math.min(dimension, MAX_OUTPUT_DIMENSION),
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 5, smartSubsample: true })
        .toBuffer({ resolveWithObject: true });

      const candidate = { buffer: data, width: info.width, height: info.height };
      if (!best || candidate.buffer.byteLength < best.buffer.byteLength) best = candidate;
      if (candidate.buffer.byteLength <= TARGET_IMAGE_BYTES) return candidate;
    }
  }

  if (!best || best.buffer.byteLength > MAX_OUTPUT_IMAGE_BYTES) {
    throw new ProductImageError(
      'The photo could not be compressed enough. Choose a simpler or smaller image.',
      'too_large',
    );
  }

  return best;
}

export async function processAndUploadProductImage(
  client: SupabaseClient,
  productId: string,
  file: File,
): Promise<ProductImageMeta> {
  if (!SERVER_ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new ProductImageError('Upload a JPEG, PNG, or WebP photo.', 'invalid_image');
  }
  if (file.size <= 0 || file.size > MAX_SERVER_IMAGE_INPUT_BYTES) {
    throw new ProductImageError('The prepared photo is too large to upload.', 'too_large');
  }

  const input = Buffer.from(await file.arrayBuffer());

  let metadata;
  try {
    metadata = await sharp(input, {
      failOn: 'warning',
      limitInputPixels: MAX_IMAGE_PIXELS,
      sequentialRead: true,
    }).metadata();
  } catch {
    throw new ProductImageError('The selected file is not a valid supported image.', 'invalid_image');
  }

  if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
    throw new ProductImageError('The selected file is not a supported image.', 'invalid_image');
  }
  if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS) {
    throw new ProductImageError('The selected photo has unsupported dimensions.', 'too_large');
  }

  let encoded;
  try {
    encoded = await encodeWithinTarget(input);
  } catch (error) {
    if (error instanceof ProductImageError) throw error;
    throw new ProductImageError('The product photo could not be processed.', 'invalid_image');
  }

  await ensureProductImageBucket(client);
  const path = `products/${productId}/${randomUUID()}.webp`;
  const { error: uploadError } = await client.storage.from(PRODUCT_IMAGE_BUCKET).upload(
    path,
    encoded.buffer,
    {
      cacheControl: '31536000',
      contentType: 'image/webp',
      upsert: false,
    },
  );

  if (uploadError) {
    throw new ProductImageError('The product photo could not be saved.', 'storage_failed');
  }

  return {
    path,
    publicUrl: client.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
    width: encoded.width,
    height: encoded.height,
    bytes: encoded.buffer.byteLength,
  };
}

export async function removeProductImage(client: SupabaseClient, path: string | null): Promise<void> {
  if (!path) return;
  const { error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
  if (error) throw error;
}
