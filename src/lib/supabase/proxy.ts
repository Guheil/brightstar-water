import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  clearPasswordRecoveryIntent,
  verifyPasswordRecoveryIntent,
} from '@/lib/auth/passwordRecovery';
import {
  getPasswordRecoverySession,
  markPasswordRecoverySession,
  touchPasswordRecoverySession,
} from '@/lib/auth/passwordRecoveryRegistry';
import { createAdminClient } from './admin';
import { getSupabasePublicConfig } from './config';
import {
  clearOrdinarySupabaseAuthCookies,
  clearRecoveryAuthCookies,
  createRecoveryRouteClient,
  getVerifiedRecoveryIdentity,
  hasRecoverySessionCookie,
} from './recovery';

type ResponseCookieOptions = Parameters<NextResponse['cookies']['set']>[2];

interface RefreshedCookie {
  name: string;
  value: string;
  options: ResponseCookieOptions;
}

function applySecurityHeaders(response: NextResponse, supabaseUrl: string) {
  const supabaseOrigin = new URL(supabaseUrl).origin;
  const supabaseWebsocketOrigin = supabaseOrigin
    .replace(/^https:/, 'wss:')
    .replace(/^http:/, 'ws:');
  const developmentConnectSource = process.env.NODE_ENV === 'development' ? ' ws:' : '';
  const developmentScriptSource = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${developmentScriptSource}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    `img-src 'self' data: blob: ${supabaseOrigin} https://images.pexels.com https://upload.wikimedia.org https://tile.openstreetmap.org`,
    `connect-src 'self'${developmentConnectSource} ${supabaseOrigin} ${supabaseWebsocketOrigin} https://tile.openstreetmap.org`,
    "worker-src 'self' blob:",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
  ];

  if (process.env.NODE_ENV === 'production') directives.push('upgrade-insecure-requests');
  response.headers.set('Content-Security-Policy', directives.join('; '));
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), payment=(), usb=()',
  );

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

function applyRefreshedCookies(response: NextResponse, cookies: RefreshedCookie[]) {
  cookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
}

function finalizeResponse(response: NextResponse, supabaseUrl: string, pathname: string) {
  applySecurityHeaders(response, supabaseUrl);

  if (/^\/(?:admin|customer|deliverer|onboarding|reset-password)(?:\/|$)/.test(pathname)) {
    response.headers.set('Cache-Control', 'private, no-store');
  }

  return response;
}

