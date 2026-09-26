import 'server-only';

import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type NextRequest, type NextResponse } from 'next/server';
import { getRecoveryIdentityFromClaims, type RecoveryIdentity } from '@/lib/auth/passwordRecovery';
import { getSupabasePublicConfig } from './config';

export const RECOVERY_AUTH_COOKIE_NAME = 'mrje-recovery-auth';

type ResponseCookieOptions = Parameters<NextResponse['cookies']['set']>[2];

interface PendingCookie {
  name: string;
  options: ResponseCookieOptions;
  value: string;
}

const recoveryCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60,
  name: RECOVERY_AUTH_COOKIE_NAME,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

const recoveryCookieDeletionOptions = {
  httpOnly: recoveryCookieOptions.httpOnly,
  maxAge: 0,
  path: recoveryCookieOptions.path,
  sameSite: recoveryCookieOptions.sameSite,
  secure: recoveryCookieOptions.secure,
};

const recoveryAuthOptions = {
  experimental: {
    appendPkceFlowIdToRedirects: true,
  },
};

function hasRecoveryCookieName(name: string): boolean {
  return name === RECOVERY_AUTH_COOKIE_NAME || name.startsWith(`${RECOVERY_AUTH_COOKIE_NAME}.`);
}

export function hasRecoverySessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => hasRecoveryCookieName(cookie.name));
}

function createRecoveryClient(
  getAll: () => { name: string; value: string }[],
  setAll: (cookiesToSet: PendingCookie[]) => void,
) {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createServerClient(url, publishableKey, {
    auth: recoveryAuthOptions,
    cookieOptions: recoveryCookieOptions,
    cookies: {
      getAll,
      setAll,
    },
  });
}

export function createRecoveryRouteClient(request: NextRequest) {
  // A PKCE recovery start writes several cookie keys: a flow-specific verifier,
  // its flow index, and the legacy verifier fallback. Keep every write across
  // `setAll` calls; replacing the previous batch would omit the flow-specific
  // verifier that the callback must select using `sb_flow_id`.
  const pendingCookies = new Map<string, PendingCookie>();
  const supabase = createRecoveryClient(
    () => request.cookies.getAll(),
    (cookiesToSet) => {
      cookiesToSet.forEach((cookie) => {
        pendingCookies.set(cookie.name, cookie);
        request.cookies.set(cookie.name, cookie.value);
      });
    },
  );

  return {
    applyCookies(response: NextResponse) {
      pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      return response;
    },
    supabase,
  };
}

export async function createRecoveryServerClient() {
  const cookieStore = await cookies();
  return createRecoveryClient(
    () => cookieStore.getAll(),
    (cookiesToSet) => {
      try {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      } catch {
        // Server components cannot always write cookies. The proxy and route
        // handlers own refresh and explicit recovery-cookie cleanup.
      }
    },
  );
}

export async function getVerifiedRecoveryIdentity(
  supabase: SupabaseClient,
  accessToken?: string,
): Promise<RecoveryIdentity | null> {
  const { data, error } = await supabase.auth.getClaims(accessToken);
  if (error) return null;
  return getRecoveryIdentityFromClaims(data?.claims);
}

export function clearRecoveryAuthCookies(response: NextResponse, request?: NextRequest) {
  const names = new Set<string>([RECOVERY_AUTH_COOKIE_NAME]);
  request?.cookies.getAll().forEach(({ name }) => {
    if (name.startsWith(RECOVERY_AUTH_COOKIE_NAME)) names.add(name);
  });

  names.forEach((name) => {
    response.cookies.set(name, '', recoveryCookieDeletionOptions);
    // Keep downstream Server Components in this same request from seeing a
    // credential that has just been revoked. The response still carries the
    // deletion to the browser.
    request?.cookies.delete(name);
  });
}

// Password recovery globally signs the user out. Clear any ordinary Supabase
// SSR cookies in this browser too so an already-issued app JWT cannot be
// selected by a subsequent request while its short access-token lifetime runs
// out. This intentionally runs only after a successful password update.
export function clearOrdinarySupabaseAuthCookies(response: NextResponse, request: NextRequest) {
  request.cookies.getAll().forEach(({ name }) => {
    if (!name.startsWith('sb-') || name.startsWith(RECOVERY_AUTH_COOKIE_NAME)) return;
    response.cookies.set(name, '', {
      httpOnly: false,
      maxAge: 0,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    request.cookies.delete(name);
  });
}
