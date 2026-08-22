import { describe, expect, it } from 'vitest';
import {
  createManagedAccountSchema,
  deleteManagedAccountSchema,
  updateManagedProfileSchema,
} from './validation';

describe('Admin account validation', () => {
  it('allows first-login accounts to be provisioned without a phone number', () => {
    for (const role of ['customer', 'admin', 'deliverer'] as const) {
      const result = createManagedAccountSchema.safeParse({
        email: `${role}@example.com`,
        fullName: `${role} Account`,
        password: 'correct-horse-battery-staple',
        phone: '',
        role,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects role injection, HTML-like names, and unknown fields', () => {
    const injectedRole = createManagedAccountSchema.safeParse({
      email: 'owner@example.com',
      fullName: 'Owner Account',
      password: 'correct-horse-battery-staple',
      phone: '',
      role: 'superadmin',
    });
    const htmlName = createManagedAccountSchema.safeParse({
      email: 'admin@example.com',
      fullName: '<script>alert(1)</script>',
      password: 'correct-horse-battery-staple',
      phone: '',
      role: 'admin',
    });
    const massAssignment = createManagedAccountSchema.safeParse({
      email: 'admin@example.com',
      fullName: 'Admin Account',
      password: 'correct-horse-battery-staple',
      phone: '',
      role: 'admin',
      status: 'active',
    });

    expect(injectedRole.success).toBe(false);
    expect(htmlName.success).toBe(false);
    expect(massAssignment.success).toBe(false);
  });

  it('validates shared account profile updates without allowing role or email changes', () => {
    expect(updateManagedProfileSchema.safeParse({
      fullName: 'Managed Account',
      phone: '09171234567',
      status: 'inactive',
    }).success).toBe(true);

    expect(updateManagedProfileSchema.safeParse({
      fullName: 'Managed Account',
      phone: '',
      status: 'active',
    }).success).toBe(true);

    expect(updateManagedProfileSchema.safeParse({
      fullName: 'Managed Account',
      phone: '09171234567',
      status: 'active',
      role: 'admin',
    }).success).toBe(false);
  });

  it('requires a bounded current password for destructive deletion requests', () => {
    expect(deleteManagedAccountSchema.safeParse({
      currentPassword: 'current-password',
    }).success).toBe(true);

    expect(deleteManagedAccountSchema.safeParse({
      confirmationEmail: 'owner@example.com',
      currentPassword: 'current-password',
    }).success).toBe(true);

    expect(deleteManagedAccountSchema.safeParse({
      currentPassword: '',
    }).success).toBe(false);

    expect(deleteManagedAccountSchema.safeParse({
      currentPassword: 'current-password',
      targetRole: 'admin',
    }).success).toBe(false);
  });
});
