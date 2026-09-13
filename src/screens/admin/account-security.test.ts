import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

const accountScreen = read('src/screens/admin/AccountScreen/index.tsx');
const accountElements = read('src/screens/admin/AccountScreen/elements.tsx');
const accountsScreen = read('src/screens/admin/AccountsScreen/index.tsx');
const emailRoute = read('src/app/api/account/email/route.ts');
const passwordRoute = read('src/app/api/account/password/route.ts');
const authConfig = read('supabase/config.toml');
const emailSyncMigration = read('supabase/migrations/202609120001_account_security_email_sync.sql');

describe('self-service account security', () => {
  it('keeps credential management on the signed-in account screen', () => {
    expect(accountScreen).toContain('Change login email');
    expect(accountScreen).toContain('Change password');
    expect(accountScreen).toContain("fetch('/api/account/email'");
    expect(accountScreen).toContain("fetch('/api/account/password'");
    expect(accountsScreen).toContain('My login & security');
    expect(accountsScreen).toContain('href="/admin/account"');
  });

  it('keeps all AccountScreen styling in elements.tsx', () => {
    expect(accountScreen).not.toContain('styled(');
    expect(accountScreen).not.toContain(' sx=');
    expect(accountScreen).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(accountElements).toContain("styled('form')");
    expect(accountElements).toContain("theme.breakpoints.down('md')");
  });

  it('protects both credential mutations with the shared API hardening controls', () => {
    for (const source of [emailRoute, passwordRoute]) {
      expect(source).toContain('isSameOriginMutation');
      expect(source).toContain('hasJsonContentType');
      expect(source).toContain('isRequestBodyWithinLimit');
      expect(source).toContain('readLimitedJson');
      expect(source).toContain('getAuthenticatedProfile');
      expect(source).toContain('profileCanAccessApplication');
      expect(source).toContain('consumeServerRateLimit');
      expect(source).toContain("'Cache-Control': 'private, no-store'");
      expect(source).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    }
  });

  it('requires the existing password before the protected server changes the signed-in user login email', () => {
    expect(emailRoute).toContain('verifyPasswordForEmail');
    expect(emailRoute).toContain('parsed.data.currentPassword');
    expect(emailRoute).toContain('adminClient.auth.admin.updateUserById');
    expect(emailRoute).toContain('email: parsed.data.newEmail');
    expect(emailRoute).toContain('email_confirm: true');
    expect(emailRoute).not.toContain('supabase.auth.updateUser');
  });

  it('enforces current-password password changes at the Supabase Auth layer', () => {
    expect(passwordRoute).toContain('current_password: parsed.data.currentPassword');
    expect(passwordRoute).toContain('password: parsed.data.newPassword');
    expect(authConfig).toContain('secure_password_change = true');
  });

  it('supports login identifiers without requiring inbox verification while keeping direct client email changes strict', () => {
    expect(authConfig).toContain('double_confirm_changes = true');
    expect(accountScreen).toContain('Use a valid email format, such as admin@example.com.');
    expect(accountScreen).toContain("router.replace('/login?emailChanged=1')");
    expect(emailRoute).toContain('email_confirm: true');
    expect(emailSyncMigration).toContain('after update of email on auth.users');
    expect(emailSyncMigration).toContain('update public.profiles');
    expect(emailSyncMigration).toContain('revoke all on function public.sync_profile_email_from_auth() from authenticated');
  });
});
