import { z } from 'zod';

const safeName = /^[^<>\u0000-\u001F\u007F]+$/;

export const customerProfileUpdateSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your name.')
      .max(60, 'Keep your name under 60 characters.')
      .regex(safeName, 'Remove unsupported characters from your name.'),
    phone: z
      .string()
      .trim()
      .regex(/^09\d{9}$/, 'Use a Philippine mobile number in 09XXXXXXXXX format.'),
  })
  .strict();

export type CustomerProfileUpdatePayload = z.infer<typeof customerProfileUpdateSchema>;
