import { NextResponse, type NextRequest } from 'next/server';
import { clearPasswordRecoveryIntent, passwordRecoveryRateLimitKey, verifyPasswordRecoveryIntent } from '@/lib/auth/passwordRecovery';
import { passwordRecoveryCompletionSchema } from '@/lib/auth/passwordRecoveryValidation';
import {
  getPasswordRecoverySession,
  markPasswordRecoverySession,
} from '@/lib/auth/passwordRecoveryRegistry';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { consumePasswordRecoveryRateLimit } from '@/lib/security/rateLimit';
import {
  hasJsonContentType,
  isRequestBodyWithinLimit,
  isSameOriginMutation,
  readLimitedJson,
} from '@/lib/security/request';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  clearOrdinarySupabaseAuthCookies,
  clearRecoveryAuthCookies,
  createRecoveryRouteClient,
  getVerifiedRecoveryIdentity,
} from '@/lib/supabase/recovery';

const RECOVERY_COMPLETION_MAX_BYTES = 1024;
const NO_STORE = { 'Cache-Control': 'no-store' } as const;

function response(body: object, status: number, applyCookies?: (value: NextResponse) => NextResponse) {
  const nextResponse = NextResponse.json(body, { status, headers: NO_STORE });
  return applyCookies ? applyCookies(nextResponse) : nextResponse;
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return response({ error: 'Invalid request.' }, 403);
  }

  if (!hasJsonContentType(request)) {
    return response({ error: 'JSON content is required.' }, 415);
  }

  if (!isRequestBodyWithinLimit(request, RECOVERY_COMPLETION_MAX_BYTES)) {
    return response({ error: 'Request is too large.' }, 413);
  }

  const body = await readLimitedJson(request, RECOVERY_COMPLETION_MAX_BYTES);
  if (!body.ok) {
    return response(
      { error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' },
      body.reason === 'too_large' ? 413 : 400,
    );
  }

  const parsed = passwordRecoveryCompletionSchema.safeParse(body.value);
  if (!parsed.success) {
    return response(
      {
        error: 'Check the new password details and try again.',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path[0] ? String(issue.path[0]) : 'form',
          message: issue.message,
        })),
      },
      400,
    );
  }

  const { supabase, applyCookies } = createRecoveryRouteClient(request);
  const identity = await getVerifiedRecoveryIdentity(supabase);
  if (!identity) {
    const nextResponse = response({ error: 'Password recovery has expired. Request a new link.' }, 401, applyCookies);
    clearRecoveryAuthCookies(nextResponse, request);
    clearPasswordRecoveryIntent(nextResponse);
    return nextResponse;
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return response({ error: 'Password recovery is not configured right now.' }, 503, applyCookies);
  }

  try {
    const recoverySession = await getPasswordRecoverySession(adminClient, identity);
    const intent = request.cookies.get('mrje-password-recovery-intent')?.value;
    if (recoverySession?.state !== 'active' || !verifyPasswordRecoveryIntent(intent, identity)) {
      const nextResponse = response({ error: 'Password recovery has expired. Request a new link.' }, 401, applyCookies);
      clearRecoveryAuthCookies(nextResponse, request);
      clearPasswordRecoveryIntent(nextResponse);
      return nextResponse;
    }

    const auditContext = getAuditRequestContext(request);
    const [ipLimit, sessionLimit] = await Promise.all([
      consumePasswordRecoveryRateLimit(
        adminClient,
        passwordRecoveryRateLimitKey('ip', auditContext.clientIp ?? 'unavailable'),
        8,
        10 * 60,
      ),
      consumePasswordRecoveryRateLimit(
        adminClient,
        passwordRecoveryRateLimitKey('session', identity.sessionId),
        5,
        10 * 60,
      ),
    ]);
    if (!ipLimit.allowed || !sessionLimit.allowed) {
      return response(
        { error: 'Too many password reset attempts. Please wait and try again.' },
        429,
        applyCookies,
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });
    if (updateError) {
      return response(
        { error: 'The password could not be reset. Check the new password and try again.' },
        400,
        applyCookies,
      );
    }

    let globalRevocationFailed = false;
    let localRevocationFailed = false;
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      globalRevocationFailed = Boolean(error);
    } catch {
      globalRevocationFailed = true;
    }

    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      localRevocationFailed = Boolean(error);
    } catch {
      localRevocationFailed = true;
    }

    try {
      await markPasswordRecoverySession(
        adminClient,
        identity,
        globalRevocationFailed && localRevocationFailed
          ? 'revocation_pending'
          : 'revoked_waiting_for_access_expiry',
      );
    } catch {
      // The password change succeeded. Keep the special cookie explicitly
      // cleared below and tell the user to sign in again rather than claiming
      // that the completed password update failed.
      globalRevocationFailed = true;
    }

    const nextResponse = response(
      {
        changed: true,
        revocationPending: globalRevocationFailed || localRevocationFailed,
      },
      200,
      applyCookies,
    );
    clearRecoveryAuthCookies(nextResponse, request);
    clearOrdinarySupabaseAuthCookies(nextResponse, request);
    clearPasswordRecoveryIntent(nextResponse);
    return nextResponse;
  } catch {
    return response({ error: 'Password recovery is temporarily unavailable.' }, 503, applyCookies);
  }
}
