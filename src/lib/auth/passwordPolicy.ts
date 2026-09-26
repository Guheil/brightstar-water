import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 15;
export const PASSWORD_MAX_LENGTH = 72;

export const emailAddressSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.')
  .max(254, 'Keep the email address under 254 characters.');

export const currentPasswordSchema = z
  .string()
  .min(1, 'Enter your current password.')
  .max(PASSWORD_MAX_LENGTH, 'The password is too long.');

// Deliberately do not trim, normalize, or otherwise transform passwords.
// Supabase receives precisely the value the user entered.
export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(PASSWORD_MAX_LENGTH, `Keep your password under ${PASSWORD_MAX_LENGTH} characters.`);

export const passwordConfirmationSchema = z
  .string()
  .max(PASSWORD_MAX_LENGTH, `Keep your password under ${PASSWORD_MAX_LENGTH} characters.`);
