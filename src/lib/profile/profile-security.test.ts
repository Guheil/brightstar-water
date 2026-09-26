import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const route = read('src/app/api/customer/profile/route.ts');
const profileScreen = read('src/screens/customer/ProfileScreen/index.tsx');
const initialState = read('src/store/initialState.ts');
const authMigration = read('supabase/migrations/202608170001_auth_phase1.sql');

describe('customer profile persistence and static-data boundary', () => {
  it('keeps production customer state empty until authenticated data is hydrated', () => {
    expect(initialState).toContain('records: includeOperationalFixtures ? structuredClone(CUSTOMER_DATA) : []');
  });

  it('derives profile ownership from the authenticated actor and rejects mass assignment', () => {
    expect(route).toContain("actor.role !== 'customer'");
    expect(route).toContain(".eq('id', actor.id)");
    expect(route).toContain('customerProfileUpdateSchema.safeParse(body.value)');
    expect(route).toContain('consumeServerRateLimit');
    expect(route).toContain('isSameOriginMutation(request)');
    expect(route).not.toContain('parsed.data.id');
    expect(route).not.toContain('role: parsed.data');
    expect(route).not.toContain('status: parsed.data');
    expect(route).not.toContain('email: parsed.data');
  });

  it('uses existing RLS and column grants as a second ownership boundary', () => {
    expect(authMigration).toContain('grant update (full_name, phone) on public.profiles to authenticated');
    expect(authMigration).toContain('using ((select auth.uid()) = id)');
    expect(authMigration).toContain('with check ((select auth.uid()) = id)');
  });

  it('keeps login email read-only on the ordinary customer profile form', () => {
    expect(profileScreen).toContain('label="Login email"');
    expect(profileScreen).toContain('helperText="Used to sign in to your account."');
    expect(profileScreen).toContain('disabled');
    expect(profileScreen).not.toContain("update('email'");
  });

  it('replaces simulated recovery with the secure server-backed recovery flow and removes legacy local services', () => {
    expect(existsSync(resolve(process.cwd(), 'src/app/(auth)/forgot-password/page.tsx'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'src/screens/auth/ForgotPasswordScreen'))).toBe(true);
    expect(read('src/screens/auth/ForgotPasswordScreen/index.tsx')).toContain("fetch('/api/auth/password-recovery/request'");
    expect(read('src/screens/auth/ForgotPasswordScreen/index.tsx')).not.toContain("endsWith('.test')");
    expect(read('src/screens/auth/ForgotPasswordScreen/index.tsx')).not.toContain('setTimeout(resolve, 280)');
    expect(existsSync(resolve(process.cwd(), 'src/services/local'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/screens/admin/customerPrototypeState.ts'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/screens/admin/productPrototypeState.ts'))).toBe(false);
  });
});
