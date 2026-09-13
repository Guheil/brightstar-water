import { describe, expect, it } from 'vitest';
import {
  accountEmailChangeSchema,
  accountPasswordChangeSchema,
} from './accountSecurityValidation';

describe('account security validation', () => {
  it('normalizes a valid new email and requires the current password', () => {
    const parsed = accountEmailChangeSchema.parse({
      currentPassword: 'CurrentPassword123!',
      newEmail: '  NEW.ADMIN@example.com ',
    });

    expect(parsed.newEmail).toBe('new.admin@example.com');
    expect(accountEmailChangeSchema.safeParse({ currentPassword: '', newEmail: 'new@example.com' }).success)
      .toBe(false);
  });

  it('rejects malformed and oversized email input', () => {
    expect(accountEmailChangeSchema.safeParse({
      currentPassword: 'CurrentPassword123!',
      newEmail: '<script>alert(1)</script>',
    }).success).toBe(false);

    expect(accountEmailChangeSchema.safeParse({
      currentPassword: 'CurrentPassword123!',
      newEmail: `${'a'.repeat(250)}@example.com`,
    }).success).toBe(false);
  });

  it('requires matching new passwords with a minimum length', () => {
    expect(accountPasswordChangeSchema.safeParse({
      confirmPassword: 'NewPassword123!',
      currentPassword: 'CurrentPassword123!',
      newPassword: 'NewPassword123!',
    }).success).toBe(true);

    expect(accountPasswordChangeSchema.safeParse({
      confirmPassword: 'different',
      currentPassword: 'CurrentPassword123!',
      newPassword: 'NewPassword123!',
    }).success).toBe(false);

    expect(accountPasswordChangeSchema.safeParse({
      confirmPassword: 'short',
      currentPassword: 'CurrentPassword123!',
      newPassword: 'short',
    }).success).toBe(false);
  });

  it('rejects reusing the current password', () => {
    expect(accountPasswordChangeSchema.safeParse({
      confirmPassword: 'CurrentPassword123!',
      currentPassword: 'CurrentPassword123!',
      newPassword: 'CurrentPassword123!',
    }).success).toBe(false);
  });
});
