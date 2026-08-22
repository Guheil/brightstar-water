import { NextResponse, type NextRequest } from 'next/server';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/config';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { onboardingProfileSchema } from '@/lib/auth/onboardingValidation';
import { consumeServerRateLimit } from '@/lib/security/rateLimit';
import {
  hasJsonContentType,
  isRequestBodyWithinLimit,
  isSameOriginMutation,
  readLimitedJson,
} from '@/lib/security/request';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseProfile } from '@/lib/auth/types';

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

  if (profile.account_origin !== 'admin_managed' || profile.onboarding_stage !== 'profile_required') {
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

  const parsed = onboardingProfileSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Check your account details and try again.',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path[0] ? String(issue.path[0]) : 'form',
          message: issue.message,
        })),
      },
      { status: 400, headers: PRIVATE_NO_STORE },
    );
  }

  if (profile.role === 'customer') {
    if (!/^09\d{9}$/.test(parsed.data.phone)) {
      return NextResponse.json(
        {
          error: 'A valid contact number is required before a Customer account can be activated.',
          issues: [{ field: 'phone', message: 'Use a Philippine mobile number in 09XXXXXXXXX format.' }],
        },
        { status: 400, headers: PRIVATE_NO_STORE },
      );
    }

    if (
      parsed.data.termsVersion !== TERMS_VERSION ||
      parsed.data.privacyVersion !== PRIVACY_VERSION
    ) {
      return NextResponse.json(
        { error: 'Review the current Terms of Use and Privacy Policy before continuing.' },
        { status: 400, headers: PRIVATE_NO_STORE },
      );
    }
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Onboarding profile setup is missing its server credential.', {
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
      `onboarding-profile:${profile.id}`,
      12,
      600,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many setup attempts. Please wait and try again.' },
        {
          status: 429,
          headers: {
            ...PRIVATE_NO_STORE,
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const { data, error } = await adminClient.rpc('complete_admin_managed_onboarding', {
      p_user_id: profile.id,
      p_full_name: parsed.data.fullName,
      p_phone: parsed.data.phone,
      p_terms_version: profile.role === 'customer' ? TERMS_VERSION : null,
      p_privacy_version: profile.role === 'customer' ? PRIVACY_VERSION : null,
      p_request_id: auditContext.requestId,
      p_client_ip: auditContext.clientIp,
      p_user_agent: auditContext.userAgent,
    });

    const completedProfile = Array.isArray(data) ? data[0] : data;
    if (error || !completedProfile) {
      console.error('Onboarding profile completion failed.', {
        code: error?.code,
        userId: profile.id,
      });
      return NextResponse.json(
        { error: 'Your account details could not be saved right now.' },
        { status: 500, headers: PRIVATE_NO_STORE },
      );
    }

    return NextResponse.json(
      { profile: completedProfile as SupabaseProfile },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error('Unexpected onboarding profile failure.', {
      message: error instanceof Error ? error.message : 'Unknown error',
      userId: profile.id,
    });
    return NextResponse.json(
      { error: 'Your account setup could not be completed right now.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
