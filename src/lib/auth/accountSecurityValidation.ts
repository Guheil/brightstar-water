import { z } from 'zod';
import {
  currentPasswordSchema,
  emailAddressSchema,
  newPasswordSchema,
  passwordConfirmationSchema,
} from './passwordPolicy';

export const accountEmailChangeSchema = z
  .object({
    currentPassword: currentPasswordSchema,
    newEmail: emailAddressSchema,
  })
  .strict();

export const accountPasswordChangeSchema = z
  .object({
    confirmPassword: passwordConfirmationSchema,
    currentPassword: currentPasswordSchema,
    newPassword: newPasswordSchema,
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
