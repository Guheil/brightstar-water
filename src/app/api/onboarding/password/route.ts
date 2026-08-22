import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { onboardingPasswordSchema } from '@/lib/auth/onboardingValidation';
import { consumeServerRateLimit } from '@/lib/security/rateLimit';
import {
  hasJsonContentType,
  isRequestBodyWithinLimit,
  isSameOriginMutation,
  readLimitedJson,
} from '@/lib/security/request';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

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

  if (!isRequestBodyWithinLimit(request)) {
    return NextResponse.json(
      { error: 'Request is too large.' },
      { status: 413, headers: PRIVATE_NO_STORE },
    );
  }

  const profile = await getAuthenticatedProfile();
  if (!profile || profile.status !== 'active') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401, headers: PRIVATE_NO_STORE });
  }

  if (profile.account_origin !== 'admin_managed' || profile.onboarding_stage !== 'password_required') {
    return NextResponse.json(
      { error: 'This setup step is no longer available.' },
      { status: 409, headers: PRIVATE_NO_STORE },
    );
  }

  const auditContext = getAuditRequestContext(request);

  const body = await readLimitedJson(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' },
      { status: body.reason === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE },
    );
  }

  const parsed = onboardingPasswordSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Check the password details and try again.',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path[0] ? String(issue.path[0]) : 'form',
          message: issue.message,
        })),
      },
      { status: 400, headers: PRIVATE_NO_STORE },
    );
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Onboarding password setup is missing its server credential.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
    });
    return NextResponse.json(
      { error: 'Account setup is not configured on the server yet.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  try {
    const rateLimit = await consumeServerRateLimit(
      adminClient,
      `onboarding-password:${profile.id}`,
      6,
      600,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many password update attempts. Please wait and try again.' },
        {
          status: 429,
          headers: {
            ...PRIVATE_NO_STORE,
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const supabase = await createClient();
    const { error: passwordError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
      current_password: parsed.data.currentPassword,
    });

    if (passwordError) {
      const { error: auditError } = await adminClient.rpc('record_onboarding_password_replacement_denied', {
        p_user_id: profile.id,
        p_request_id: auditContext.requestId,
        p_client_ip: auditContext.clientIp,
        p_user_agent: auditContext.userAgent,
      });
      if (auditError) {
        console.error('Failed to record a denied onboarding password replacement.', {
          code: auditError.code,
          userId: profile.id,
        });
      }
      console.warn('Supabase rejected an onboarding password replacement.', {
        code: passwordError.code,
        status: passwordError.status,
        userId: profile.id,
      });
      return NextResponse.json(
        { error: 'The temporary password could not be replaced. Check it and choose a different new password.' },
        { status: 400, headers: PRIVATE_NO_STORE },
      );
    }

    let transition = await adminClient.rpc('advance_admin_managed_onboarding_password', {
      p_user_id: profile.id,
      p_request_id: auditContext.requestId,
      p_client_ip: auditContext.clientIp,
      p_user_agent: auditContext.userAgent,
    });

    // The password write and profile transition live in separate Supabase
    // services. Retry the idempotent database transition once so a brief
    // PostgREST/database hiccup does not strand an otherwise valid account.
    if (transition.error) {
      transition = await adminClient.rpc('advance_admin_managed_onboarding_password', {
        p_user_id: profile.id,
        p_request_id: auditContext.requestId,
        p_client_ip: auditContext.clientIp,
        p_user_agent: auditContext.userAgent,
      });
    }

    if (transition.error) {
      console.error('Password changed but onboarding stage could not advance.', {
        code: transition.error.code,
        userId: profile.id,
      });
      return NextResponse.json(
        {
          error:
            'Your password was changed, but setup could not continue. Sign in again with your new password and retry this step.',
        },
        { status: 500, headers: PRIVATE_NO_STORE },
      );
    }

    return NextResponse.json(
      { onboardingStage: 'profile_required' },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error('Unexpected onboarding password failure.', {
      message: error instanceof Error ? error.message : 'Unknown error',
      userId: profile.id,
    });
    return NextResponse.json(
      { error: 'The password could not be updated right now.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
