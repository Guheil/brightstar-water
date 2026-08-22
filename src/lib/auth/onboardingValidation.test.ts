import { describe, expect, it } from 'vitest';
import { onboardingPasswordSchema, onboardingProfileSchema } from './onboardingValidation';

describe('onboarding validation', () => {
  it('rejects reusing the temporary password', () => {
    const result = onboardingPasswordSchema.safeParse({
      currentPassword: 'Temporary123!',
      newPassword: 'Temporary123!',
      confirmPassword: 'Temporary123!',
    });

    expect(result.success).toBe(false);
  });

  it('rejects mismatched new passwords', () => {
    const result = onboardingPasswordSchema.safeParse({
      currentPassword: 'Temporary123!',
      newPassword: 'Replacement123!',
      confirmPassword: 'Different123!',
    });

    expect(result.success).toBe(false);
  });

  it('allows an empty phone before role-aware completion validation', () => {
    expect(
      onboardingProfileSchema.safeParse({ fullName: 'Sample User', phone: '' }).success,
    ).toBe(true);
  });

  it('rejects malformed phone input', () => {
    expect(
      onboardingProfileSchema.safeParse({ fullName: 'Sample User', phone: '123' }).success,
    ).toBe(false);
  });
});
