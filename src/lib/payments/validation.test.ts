import { describe, expect, it } from 'vitest';
import { updateGCashPaymentSettingsSchema } from './validation';

describe('GCash payment settings validation', () => {
  it('normalizes common mobile-number formatting', () => {
    const parsed = updateGCashPaymentSettingsSchema.parse({
      enabled: true,
      recipientName: 'Store Owner',
      accountNumber: '0917 123 4567',
      removeQr: false,
      expectedVersion: 3,
    });
    expect(parsed.accountNumber).toBe('09171234567');
  });

  it('rejects malformed mobile numbers and markup-like recipient text', () => {
    expect(updateGCashPaymentSettingsSchema.safeParse({
      enabled: false,
      recipientName: '<script>',
      accountNumber: '',
      removeQr: false,
      expectedVersion: 1,
    }).success).toBe(false);
    expect(updateGCashPaymentSettingsSchema.safeParse({
      enabled: false,
      recipientName: 'Store Owner',
      accountNumber: '12345',
      removeQr: false,
      expectedVersion: 1,
    }).success).toBe(false);
  });

  it('rejects unexpected properties', () => {
    expect(updateGCashPaymentSettingsSchema.safeParse({
      enabled: false,
      recipientName: '',
      accountNumber: '',
      removeQr: false,
      expectedVersion: 1,
      role: 'admin',
    }).success).toBe(false);
  });
});
