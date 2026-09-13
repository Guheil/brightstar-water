import { z } from 'zod';

const accountEmail = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.')
  .max(254, 'Keep the email address under 254 characters.');

const currentPassword = z
  .string()
  .min(1, 'Enter your current password.')
  .max(72, 'The password is too long.');

const newPassword = z
  .string()
  .min(8, 'Use at least 8 characters for the new password.')
  .max(72, 'Keep the new password under 72 characters.');

export const accountEmailChangeSchema = z
  .object({
    currentPassword,
    newEmail: accountEmail,
  })
  .strict();

export const accountPasswordChangeSchema = z
  .object({
    confirmPassword: z.string().max(72, 'The password is too long.'),
    currentPassword,
    newPassword,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.newPassword !== value.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The new passwords do not match.',
        path: ['confirmPassword'],
      });
    }

    if (value.newPassword === value.currentPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose a new password that is different from your current password.',
        path: ['newPassword'],
      });
    }
  });

export type AccountEmailChangePayload = z.infer<typeof accountEmailChangeSchema>;
export type AccountPasswordChangePayload = z.infer<typeof accountPasswordChangeSchema>;
