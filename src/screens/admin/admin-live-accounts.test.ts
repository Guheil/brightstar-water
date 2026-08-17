import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

const routeShell = read('src/screens/admin/AdminRouteShell/index.tsx');
const accountsPage = read('src/app/(admin)/admin/accounts/page.tsx');
const customersPage = read('src/app/(admin)/admin/customers/page.tsx');
const customersScreen = read('src/screens/admin/CustomersScreen/index.tsx');
const customerDetail = read('src/screens/admin/CustomerDetailScreen/index.tsx');
const accountRoute = read('src/app/api/admin/accounts/route.ts');
const customerRoute = read('src/app/api/admin/customers/[id]/route.ts');
const adminClient = read('src/lib/supabase/admin.ts');

describe('live Admin accounts and customers', () => {
  it('places Accounts in the Admin navigation', () => {
    expect(routeShell).toContain("label: 'Accounts'");
    expect(routeShell).toContain("href: '/admin/accounts'");
  });

  it('loads Accounts and Customers from Supabase-backed server helpers', () => {
    expect(accountsPage).toContain('listManagedProfiles');
    expect(customersPage).toContain('listCustomers');
    expect(customersScreen).not.toContain('useAppStore');
    expect(customersScreen).not.toContain('customers.records');
    expect(customerDetail).not.toContain('CUSTOMER_DATA');
  });

  it('keeps privileged user creation on the server', () => {
    expect(adminClient).toContain("import 'server-only'");
    expect(adminClient).toContain('SUPABASE_SECRET_KEY');
    expect(accountRoute).toContain('getAuthenticatedProfile');
    expect(accountRoute).toContain("actor.role !== 'admin'");
    expect(accountRoute).toContain('auth.admin.createUser');
    expect(accountRoute).toContain('provision_admin_managed_profile');
  });

  it('protects mutations with origin, input, body-size, and rate-limit checks', () => {
    for (const source of [accountRoute, customerRoute]) {
      expect(source).toContain('isSameOriginMutation');
      expect(source).toContain('hasJsonContentType');
      expect(source).toContain('isRequestBodyWithinLimit');
      expect(source).toContain('readLimitedJson');
      expect(source).toContain('consumeAdminRateLimit');
      expect(source).toContain("'Cache-Control': 'private, no-store'");
    }
  });
});
