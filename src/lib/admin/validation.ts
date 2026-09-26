import { z } from 'zod';
import { emailAddressSchema, newPasswordSchema } from '@/lib/auth/passwordPolicy';

const plainName = z
  .string()
  .trim()
  .min(2, 'Enter a name with at least 2 characters.')
  .max(60, 'Keep the name under 60 characters.')
  .regex(/^[^<>\u0000-\u001F\u007F]+$/, 'Enter a valid plain-text name.');

const email = emailAddressSchema;

const optionalPhilippinePhone = z
  .string()
  .trim()
  .regex(/^(?:|09\d{9})$/, 'Use a Philippine mobile number in 09XXXXXXXXX format.');

export const createManagedAccountSchema = z
  .object({
    email,
    fullName: plainName,
    password: newPasswordSchema,
    phone: optionalPhilippinePhone,
    role: z.enum(['customer', 'admin', 'deliverer']),
  })
  .strict();

export const updateManagedProfileSchema = z
  .object({
    fullName: plainName,
    phone: optionalPhilippinePhone,
    status: z.enum(['active', 'inactive']),
  })
  .strict();

export const deleteManagedAccountSchema = z
  .object({
    confirmationEmail: email.optional(),
    currentPassword: z
      .string()
      .min(1, 'Enter your current administrator password.')
      .max(72, 'The password is too long.'),
  })
  .strict();

export const managedAccountIdSchema = z.string().uuid();

export type CreateManagedAccountPayload = z.infer<typeof createManagedAccountSchema>;
export type DeleteManagedAccountPayload = z.infer<typeof deleteManagedAccountSchema>;
export type UpdateManagedProfilePayload = z.infer<typeof updateManagedProfileSchema>;
