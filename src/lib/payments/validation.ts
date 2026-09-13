import { z } from 'zod';

const plainText = (max: number) => z
  .string()
  .trim()
  .max(max)
  .refine((value) => !/[<>\u0000-\u001f\u007f]/.test(value), 'Use plain text only.');

export const updateGCashPaymentSettingsSchema = z.object({
  enabled: z.boolean(),
  recipientName: plainText(100),
  accountNumber: z.string().trim().max(40).transform((value) => value.replace(/\D/g, '')).refine(
    (value) => value === '' || /^09\d{9}$/.test(value),
    'Enter an 11-digit GCash mobile number starting with 09.',
  ),
  removeQr: z.boolean(),
  expectedVersion: z.number().int().min(1),
}).strict();