function recoveryRedirect(request: NextRequest, destination: string) {
  const response = NextResponse.redirect(new URL(destination, request.url), 303);
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

async function endInvalidRecoverySession(
  request: NextRequest,
  url: string,
  identity: Parameters<typeof markPasswordRecoverySession>[1],
  supabase: ReturnType<typeof createRecoveryRouteClient>['supabase'],
  applyCookies: ReturnType<typeof createRecoveryRouteClient>['applyCookies'],
) {
  const adminClient = createAdminClient();
  const { error } = await supabase.auth.signOut({ scope: 'local' });
  await markPasswordRecoverySession(
    adminClient,
    identity,
    error ? 'revocation_pending' : 'revoked_waiting_for_access_expiry',
  );

  const response = applyCookies(recoveryRedirect(request, '/forgot-password?recovery=invalid'));
  clearRecoveryAuthCookies(response, request);
  clearPasswordRecoveryIntent(response);
  return finalizeResponse(response, url, request.nextUrl.pathname);
}

async function enforceRecoverySessionContainment(request: NextRequest, url: string) {
  const { supabase, applyCookies } = createRecoveryRouteClient(request);
  const pathname = request.nextUrl.pathname;
  const identity = await getVerifiedRecoveryIdentity(supabase);

  // A cookie in the dedicated recovery namespace is never allowed to fall
  // through to the ordinary application session. Failed verification is closed
  // as an invalid recovery flow and clears only the recovery credentials.
  if (!identity) {
    const response = applyCookies(recoveryRedirect(request, '/forgot-password?recovery=invalid'));
    clearRecoveryAuthCookies(response, request);
    clearPasswordRecoveryIntent(response);
    return finalizeResponse(response, url, request.nextUrl.pathname);
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    const response = applyCookies(
      NextResponse.json(
        { error: 'Password recovery is temporarily unavailable.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      ),
    );
    return finalizeResponse(response, url, request.nextUrl.pathname);
  }

  let session;
  try {
    session = await getPasswordRecoverySession(adminClient, identity);
  } catch {
    const response = applyCookies(
      NextResponse.json(
        { error: 'Password recovery is temporarily unavailable.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      ),
    );
    return finalizeResponse(response, url, request.nextUrl.pathname);
  }

  if (!session || session.state !== 'active') {
    // A browser can make one request with a recovery cookie while processing
    // the Set-Cookie deletion from the prior response. `/login` is the
    // terminal cleanup destination, so let it render after clearing the
    // cookie instead of redirecting that URL back to itself indefinitely.
    const response = applyCookies(
      pathname === '/login'
        ? NextResponse.next({ request })
        : recoveryRedirect(request, '/login?passwordReset=1'),
    );
    clearRecoveryAuthCookies(response, request);
    clearOrdinarySupabaseAuthCookies(response, request);
    clearPasswordRecoveryIntent(response);
    return finalizeResponse(response, url, request.nextUrl.pathname);
  }

  try {
    const intent = request.cookies.get('mrje-password-recovery-intent')?.value;
    if (!verifyPasswordRecoveryIntent(intent, identity)) {
      return await endInvalidRecoverySession(request, url, identity, supabase, applyCookies);
    }

    await touchPasswordRecoverySession(adminClient, identity);
  } catch {
    const response = applyCookies(
      NextResponse.json(
        { error: 'Password recovery is temporarily unavailable.' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      ),
    );
    return finalizeResponse(response, url, request.nextUrl.pathname);
  }

  const isAllowedRecoveryDestination =
    pathname === '/reset-password' || pathname === '/api/auth/password-recovery/complete';

  if (isAllowedRecoveryDestination) {
    return finalizeResponse(applyCookies(NextResponse.next({ request })), url, pathname);
  }

  if (pathname.startsWith('/api/')) {
    return finalizeResponse(
      applyCookies(
        NextResponse.json(
          { error: 'This session can only complete password recovery.' },
          { status: 403, headers: { 'Cache-Control': 'no-store' } },
        ),
      ),
      url,
      pathname,
    );
  }

  return finalizeResponse(applyCookies(recoveryRedirect(request, '/reset-password')), url, pathname);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  let refreshedCookies: RefreshedCookie[] = [];
  const { url, publishableKey } = getSupabasePublicConfig();
  const pathname = request.nextUrl.pathname;

  // The recovery request stores a PKCE verifier in the dedicated recovery
  // cookie namespace before the email link is opened. The callback must reach
  // its route handler to exchange that code and turn the verifier into a
  // verified recovery session; treating the verifier itself as a session here
  // would clear it before the exchange can occur.
  if (pathname === '/auth/recovery/callback') {
    return finalizeResponse(response, url, pathname);
  }

  if (hasRecoverySessionCookie(request)) {
    return enforceRecoverySessionContainment(request, url);
  }

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        refreshedCookies = cookiesToSet;
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        applyRefreshedCookies(response, cookiesToSet);
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const isApiRoute = pathname.startsWith('/api/');
  const isOnboardingRoute = pathname === '/onboarding' || pathname.startsWith('/onboarding/');

  if (typeof userId === 'string' && userId && !isApiRoute && !isOnboardingRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status,account_origin,onboarding_stage')
      .eq('id', userId)
      .maybeSingle();

    if (
      profile?.status === 'active' &&
      profile.account_origin === 'admin_managed' &&
      profile.onboarding_stage !== 'complete'
    ) {
      const redirectResponse = NextResponse.redirect(new URL('/onboarding', request.url));
      applyRefreshedCookies(redirectResponse, refreshedCookies);
      applySecurityHeaders(redirectResponse, url);
      redirectResponse.headers.set('Cache-Control', 'private, no-store');
      return redirectResponse;
    }
  }

  return finalizeResponse(response, url, pathname);
}
