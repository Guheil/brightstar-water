import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) => readFileSync(join(process.cwd(), relativePath), 'utf8');

describe('password recovery security architecture', () => {
  const requestRoute = read('src/app/api/auth/password-recovery/request/route.ts');
  const callbackRoute = read('src/app/auth/recovery/callback/route.ts');
  const completionRoute = read('src/app/api/auth/password-recovery/complete/route.ts');
  const resetScreen = read('src/screens/auth/ResetPasswordScreen/index.tsx');
  const proxy = read('src/lib/supabase/proxy.ts');
  const recoveryClient = read('src/lib/supabase/recovery.ts');
  const authSync = read('src/components/providers/AuthSessionSync/index.tsx');
  const migration = read('supabase/migrations/20260926030628_password_recovery_security.sql');

  it('uses a generic, bounded, server-authoritative recovery request', () => {
    expect(requestRoute).toContain('resetPasswordForEmail');
    expect(requestRoute).toContain("new URL('/auth/recovery/callback', request.nextUrl.origin)");
    expect(requestRoute).toContain('passwordRecoveryRateLimitKey');
    expect(requestRoute).toContain('isSameOriginMutation');
    expect(requestRoute).toContain('RECOVERY_REQUEST_MAX_BYTES');
    expect(requestRoute).toContain('GENERIC_RESPONSE');
    expect(requestRoute).not.toContain("from('profiles')");
  });

  it('requires the installed SDK PKCE recovery marker plus verified claims', () => {
    expect(callbackRoute).toContain('exchangeCodeForSession');
    expect(callbackRoute).toContain('sb_flow_id');
    expect(callbackRoute).toContain('^[A-Za-z0-9_-]{8,64}$');
    expect(callbackRoute).toContain("recoveryExchange.redirectType !== 'recovery'");
    expect(callbackRoute).toContain('getVerifiedRecoveryIdentity');
    expect(callbackRoute).toContain('registerPasswordRecoverySession');
    expect(callbackRoute).toContain("console.warn('Password recovery callback rejected.', { stage });");
    expect(callbackRoute).not.toContain('error.message');
    expect(callbackRoute).not.toContain('console.log');
  });

  it('changes a password only through the authenticated recovery client and ends the session', () => {
    expect(completionRoute).toContain('supabase.auth.updateUser');
    expect(completionRoute).toContain('supabase.auth.signOut({ scope: \'global\' })');
    expect(completionRoute).toContain('supabase.auth.signOut({ scope: \'local\' })');
    expect(completionRoute).toContain('clearOrdinarySupabaseAuthCookies');
    expect(completionRoute).toContain('verifyPasswordRecoveryIntent');
    expect(completionRoute).not.toContain('admin.updateUserById');
    expect(resetScreen).toContain('window.location.replace(');
    expect(resetScreen).not.toContain('router.refresh()');
  });

  it('isolates recovery credentials and blocks ordinary client/server application access', () => {
    expect(recoveryClient).toContain("RECOVERY_AUTH_COOKIE_NAME = 'mrje-recovery-auth'");
    expect(recoveryClient).toContain('httpOnly: true');
    expect(recoveryClient).toContain('appendPkceFlowIdToRedirects: true');
    expect(recoveryClient).toContain('const pendingCookies = new Map<string, PendingCookie>();');
    expect(recoveryClient).toContain('pendingCookies.set(cookie.name, cookie);');
    expect(recoveryClient).toContain('request?.cookies.delete(name);');
    expect(recoveryClient).toContain('recoveryCookieDeletionOptions');
    expect(recoveryClient).not.toContain('name: undefined');
    expect(proxy).toContain('hasRecoverySessionCookie(request)');
    expect(proxy).toContain("pathname === '/reset-password'");
    expect(proxy).toContain("pathname === '/api/auth/password-recovery/complete'");
    expect(authSync).toContain("const isRecoveryRoute = pathname === '/reset-password'");
    expect(authSync).toContain('if (isRecoveryRoute)');
  });

  it('lets the PKCE callback exchange its code before recovery containment', () => {
    const callbackBypass = proxy.indexOf("pathname === '/auth/recovery/callback'");
    const recoveryContainment = proxy.indexOf('if (hasRecoverySessionCookie(request))');

    expect(callbackBypass).toBeGreaterThanOrEqual(0);
    expect(recoveryContainment).toBeGreaterThan(callbackBypass);
    expect(proxy).toContain('return finalizeResponse(response, url, pathname);');
  });

  it('clears a revoked recovery cookie at login without a self-redirect loop', () => {
    expect(proxy).toContain("pathname === '/login'");
    expect(proxy).toContain('NextResponse.next({ request })');
    expect(proxy).toContain("recoveryRedirect(request, '/login?passwordReset=1')");
    expect(proxy).toContain('clearOrdinarySupabaseAuthCookies(response, request);');
  });

  it('uses durable, capped database state without auto-releasing active recovery restrictions', () => {
    expect(migration).toContain('password_recovery_rate_limits');
    expect(migration).toContain('password_recovery_sessions');
    expect(migration).toContain('>= 20000');
    expect(migration).toContain("state = 'revoked_waiting_for_access_expiry'");
    expect(migration).not.toContain('delete from public.password_recovery_sessions\n  where state = \'active\'');
  });
});
