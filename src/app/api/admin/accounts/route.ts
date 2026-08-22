import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { createManagedAccountSchema } from '@/lib/admin/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { consumeAdminRateLimit } from '@/lib/security/rateLimit';
import {
  hasJsonContentType,
  isRequestBodyWithinLimit,
  isSameOriginMutation,
  readLimitedJson,
} from '@/lib/security/request';
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

  const actor = await getAuthenticatedProfile();
  if (!actor || actor.role !== 'admin' || actor.status !== 'active' || actor.onboarding_stage !== 'complete') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const auditContext = getAuditRequestContext(request);

  const body = await readLimitedJson(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' },
      { status: body.reason === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE },
    );
  }

  const json = body.value;

  const parsed = createManagedAccountSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Check the account details and try again.',
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
    console.error('Admin account creation is not configured.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
    });
    return NextResponse.json(
      { error: 'Account creation is not configured on the server yet.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  try {
    const rateLimit = await consumeAdminRateLimit(
      adminClient,
      `admin-account-create:${actor.id}`,
      10,
      600,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many account creation attempts. Please try again shortly.' },
        {
          status: 429,
          headers: {
            ...PRIVATE_NO_STORE,
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const { email, fullName, password, phone, role } = parsed.data;

    const recordCreationFailure = async (
      reasonCode: 'auth_rejected' | 'profile_provision_failed' | 'cleanup_failed',
      targetId: string | null,
    ) => {
      const { error } = await adminClient.rpc('record_admin_account_creation_failed', {
        p_actor_id: actor.id,
        p_target_id: targetId,
        p_target_email: email,
        p_target_name: fullName,
        p_target_role: role,
        p_request_id: auditContext.requestId,
        p_reason_code: reasonCode,
        p_client_ip: auditContext.clientIp,
        p_user_agent: auditContext.userAgent,
      });
      if (error) {
        console.error('Failed to record an unsuccessful account creation.', {
          code: error.code,
          reasonCode,
          requestId: auditContext.requestId,
        });
      }
    };

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      await recordCreationFailure('auth_rejected', null);
      console.error('Supabase Auth rejected an Admin account creation request.', {
        code: authError?.code,
        status: authError?.status,
      });
      return NextResponse.json(
        {
          error:
            authError?.status === 422
              ? 'That email is already in use or cannot be created.'
              : 'The account could not be created.',
        },
        { status: authError?.status === 422 ? 409 : 500, headers: PRIVATE_NO_STORE },
      );
    }

    const createdUserId = authData.user.id;
    const { data: profileData, error: profileError } = await adminClient.rpc(
      'provision_admin_managed_profile',
      {
        p_actor_id: actor.id,
        p_email: email,
        p_full_name: fullName,
        p_phone: phone,
        p_role: role,
        p_user_id: createdUserId,
        p_request_id: auditContext.requestId,
        p_client_ip: auditContext.clientIp,
        p_user_agent: auditContext.userAgent,
      },
    );

    const profile = Array.isArray(profileData) ? profileData[0] : profileData;
    if (profileError || !profile) {
      const cleanup = await adminClient.auth.admin.deleteUser(createdUserId);
      await recordCreationFailure(cleanup.error ? 'cleanup_failed' : 'profile_provision_failed', createdUserId);
      if (cleanup.error) {
        console.error('Failed to clean up an orphaned Auth user after profile provisioning failed.', {
          userId: createdUserId,
          cleanupStatus: cleanup.error.status,
        });
      }
      console.error('Profile provisioning failed after Supabase Auth user creation.', {
        userId: createdUserId,
        code: profileError?.code,
      });
      return NextResponse.json(
        { error: 'The account could not be completed. No usable account was created.' },
        { status: 500, headers: PRIVATE_NO_STORE },
      );
    }

    return NextResponse.json(
      { account: profile as SupabaseProfile },
      { status: 201, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error('Unexpected Admin account creation failure.', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'The account could not be created.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
