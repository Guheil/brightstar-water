import { describe, expect, it } from 'vitest';
import { customerProfileUpdateSchema } from './validation';

const validProfile = {
  fullName: 'Maria Santos',
  phone: '09171234567',
};

describe('customerProfileUpdateSchema', () => {
  it('accepts a trimmed name and Philippine mobile number', () => {
    const parsed = customerProfileUpdateSchema.parse({
      fullName: '  Maria Santos  ',
      phone: '09171234567',
    });

    expect(parsed).toEqual(validProfile);
  });

  it('rejects HTML-like names and malformed phone numbers', () => {
    expect(customerProfileUpdateSchema.safeParse({
      ...validProfile,
      fullName: '<script>alert(1)</script>',
    }).success).toBe(false);

    expect(customerProfileUpdateSchema.safeParse({
      ...validProfile,
      phone: '12345',
    }).success).toBe(false);
  });

  it('rejects mass-assignment fields', () => {
    expect(customerProfileUpdateSchema.safeParse({
      ...validProfile,
      role: 'admin',
      status: 'active',
      email: 'other@example.com',
    }).success).toBe(false);
  });
});
