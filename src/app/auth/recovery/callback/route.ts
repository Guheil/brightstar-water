import { NextResponse, type NextRequest } from 'next/server';
import {
  clearPasswordRecoveryIntent,
  createPasswordRecoveryIntent,
  setPasswordRecoveryIntent,
} from '@/lib/auth/passwordRecovery';
import { registerPasswordRecoverySession } from '@/lib/auth/passwordRecoveryRegistry';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  clearRecoveryAuthCookies,
  createRecoveryRouteClient,
  getVerifiedRecoveryIdentity,
} from '@/lib/supabase/recovery';

const AUTH_RESPONSE_HEADERS = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
} as const;
const MAX_CODE_LENGTH = 2048;
// Keep this in lockstep with @supabase/auth-js 2.112.3's
// `validatePKCEFlowId`. The SDK currently generates 32-character ids, but
// accepts the full 8–64 character format when receiving a redirect.
const FLOW_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

type RecoveryFailureStage =
  | 'callback_exception'
  | 'invalid_callback_parameters'
  | 'missing_server_configuration'
  | 'pkce_exchange_failed'
  | 'recovery_marker_missing'
  | 'recovery_session_rejected'
  | 'session_user_mismatch'
  | 'verified_identity_missing';

// These fixed labels are safe to log in development and production: they do
// not include the recovery code, token, email address, flow id, cookies, or a
// provider error message. They make a fail-closed redirect diagnosable.
function logRecoveryFailure(stage: RecoveryFailureStage) {
  console.warn('Password recovery callback rejected.', { stage });
}

function recoveryRedirect(request: NextRequest, destination: string) {
  const response = NextResponse.redirect(new URL(destination, request.url), 303);
  Object.entries(AUTH_RESPONSE_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

function invalidateRecovery(
  request: NextRequest,
  applyCookies: (response: NextResponse) => NextResponse,
  stage: RecoveryFailureStage,
) {
  logRecoveryFailure(stage);
  const response = applyCookies(recoveryRedirect(request, '/forgot-password?recovery=invalid'));
  clearRecoveryAuthCookies(response, request);
  clearPasswordRecoveryIntent(response);
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const flowId = request.nextUrl.searchParams.get('sb_flow_id');

  if (!code || code.length > MAX_CODE_LENGTH || (flowId !== null && !FLOW_ID_PATTERN.test(flowId))) {
    logRecoveryFailure('invalid_callback_parameters');
    const response = recoveryRedirect(request, '/forgot-password?recovery=invalid');
    clearRecoveryAuthCookies(response, request);
    clearPasswordRecoveryIntent(response);
    return response;
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    logRecoveryFailure('missing_server_configuration');
    const response = recoveryRedirect(request, '/forgot-password?recovery=invalid');
    clearRecoveryAuthCookies(response, request);
    clearPasswordRecoveryIntent(response);
    return response;
  }

  try {
    const { supabase, applyCookies } = createRecoveryRouteClient(request);
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );

    // @supabase/auth-js 2.112.3 writes `recovery` beside the PKCE verifier
    // and returns it as redirectType during exchange. This local PKCE marker
    // is required in addition to verified claims and the registry; an ordinary
    // authenticated session is never evidence of password recovery.
    const recoveryExchange = data as typeof data & { redirectType?: unknown };
    if (error) return invalidateRecovery(request, applyCookies, 'pkce_exchange_failed');
    if (recoveryExchange.redirectType !== 'recovery') {
      return invalidateRecovery(request, applyCookies, 'recovery_marker_missing');
    }
    if (!data.session || !data.user || data.user.id !== data.session.user.id) {
      return invalidateRecovery(request, applyCookies, 'session_user_mismatch');
    }

    const identity = await getVerifiedRecoveryIdentity(supabase, data.session.access_token);
    if (!identity || identity.userId !== data.user.id) {
      return invalidateRecovery(request, applyCookies, 'verified_identity_missing');
    }

    const registered = await registerPasswordRecoverySession(adminClient, identity);
    if (!registered) return invalidateRecovery(request, applyCookies, 'recovery_session_rejected');

    const response = applyCookies(recoveryRedirect(request, '/reset-password'));
    clearPasswordRecoveryIntent(response);
    setPasswordRecoveryIntent(response, createPasswordRecoveryIntent(identity));
    return response;
  } catch {
    logRecoveryFailure('callback_exception');
    const response = recoveryRedirect(request, '/forgot-password?recovery=invalid');
    clearRecoveryAuthCookies(response, request);
    clearPasswordRecoveryIntent(response);
    return response;
  }
}
