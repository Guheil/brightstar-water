import { z } from 'zod';

const safeName = /^[^<>\u0000-\u001F\u007F]+$/;
const optionalPhilippinePhone = z
  .string()
  .trim()
  .regex(/^(?:|09\d{9})$/, 'Use a Philippine mobile number in 09XXXXXXXXX format.');

export const onboardingPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Enter the temporary password you used to sign in.')
      .max(72, 'The password is too long.'),
    newPassword: z
      .string()
      .min(8, 'Use at least 8 characters.')
      .max(72, 'Keep your password under 72 characters.'),
    confirmPassword: z.string().max(72, 'Keep your password under 72 characters.'),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.newPassword !== value.confirmPassword) {
      context.addIssue({
        code: 'custom',
        message: 'The passwords do not match.',
        path: ['confirmPassword'],
      });
    }

    if (value.currentPassword === value.newPassword) {
      context.addIssue({
        code: 'custom',
        message: 'Choose a new password that is different from the temporary password.',
        path: ['newPassword'],
      });
    }
  });

export const onboardingProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Enter your full name.')
      .max(60, 'Keep your name under 60 characters.')
      .regex(safeName, 'Remove unsupported characters from your name.'),
    phone: optionalPhilippinePhone,
    termsVersion: z.string().trim().max(32).optional(),
    privacyVersion: z.string().trim().max(32).optional(),
  })
  .strict();

export type OnboardingPasswordPayload = z.infer<typeof onboardingPasswordSchema>;
export type OnboardingProfilePayload = z.infer<typeof onboardingProfileSchema>;
