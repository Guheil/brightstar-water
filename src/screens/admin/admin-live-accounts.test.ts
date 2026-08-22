import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

const routeShell = read('src/screens/admin/AdminRouteShell/index.tsx');
const accountsPage = read('src/app/(admin)/admin/accounts/page.tsx');
const accountsScreen = read('src/screens/admin/AccountsScreen/index.tsx');
const accountDetail = read('src/screens/admin/AccountDetailScreen/index.tsx');
const customersRedirect = read('src/app/(admin)/admin/customers/page.tsx');
const accountCreateRoute = read('src/app/api/admin/accounts/route.ts');
const accountManageRoute = read('src/app/api/admin/accounts/[id]/route.ts');
const adminClient = read('src/lib/supabase/admin.ts');
const migration = read('supabase/migrations/202608220003_unified_accounts_and_protected_deletion.sql');

describe('unified live Admin accounts workspace', () => {
  it('uses Accounts as the single identity-management navigation destination', () => {
    expect(routeShell).toContain("label: 'Accounts'");
    expect(routeShell).toContain("href: '/admin/accounts'");
    expect(routeShell).not.toContain("label: 'Customers'");
    expect(customersRedirect).toContain("role: 'customer'");
    expect(customersRedirect).toContain('redirect(`/admin/accounts?');
  });

  it('loads all roles from one Supabase-backed Accounts surface', () => {
    expect(accountsPage).toContain('listManagedProfiles');
    expect(accountsPage).toContain("requireRole('admin')");
    expect(accountsScreen).toContain('RoleSwitcher');
    expect(accountsScreen).toContain("value: 'customer'");
    expect(accountsScreen).toContain("value: 'deliverer'");
    expect(accountsScreen).toContain("value: 'admin'");
    expect(accountDetail).toContain('Account details');
  });

  it('keeps privileged user creation and deletion on server routes', () => {
    expect(adminClient).toContain("import 'server-only'");
    expect(adminClient).toContain('SUPABASE_SECRET_KEY');
    expect(accountCreateRoute).toContain('auth.admin.createUser');
    expect(accountManageRoute).toContain('auth.admin.deleteUser');
    expect(accountManageRoute).toContain('verifyPasswordForEmail');
    expect(accountManageRoute).toContain('reserve_admin_account_deletion');
  });

  it('uses the authenticated Admin read path to verify deletion targets without broadening service-role table grants', () => {
    expect(accountManageRoute).toContain("import { getManagedProfile } from '@/lib/admin/server';");
    expect(accountManageRoute).toContain('targetProfile = await getManagedProfile(parsedId.data);');
    expect(accountManageRoute).not.toContain("adminClient\n      .from('profiles')");
    expect(accountManageRoute).toContain("{ error: 'The account could not be verified for deletion.' }");
    expect(accountManageRoute).toContain("{ error: 'Account not found.' }");
  });

  it('protects every account mutation with origin, input, body-size, and rate-limit checks', () => {
    for (const source of [accountCreateRoute, accountManageRoute]) {
      expect(source).toContain('isSameOriginMutation');
      expect(source).toContain('hasJsonContentType');
      expect(source).toContain('isRequestBodyWithinLimit');
      expect(source).toContain('readLimitedJson');
      expect(source).toContain('consumeAdminRateLimit');
      expect(source).toContain("'Cache-Control': 'private, no-store'");
    }
  });

  it('enforces self-only Administrator deletion and last-active-Admin protection in the database', () => {
    expect(migration).toContain('Administrator accounts can only be deleted by their owner');
    expect(migration).toContain('The last active Administrator cannot be deleted');
    expect(migration).toContain("onboarding_stage = 'complete'");
    expect(migration).toContain('pg_advisory_xact_lock');
    expect(migration).toContain('deletion_reserved_at');
  });
});
