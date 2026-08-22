import { z } from 'zod';

const cleanPlainText = (value: string) => value.replace(/[\u0000-\u001F\u007F<>]/g, '').trim();

const textField = (min: number, max: number, label: string) =>
  z.string().transform(cleanPlainText).pipe(
    z.string().min(min, `${label} is required.`).max(max, `${label} is too long.`),
  );

const nullableTextField = (max: number) =>
  z.union([z.string(), z.null(), z.undefined()]).transform((value) => {
    if (value == null) return null;
    const cleaned = cleanPlainText(value).slice(0, max);
    return cleaned || null;
  });


function hasValidGtinCheckDigit(value: string): boolean {
  if (![8, 12, 13, 14].includes(value.length) || !/^\d+$/.test(value)) return false;
  const body = value.slice(0, -1);
  const expected = Number(value.at(-1));
  let total = 0;
  for (let index = body.length - 1, position = 1; index >= 0; index -= 1, position += 1) {
    const digit = Number(body[index]);
    total += digit * (position % 2 === 1 ? 3 : 1);
  }
  return (10 - (total % 10)) % 10 === expected;
}

const productTypeCodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9_]{3,60}$/, 'Choose a valid product type.');

export const productMutationSchema = z.object({
  productTypeCode: productTypeCodeSchema,
  name: textField(2, 120, 'Product name'),
  shortDescription: textField(8, 180, 'Short description'),
  description: textField(12, 2000, 'Description'),
  sizeValue: z.union([z.number().positive().max(100000), z.null()]),
  priceCentavos: z.number().int().min(1, 'Enter a price greater than zero.').max(1_000_000_000),
  brand: nullableTextField(80),
  gtin: z.union([z.string(), z.null(), z.undefined()]).transform((value, ctx) => {
    const digits = typeof value === 'string' ? value.replace(/\D/g, '') : '';
    if (!digits) return null;
    if (![8, 12, 13, 14].includes(digits.length)) {
      ctx.addIssue({ code: 'custom', message: 'GTIN must contain 8, 12, 13, or 14 digits.' });
      return z.NEVER;
    }
    if (!hasValidGtinCheckDigit(digits)) {
      ctx.addIssue({ code: 'custom', message: 'GTIN check digit is not valid. Recheck the barcode.' });
      return z.NEVER;
    }
    return digits;
  }),
  mpn: nullableTextField(80),
  imageAlt: nullableTextField(180).transform((value) => value ?? ''),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  reorderLevel: z.number().int().min(0).max(1_000_000),
  openingStock: z.number().int().min(0).max(1_000_000).optional(),
});

export const productIdSchema = z
  .string()
  .trim()
  .regex(/^product-[A-Za-z0-9-]{4,72}$/, 'Invalid product ID.');

export const inventoryAdjustmentSchema = z.object({
  mode: z.enum(['increase', 'decrease', 'set']),
  quantity: z.number().int().min(0).max(1_000_000),
  reason: textField(4, 300, 'Adjustment reason'),
}).superRefine((value, ctx) => {
  if (value.mode !== 'set' && value.quantity === 0) {
    ctx.addIssue({ code: 'custom', path: ['quantity'], message: 'Enter a quantity greater than zero.' });
  }
});

export const ALLOWED_PRODUCT_BRANDS = ['MRJE', 'Bright Star', 'Unbranded'] as const;

export function isAllowedProductBrand(value: string | null): boolean {
  if (!value) return true;
  if ((ALLOWED_PRODUCT_BRANDS as readonly string[]).includes(value)) return true;
  return /^[A-Za-z0-9][A-Za-z0-9 .&'()\-/]{1,79}$/.test(value);
}
