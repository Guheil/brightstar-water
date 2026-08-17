import { describe, expect, it } from 'vitest';
import {
  createManagedAccountSchema,
  updateCustomerProfileSchema,
} from './validation';

describe('Admin account validation', () => {
  it('allows Admin and Deliverer accounts without a phone number', () => {
    for (const role of ['admin', 'deliverer'] as const) {
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

  it('requires a valid Philippine mobile number for Customer accounts', () => {
    const missing = createManagedAccountSchema.safeParse({
      email: 'customer@example.com',
      fullName: 'Customer Account',
      password: 'correct-horse-battery-staple',
      phone: '',
      role: 'customer',
    });
    const valid = createManagedAccountSchema.safeParse({
      email: 'customer@example.com',
      fullName: 'Customer Account',
      password: 'correct-horse-battery-staple',
      phone: '09171234567',
      role: 'customer',
    });

    expect(missing.success).toBe(false);
    expect(valid.success).toBe(true);
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

  it('only permits customer profile updates with a valid phone and known status', () => {
    expect(updateCustomerProfileSchema.safeParse({
      fullName: 'Customer Name',
      phone: '09171234567',
      status: 'inactive',
    }).success).toBe(true);

    expect(updateCustomerProfileSchema.safeParse({
      fullName: 'Customer Name',
      phone: '',
      status: 'active',
    }).success).toBe(false);

    expect(updateCustomerProfileSchema.safeParse({
      fullName: 'Customer Name',
      phone: '09171234567',
      status: 'deleted',
    }).success).toBe(false);
  });
});
