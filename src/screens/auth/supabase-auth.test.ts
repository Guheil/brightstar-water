import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) =>
  readFileSync(join(process.cwd(), relativePath), 'utf8');

describe('Supabase authentication Phase 1 architecture', () => {
  it('uses Supabase for login, signup, verification, resend, and logout', () => {
    const login = read('src/screens/auth/LoginScreen/index.tsx');
    const register = read('src/screens/auth/RegisterScreen/index.tsx');
    const authClient = read('src/lib/auth/client.ts');

    expect(login).toContain('signInWithPassword');
    expect(register).toContain('supabase.auth.signUp');
    expect(register).toContain('supabase.auth.verifyOtp');
    expect(register).toContain("supabase.auth.resend({ type: 'signup'");
    expect(authClient).toContain("supabase.auth.signOut({ scope: 'local' })");
    expect(login).not.toContain('AUTH_ACCOUNTS');
    expect(register).not.toContain('verificationCode:');
  });

  it('protects role workspaces with a verified server-side Supabase identity', () => {
    const authServer = read('src/lib/auth/server.ts');
    const adminLayout = read('src/app/(admin)/admin/layout.tsx');
    const customerLayout = read('src/app/(customer)/customer/layout.tsx');
    const delivererLayout = read('src/app/(deliverer)/deliverer/layout.tsx');

    expect(authServer).toContain('supabase.auth.getClaims()');
    expect(authServer).not.toContain('supabase.auth.getSession()');
    expect(adminLayout).toContain("requireRole('admin')");
    expect(customerLayout).toContain("requireRole('customer')");
    expect(delivererLayout).toContain("requireRole('deliverer')");
  });

  it('keeps session refresh cookies and auth responses security-aware', () => {
    const proxy = read('src/lib/supabase/proxy.ts');

    expect(proxy).toContain('setAll(cookiesToSet, headers)');
    expect(proxy).toContain('supabase.auth.getClaims()');
    expect(proxy).toContain("'Content-Security-Policy'");
    expect(proxy).toContain("'X-Content-Type-Options'");
    expect(proxy).toContain("'Cache-Control', 'private, no-store'");
  });

  it('enforces customer-only public signup and prevents role/status writes', () => {
    const migration = read('supabase/migrations/202608170001_auth_phase1.sql');

    expect(migration).toContain("'customer'::public.user_role");
    expect(migration).not.toContain("new.raw_user_meta_data ->> 'role'");
    expect(migration).toContain('alter table public.profiles enable row level security');
    expect(migration).toContain('revoke all privileges on table public.profiles from anon, authenticated');
    expect(migration).toContain('grant update (full_name, phone) on public.profiles to authenticated');
    expect(migration).toContain('using ((select auth.uid()) = id)');
  });

  it('does not ship a privileged Supabase key in application source', () => {
    const config = read('src/lib/supabase/config.ts');
    const envExample = read('.env.example');

    expect(config).toContain('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    expect(envExample).toContain('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    expect(config).not.toContain('SERVICE_ROLE');
    expect(envExample).not.toContain('SERVICE_ROLE');
    expect(envExample).not.toContain('SECRET_KEY');
  });
});
