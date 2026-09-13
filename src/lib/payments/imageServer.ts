import 'server-only';

import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { SupabaseClient } from '@supabase/supabase-js';
import { GCASH_QR_BUCKET } from './server';

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_INPUT_BYTES = 3 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 800 * 1024;
const MAX_IMAGE_PIXELS = 16_000_000;
const MAX_DIMENSION = 1200;
const MIN_DIMENSION = 128;

export class GCashQrImageError extends Error {
  constructor(message: string, public readonly code: 'invalid_image' | 'too_large' | 'storage_failed') {
    super(message);
    this.name = 'GCashQrImageError';
  }
}

export async function ensureGCashQrBucket(client: SupabaseClient): Promise<void> {
  const bucketOptions = {
    public: false,
    allowedMimeTypes: ['image/webp'],
    fileSizeLimit: MAX_OUTPUT_BYTES,
  };
  const { data, error } = await client.storage.getBucket(GCASH_QR_BUCKET);
  if (data && !error) {
    // Reassert the security boundary even if the bucket was created manually.
    // A public bucket would make QR objects permanently addressable by URL.
    const { error: updateError } = await client.storage.updateBucket(GCASH_QR_BUCKET, bucketOptions);
    if (updateError) {
      throw new GCashQrImageError('GCash QR storage is not available.', 'storage_failed');
    }
    return;
  }

  const { error: createError } = await client.storage.createBucket(GCASH_QR_BUCKET, bucketOptions);

  if (createError && !/already exists|duplicate/i.test(createError.message)) {
    throw new GCashQrImageError('GCash QR storage is not available.', 'storage_failed');
  }
}

export async function processAndUploadGCashQr(
  client: SupabaseClient,
  file: File,
): Promise<string> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new GCashQrImageError('Upload a PNG, JPG, or WebP QR image.', 'invalid_image');
  }
  if (file.size <= 0 || file.size > MAX_INPUT_BYTES) {
    throw new GCashQrImageError('Choose a QR image smaller than 3 MB.', 'too_large');
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
    throw new GCashQrImageError('The selected QR file is not a valid image.', 'invalid_image');
  }

  if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
    throw new GCashQrImageError('The selected QR file is not a supported image.', 'invalid_image');
  }
  if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS) {
    throw new GCashQrImageError('The QR image has unsupported dimensions.', 'too_large');
  }
  if (metadata.width < MIN_DIMENSION || metadata.height < MIN_DIMENSION) {
    throw new GCashQrImageError('Choose a clearer QR image that is at least 128 by 128 pixels.', 'invalid_image');
  }

  let output: Buffer;
  try {
    output = await sharp(input, {
      failOn: 'warning',
      limitInputPixels: MAX_IMAGE_PIXELS,
      sequentialRead: true,
    })
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ lossless: true, effort: 5 })
      .toBuffer();

    if (output.byteLength > MAX_OUTPUT_BYTES) {
      output = await sharp(input, {
        failOn: 'warning',
        limitInputPixels: MAX_IMAGE_PIXELS,
        sequentialRead: true,
      })
        .rotate()
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 90, effort: 5, smartSubsample: true })
        .toBuffer();
    }
  } catch {
    throw new GCashQrImageError('The QR image could not be processed.', 'invalid_image');
  }

  if (output.byteLength > MAX_OUTPUT_BYTES) {
    throw new GCashQrImageError('The QR image is too complex to store safely. Choose a simpler image.', 'too_large');
  }

  await ensureGCashQrBucket(client);
  const path = `gcash/${randomUUID()}.webp`;
  const { error } = await client.storage.from(GCASH_QR_BUCKET).upload(path, output, {
    cacheControl: '3600',
    contentType: 'image/webp',
    upsert: false,
  });
  if (error) throw new GCashQrImageError('The QR image could not be saved.', 'storage_failed');
  return path;
}

export async function removeGCashQr(client: SupabaseClient, path: string | null): Promise<void> {
  if (!path) return;
  const { error } = await client.storage.from(GCASH_QR_BUCKET).remove([path]);
  if (error) throw error;
}

