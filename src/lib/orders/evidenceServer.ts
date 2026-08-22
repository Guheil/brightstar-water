import 'server-only';

import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import type { SupabaseClient } from '@supabase/supabase-js';

export const ORDER_EVIDENCE_BUCKET = 'order-evidence';
export const MAX_EVIDENCE_INPUT_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;
const MAX_OUTPUT_BYTES = 700 * 1024;
const MAX_DIMENSION = 1800;
const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export class OrderEvidenceError extends Error {
  constructor(message: string, public readonly code: 'invalid_image' | 'too_large' | 'storage_failed') {
    super(message);
    this.name = 'OrderEvidenceError';
  }
}

export async function ensureOrderEvidenceBucket(client: SupabaseClient): Promise<void> {
  const { data } = await client.storage.getBucket(ORDER_EVIDENCE_BUCKET);
  if (data) return;
  const { error } = await client.storage.createBucket(ORDER_EVIDENCE_BUCKET, {
    public: false,
    allowedMimeTypes: ['image/webp'],
    fileSizeLimit: MAX_OUTPUT_BYTES,
  });
  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw new OrderEvidenceError('Evidence storage is unavailable.', 'storage_failed');
  }
}

async function normalizeEvidence(file: File): Promise<Buffer> {
  if (!ACCEPTED_TYPES.has(file.type)) throw new OrderEvidenceError('Upload a JPEG, PNG, or WebP image.', 'invalid_image');
  if (file.size <= 0 || file.size > MAX_EVIDENCE_INPUT_BYTES) throw new OrderEvidenceError('Choose an image smaller than 5 MB.', 'too_large');
  const input = Buffer.from(await file.arrayBuffer());
  try {
    const metadata = await sharp(input, { failOn: 'warning', limitInputPixels: MAX_IMAGE_PIXELS }).metadata();
    if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS || !metadata.format || !['jpeg','png','webp'].includes(metadata.format)) {
      throw new Error('unsupported image');
    }
    const output = await sharp(input, { failOn: 'warning', limitInputPixels: MAX_IMAGE_PIXELS })
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78, effort: 5, smartSubsample: true })
      .toBuffer();
    if (output.byteLength > MAX_OUTPUT_BYTES) {
      const compressed = await sharp(input, { failOn: 'warning', limitInputPixels: MAX_IMAGE_PIXELS })
        .rotate().resize({ width: 1400, height: 1400, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 64, effort: 5, smartSubsample: true }).toBuffer();
      if (compressed.byteLength > MAX_OUTPUT_BYTES) throw new OrderEvidenceError('The image is too complex to store safely. Choose a smaller image.', 'too_large');
      return compressed;
    }
    return output;
  } catch (error) {
    if (error instanceof OrderEvidenceError) throw error;
    throw new OrderEvidenceError('The selected file is not a valid supported image.', 'invalid_image');
  }
}

export async function uploadOrderEvidence(
  client: SupabaseClient,
  actorId: string,
  kind: 'payments' | 'deliveries',
  file: File,
): Promise<string> {
  await ensureOrderEvidenceBucket(client);
  const buffer = await normalizeEvidence(file);
  const path = `${kind}/${actorId}/${randomUUID()}.webp`;
  const { error } = await client.storage.from(ORDER_EVIDENCE_BUCKET).upload(path, buffer, {
    cacheControl: '0', contentType: 'image/webp', upsert: false,
  });
  if (error) throw new OrderEvidenceError('The evidence image could not be saved.', 'storage_failed');
  return path;
}

export async function removeOrderEvidence(client: SupabaseClient, path: string | null | undefined): Promise<void> {
  if (!path) return;
  await client.storage.from(ORDER_EVIDENCE_BUCKET).remove([path]);
}

export async function createEvidenceSignedUrl(client: SupabaseClient, path: string | null | undefined): Promise<string | undefined> {
  if (!path) return undefined;
  const { data, error } = await client.storage.from(ORDER_EVIDENCE_BUCKET).createSignedUrl(path, 300);
  return error ? undefined : data.signedUrl;
}
