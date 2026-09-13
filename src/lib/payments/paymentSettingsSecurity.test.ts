import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

const adminRoute = read('src/app/api/admin/payment-settings/route.ts');
const customerRoute = read('src/app/api/customer/payment-settings/route.ts');
const orderRoute = read('src/app/api/customer/orders/route.ts');
const imageServer = read('src/lib/payments/imageServer.ts');
const migration = read('supabase/migrations/202609120002_dynamic_gcash_payment_settings.sql');

describe('GCash payment settings security boundary', () => {
  it('keeps payment settings private and Admin mutations server-authorized', () => {
    expect(migration).toContain('alter table public.payment_settings enable row level security');
    expect(migration).toContain('revoke all on table public.payment_settings from public, anon, authenticated');
    expect(adminRoute).toContain("getOperationsApiContext('admin-payment-settings-update', 20, 600, 'admin')");
    expect(adminRoute).toContain('isSameOriginMutation');
    expect(adminRoute).toContain('MAX_FORM_BYTES');
  });

  it('validates and re-encodes uploaded QR images before private storage', () => {
    expect(imageServer).toContain("allowedMimeTypes: ['image/webp']");
    expect(imageServer).toContain('public: false');
    expect(imageServer).toContain(".webp({ lossless: true");
    expect(imageServer).toContain('limitInputPixels');
    expect(customerRoute).toContain('toCustomerGCashPaymentSettingsView');
  });

  it('binds each GCash order to the settings version shown to the customer', () => {
    expect(orderRoute).toContain('gcashSettingsVersion');
    expect(orderRoute).toContain('customer_place_order_with_payment_settings');
    expect(migration).toContain('for share');
    expect(migration).toContain('p_gcash_settings_version <> v_settings.version');
    expect(migration).toContain('gcash_settings_version = v_settings.version');
    expect(migration).toContain('gcash_recipient_name = v_settings.recipient_name');
  });
});
