const CLIENT_ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024;
const MAX_ORIGINAL_PIXELS = 50_000_000;
const MAX_PREPARED_BYTES = 2.5 * 1024 * 1024;
const MAX_CLIENT_DIMENSION = 2200;

export interface PreparedProductImage {
  file: File;
  originalBytes: number;
  preparedBytes: number;
  width: number;
  height: number;
  previewUrl: string;
}

export class ProductImagePreparationError extends Error {}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ProductImagePreparationError('The photo could not be prepared.'))),
      'image/webp',
      quality,
    );
  });
}

export async function prepareProductImage(file: File): Promise<PreparedProductImage> {
  if (!CLIENT_ALLOWED_TYPES.has(file.type)) {
    throw new ProductImagePreparationError('Choose a JPEG, PNG, or WebP photo.');
  }
  if (file.size <= 0 || file.size > MAX_ORIGINAL_BYTES) {
    throw new ProductImagePreparationError('Choose a photo smaller than 15 MB.');
  }
  if (typeof createImageBitmap !== 'function') {
    throw new ProductImagePreparationError('This browser cannot safely prepare product photos.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > MAX_ORIGINAL_PIXELS) {
      throw new ProductImagePreparationError('The selected photo is too large in resolution.');
    }

    const scale = Math.min(1, MAX_CLIENT_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) throw new ProductImagePreparationError('The photo could not be prepared.');
    context.drawImage(bitmap, 0, 0, width, height);

    let blob = await canvasToBlob(canvas, 0.82);
    for (const quality of [0.74, 0.66, 0.58]) {
      if (blob.size <= MAX_PREPARED_BYTES) break;
      blob = await canvasToBlob(canvas, quality);
    }

    if (blob.size > MAX_PREPARED_BYTES) {
      throw new ProductImagePreparationError('The photo is still too large after preparation. Try a smaller image.');
    }

    const preparedFile = new File([blob], 'product-photo.webp', {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    return {
      file: preparedFile,
      originalBytes: file.size,
      preparedBytes: preparedFile.size,
      width,
      height,
      previewUrl: URL.createObjectURL(preparedFile),
    };
  } finally {
    bitmap.close();
  }
}
