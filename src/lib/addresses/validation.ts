import { z } from 'zod';

const psgcCode = z.string().regex(/^\d{10}$/, 'Choose a valid location.');
const cleanText = (minimum: number, maximum: number, label: string) =>
  z.string().trim().min(minimum, `${label} is required.`).max(maximum, `${label} is too long.`)
    .refine((value) => !/[<>\u0000-\u001F\u007F]/.test(value), `${label} contains unsupported characters.`);
const optionalCleanText = (maximum: number, label: string) =>
  z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().trim().min(2).max(maximum, `${label} is too long.`)
      .refine((value) => !/[<>\u0000-\u001F\u007F]/.test(value), `${label} contains unsupported characters.`)
      .optional(),
  );

export const addressMutationSchema = z.object({
  addressType: z.enum(['home', 'work', 'other']),
  customLabel: optionalCleanText(40, 'Address label'),
  recipientName: cleanText(2, 80, 'Recipient name'),
  phone: z.string().trim().regex(/^09\d{9}$/, 'Enter a Philippine mobile number starting with 09.'),
  regionCode: psgcCode,
  regionName: cleanText(2, 100, 'Region'),
  provinceCode: psgcCode,
  provinceName: cleanText(2, 100, 'Province'),
  municipalityCode: psgcCode,
  municipalityName: cleanText(2, 120, 'City or municipality'),
  barangayCode: psgcCode,
  barangayName: cleanText(1, 120, 'Barangay'),
  addressLine: cleanText(3, 180, 'House, building, and street'),
  landmark: optionalCleanText(140, 'Landmark'),
  deliveryNote: optionalCleanText(300, 'Delivery instructions'),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  makeDefault: z.boolean().optional().default(false),
}).strict().superRefine((value, context) => {
  if (value.addressType === 'other' && !value.customLabel) {
    context.addIssue({ code: 'custom', path: ['customLabel'], message: 'Enter a short label for this address.' });
  }
  if (value.addressType !== 'other' && value.customLabel) {
    context.addIssue({ code: 'custom', path: ['customLabel'], message: 'A custom label only applies to Other.' });
  }
});

export const addressIdSchema = z.string().uuid();

export const psgcQuerySchema = z.object({
  level: z.enum(['regions', 'provinces', 'municipalities', 'barangays']),
  provinceCode: z.string().regex(/^\d{10}$/).optional(),
  municipalityCode: z.string().regex(/^\d{10}$/).optional(),
}).strict().superRefine((value, context) => {
  if (value.level === 'municipalities' && !value.provinceCode) {
    context.addIssue({ code: 'custom', path: ['provinceCode'], message: 'Province is required.' });
  }
  if (value.level === 'barangays' && !value.municipalityCode) {
    context.addIssue({ code: 'custom', path: ['municipalityCode'], message: 'City or municipality is required.' });
  }
});
