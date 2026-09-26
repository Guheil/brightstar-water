import { z } from 'zod';
import {
  emailAddressSchema,
  newPasswordSchema,
  passwordConfirmationSchema,
} from './passwordPolicy';

export const passwordRecoveryRequestSchema = z
  .object({
    email: emailAddressSchema,
  })
  .strict();

export const passwordRecoveryCompletionSchema = z
  .object({
    newPassword: newPasswordSchema,
    confirmPassword: passwordConfirmationSchema,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.newPassword !== value.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The passwords do not match.',
        path: ['confirmPassword'],
      });
    }
  });

export type PasswordRecoveryRequestPayload = z.infer<typeof passwordRecoveryRequestSchema>;
export type PasswordRecoveryCompletionPayload = z.infer<typeof passwordRecoveryCompletionSchema>;
