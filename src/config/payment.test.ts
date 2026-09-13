import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GCASH_UNAVAILABLE_MESSAGE, PAYMENT_METHOD_LABEL } from './payment';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const checkout = read('src/screens/customer/CheckoutScreen/index.tsx');
const orderRoute = read('src/app/api/customer/orders/route.ts');
const adminRoute = read('src/app/api/admin/payment-settings/route.ts');
const customerRoute = read('src/app/api/customer/payment-settings/route.ts');
const migration = read('supabase/migrations/202609120002_dynamic_gcash_payment_settings.sql');

describe('dynamic GCash payment settings boundary', () => {
  it('keeps public copy evergreen while checkout decides live availability', () => {
    expect(GCASH_UNAVAILABLE_MESSAGE).toContain('cash on delivery');
    expect(PAYMENT_METHOD_LABEL).toContain('when available');
    expect(checkout).toContain('fetchCustomerGCashPaymentSettings');
    expect(checkout).toContain('disabled: gcashLoading || !gcashAvailable');
  });

  it('protects Admin settings behind the authenticated server API', () => {
    expect(adminRoute).toContain("getOperationsApiContext('admin-payment-settings-update'");
    expect(adminRoute).toContain('isSameOriginMutation');
    expect(adminRoute).toContain('updateGCashPaymentSettingsSchema');
    expect(adminRoute).toContain('processAndUploadGCashQr');
    expect(customerRoute).toContain("getOperationsApiContext('customer-payment-settings-read'");
  });

  it('enforces live GCash availability and version matching on order submission', () => {
    expect(orderRoute).toContain('loadGCashPaymentSettingsRow');
    expect(orderRoute).toContain('parsed.data.gcashSettingsVersion');
    expect(orderRoute).toContain("rpc('customer_place_order_with_payment_settings'");
    expect(migration).toContain('for share');
    expect(migration).toContain('GCash payment details were updated');
    expect(migration).toContain('gcash_settings_version');
    expect(migration).toContain('gcash_recipient_name');
  });
});
