import { describe, expect, it } from 'vitest';
import { addressMutationSchema } from './validation';

const valid = {
  addressType: 'home' as const,
  recipientName: 'Juan Dela Cruz',
  phone: '09171234567',
  regionCode: '0400000000',
  regionName: 'Region IV-A (CALABARZON)',
  provinceCode: '0403400000',
  provinceName: 'Laguna',
  municipalityCode: '0403425000',
  municipalityName: 'City of San Pedro',
  barangayCode: '0403425016',
  barangayName: 'San Vicente',
  addressLine: '123 Sampaguita Street',
  latitude: 14.353,
  longitude: 121.0517,
  makeDefault: true,
};

describe('addressMutationSchema', () => {
  it('accepts a complete Philippine delivery address', () => {
    expect(addressMutationSchema.safeParse(valid).success).toBe(true);
  });

  it('requires Other addresses to have a label', () => {
    expect(addressMutationSchema.safeParse({ ...valid, addressType: 'other' }).success).toBe(false);
  });

  it('rejects invalid mobile numbers and script-like text', () => {
    expect(addressMutationSchema.safeParse({ ...valid, phone: '1234' }).success).toBe(false);
    expect(addressMutationSchema.safeParse({ ...valid, addressLine: '<script>alert(1)</script>' }).success).toBe(false);
  });

  it('rejects impossible coordinates', () => {
    expect(addressMutationSchema.safeParse({ ...valid, latitude: 100 }).success).toBe(false);
  });
});
