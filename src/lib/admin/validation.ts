import { z } from 'zod';

const plainName = z
  .string()
  .trim()
  .min(2, 'Enter a name with at least 2 characters.')
  .max(60, 'Keep the name under 60 characters.')
  .regex(/^[^<>\u0000-\u001F\u007F]+$/, 'Enter a valid plain-text name.');

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.')
  .max(254, 'Keep the email address under 254 characters.');

const optionalPhilippinePhone = z
  .string()
  .trim()
  .regex(/^(?:|09\d{9})$/, 'Use a Philippine mobile number in 09XXXXXXXXX format.');

export const createManagedAccountSchema = z
  .object({
    email,
    fullName: plainName,
    password: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(72, 'Keep the password under 72 characters.'),
    phone: optionalPhilippinePhone,
    role: z.enum(['customer', 'admin', 'deliverer']),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.role === 'customer' && !value.phone) {
      context.addIssue({
        code: 'custom',
        message: 'A contact number is required for Customer accounts.',
        path: ['phone'],
      });
    }
  });

export const updateCustomerProfileSchema = z
  .object({
    fullName: plainName,
    phone: z
      .string()
      .trim()
      .regex(/^09\d{9}$/, 'Use a Philippine mobile number in 09XXXXXXXXX format.'),
    status: z.enum(['active', 'inactive']),
  })
  .strict();

export const customerIdSchema = z.string().uuid();

export type CreateManagedAccountPayload = z.infer<typeof createManagedAccountSchema>;
export type UpdateCustomerProfilePayload = z.infer<typeof updateCustomerProfileSchema>;
