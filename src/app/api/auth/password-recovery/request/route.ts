import { NextResponse, type NextRequest } from 'next/server';
import { passwordRecoveryRequestSchema } from '@/lib/auth/passwordRecoveryValidation';
import { passwordRecoveryRateLimitKey } from '@/lib/auth/passwordRecovery';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { consumePasswordRecoveryRateLimit } from '@/lib/security/rateLimit';
import {
  hasJsonContentType,
  isRequestBodyWithinLimit,
  isSameOriginMutation,
  readLimitedJson,
} from '@/lib/security/request';
import { createAdminClient } from '@/lib/supabase/admin';
import { createRecoveryRouteClient } from '@/lib/supabase/recovery';

const RECOVERY_REQUEST_MAX_BYTES = 1024;
const PRIVATE_NO_STORE = { 'Cache-Control': 'no-store' } as const;
const GENERIC_RESPONSE = {
  accepted: true,
  message: 'If an account matches that email address, recovery instructions will arrive shortly.',
} as const;

function genericAcceptedResponse() {
  return NextResponse.json(GENERIC_RESPONSE, { status: 200, headers: PRIVATE_NO_STORE });
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  if (!hasJsonContentType(request)) {
    return NextResponse.json(
      { error: 'JSON content is required.' },
      { status: 415, headers: PRIVATE_NO_STORE },
    );
  }

  if (!isRequestBodyWithinLimit(request, RECOVERY_REQUEST_MAX_BYTES)) {
    return NextResponse.json(
      { error: 'Request is too large.' },
      { status: 413, headers: PRIVATE_NO_STORE },
    );
  }

  const body = await readLimitedJson(request, RECOVERY_REQUEST_MAX_BYTES);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too_large' ? 'Request is too large.' : 'Enter a valid email address.' },
      { status: body.reason === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE },
    );
  }

  const parsed = passwordRecoveryRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a valid email address.' },
      { status: 400, headers: PRIVATE_NO_STORE },
    );
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Password recovery is missing server-only configuration.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
    });
    return NextResponse.json(
      { error: 'Password recovery is not configured right now.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  try {
    const auditContext = getAuditRequestContext(request);
    const [ipLimit, emailLimit] = await Promise.all([
      consumePasswordRecoveryRateLimit(
        adminClient,
        passwordRecoveryRateLimitKey('ip', auditContext.clientIp ?? 'unavailable'),
        10,
        15 * 60,
      ),
      consumePasswordRecoveryRateLimit(
        adminClient,
        passwordRecoveryRateLimitKey('email', parsed.data.email),
        5,
        15 * 60,
      ),
    ]);

    // A generic 200 response intentionally makes throttling indistinguishable
    // from an unknown account. It also avoids an account-enumeration signal.
    if (!ipLimit.allowed || !emailLimit.allowed) return genericAcceptedResponse();

    const { supabase, applyCookies } = createRecoveryRouteClient(request);
    const redirectTo = new URL('/auth/recovery/callback', request.nextUrl.origin).toString();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo });

    if (error) {
      console.warn('Supabase did not accept a password recovery request.', {
        code: error.code,
        status: error.status,
      });
    }

    return applyCookies(genericAcceptedResponse());
  } catch (error) {
    console.error('Password recovery request could not be completed.', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Password recovery is temporarily unavailable.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }
}
