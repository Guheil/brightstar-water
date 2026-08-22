import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { verifyPasswordForEmail } from '@/lib/auth/passwordVerification';
import {
  deleteManagedAccountSchema,
  managedAccountIdSchema,
  updateManagedProfileSchema,
} from '@/lib/admin/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getManagedProfile } from '@/lib/admin/server';
import { consumeAdminRateLimit } from '@/lib/security/rateLimit';
import {
  hasJsonContentType,
  isRequestBodyWithinLimit,
  isSameOriginMutation,
  readLimitedJson,
} from '@/lib/security/request';
import type { ProfileStatus, SupabaseProfile } from '@/lib/auth/types';
import type { UserRole } from '@/types';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

interface AccountRouteContext {
  params: Promise<{ id: string }>;
}

interface DeletionReservation {
  previous_status: ProfileStatus;
  target_email: string;
  target_name: string;
  target_role: UserRole;
  target_user_id: string;
}

async function getAuthorizedAdmin() {
  const actor = await getAuthenticatedProfile();
  if (
    !actor ||
    actor.role !== 'admin' ||
    actor.status !== 'active' ||
    actor.onboarding_stage !== 'complete'
  ) {
    return null;
  }
  return actor;
}

function parseAccountId(id: string) {
  return managedAccountIdSchema.safeParse(id);
}

function reservationErrorResponse(message: string | undefined) {
  if (message?.includes('Account not found')) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
  }
  if (message?.includes('only be deleted by their owner')) {
    return NextResponse.json(
      { error: 'Administrator accounts can only be deleted by their own account owner.' },
      { status: 403, headers: PRIVATE_NO_STORE },
    );
  }
  if (message?.includes('last active Administrator')) {
    return NextResponse.json(
      { error: 'Create or activate another Administrator before deleting this account.' },
      { status: 409, headers: PRIVATE_NO_STORE },
    );
  }
  if (message?.includes('deletion is already in progress')) {
    return NextResponse.json(
      { error: 'This account is already being deleted. Refresh the page and try again.' },
      { status: 409, headers: PRIVATE_NO_STORE },
    );
  }
  return NextResponse.json(
    { error: 'The account could not be prepared for deletion.' },
    { status: 500, headers: PRIVATE_NO_STORE },
  );
}

export async function PATCH(request: NextRequest, context: AccountRouteContext) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json({ error: 'JSON content is required.' }, { status: 415, headers: PRIVATE_NO_STORE });
  }
  if (!isRequestBodyWithinLimit(request)) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413, headers: PRIVATE_NO_STORE });
  }

  const actor = await getAuthorizedAdmin();
  if (!actor) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const { id } = await context.params;
  const parsedId = parseAccountId(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
  }

  const auditContext = getAuditRequestContext(request);

  const body = await readLimitedJson(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' },
      { status: body.reason === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE },
    );
  }

  const parsed = updateManagedProfileSchema.safeParse(body.value);
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
    console.error('Admin account management is not configured.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
    });
    return NextResponse.json(
      { error: 'Account management is not configured on the server yet.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  try {
    const rateLimit = await consumeAdminRateLimit(
      adminClient,
      `admin-account-update:${actor.id}`,
      60,
      600,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many account updates. Please try again shortly.' },
        {
          status: 429,
          headers: {
            ...PRIVATE_NO_STORE,
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const { fullName, phone, status } = parsed.data;
    const { data, error } = await adminClient.rpc('admin_update_managed_profile', {
      p_actor_id: actor.id,
      p_full_name: fullName,
      p_phone: phone,
      p_status: status,
      p_target_id: parsedId.data,
      p_request_id: auditContext.requestId,
      p_client_ip: auditContext.clientIp,
      p_user_agent: auditContext.userAgent,
    });

    const profile = Array.isArray(data) ? data[0] : data;
    if (error || !profile) {
      const message = error?.message ?? '';
      const notFound = message.includes('Account not found');
      const adminEditBlocked = message.includes('Administrator accounts cannot be edited here');
      const deletionInProgress = message.includes('deletion is already in progress');

      console.error('Admin managed-account update failed.', {
        accountId: parsedId.data,
        code: error?.code,
      });

      return NextResponse.json(
        {
          error: notFound
            ? 'Account not found.'
            : adminEditBlocked
              ? 'Administrator accounts cannot be edited from the shared Accounts workspace.'
              : deletionInProgress
                ? 'This account is currently being deleted.'
                : 'The account could not be updated.',
        },
        {
          status: notFound ? 404 : adminEditBlocked ? 403 : deletionInProgress ? 409 : 500,
          headers: PRIVATE_NO_STORE,
        },
      );
    }

    return NextResponse.json(
      { account: profile as SupabaseProfile },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error('Unexpected Admin managed-account update failure.', {
      accountId: parsedId.data,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'The account could not be updated.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}

export async function DELETE(request: NextRequest, context: AccountRouteContext) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json({ error: 'JSON content is required.' }, { status: 415, headers: PRIVATE_NO_STORE });
  }
  if (!isRequestBodyWithinLimit(request)) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413, headers: PRIVATE_NO_STORE });
  }

  const actor = await getAuthorizedAdmin();
  if (!actor) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const { id } = await context.params;
  const parsedId = parseAccountId(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
  }

  const auditContext = getAuditRequestContext(request);

  const body = await readLimitedJson(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' },
      { status: body.reason === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE },
    );
  }

  const parsed = deleteManagedAccountSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Check the deletion confirmation and try again.' },
      { status: 400, headers: PRIVATE_NO_STORE },
    );
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Admin account deletion is not configured.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
    });
    return NextResponse.json(
      { error: 'Account deletion is not configured on the server yet.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  try {
    const rateLimit = await consumeAdminRateLimit(
      adminClient,
      `admin-account-delete:${actor.id}`,
      5,
      600,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many deletion attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            ...PRIVATE_NO_STORE,
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const recordDeletionDenied = async (reasonCode: string) => {
      const { error } = await adminClient.rpc('record_admin_account_deletion_denied', {
        p_actor_id: actor.id,
        p_target_id: parsedId.data,
        p_request_id: auditContext.requestId,
        p_reason_code: reasonCode,
        p_client_ip: auditContext.clientIp,
        p_user_agent: auditContext.userAgent,
      });
      if (error) {
        console.error('Failed to record a denied account deletion attempt.', {
          accountId: parsedId.data,
          code: error.code,
          reasonCode,
        });
      }
    };

    const recordDeletionFailed = async (reasonCode: string) => {
      const { error } = await adminClient.rpc('record_admin_account_deletion_failed', {
        p_actor_id: actor.id,
        p_target_id: parsedId.data,
        p_request_id: auditContext.requestId,
        p_reason_code: reasonCode,
        p_client_ip: auditContext.clientIp,
        p_user_agent: auditContext.userAgent,
      });
      if (error) {
        console.error('Failed to record an unsuccessful account deletion.', {
          accountId: parsedId.data,
          code: error.code,
          reasonCode,
        });
      }
    };

    const passwordVerified = await verifyPasswordForEmail(actor.email, parsed.data.currentPassword);
    if (!passwordVerified) {
      await recordDeletionDenied('password_verification_failed');
      return NextResponse.json(
        { error: 'Your current administrator password is incorrect.' },
        { status: 403, headers: PRIVATE_NO_STORE },
      );
    }

    let targetProfile: SupabaseProfile | null;
    try {
      targetProfile = await getManagedProfile(parsedId.data);
    } catch (error) {
      console.error('Admin account deletion target lookup failed.', {
        accountId: parsedId.data,
        message: error instanceof Error ? error.message : 'Unknown profile lookup error',
      });
      return NextResponse.json(
        { error: 'The account could not be verified for deletion.' },
        { status: 500, headers: PRIVATE_NO_STORE },
      );
    }

    if (!targetProfile) {
      await recordDeletionDenied('account_not_found');
      return NextResponse.json(
        { error: 'Account not found.' },
        { status: 404, headers: PRIVATE_NO_STORE },
      );
    }

    if (targetProfile.role === 'admin' && targetProfile.id !== actor.id) {
      await recordDeletionDenied('administrator_self_only');
      return NextResponse.json(
        { error: 'Administrator accounts can only be deleted by their own account owner.' },
        { status: 403, headers: PRIVATE_NO_STORE },
      );
    }

    if (targetProfile.role === 'admin') {
      const confirmation = parsed.data.confirmationEmail?.trim().toLowerCase();
      if (confirmation !== actor.email.toLowerCase()) {
        await recordDeletionDenied('confirmation_mismatch');
        return NextResponse.json(
          { error: 'Type your administrator email exactly to confirm account deletion.' },
          { status: 400, headers: PRIVATE_NO_STORE },
        );
      }
    }

    const { data: reservationData, error: reservationError } = await adminClient.rpc(
      'reserve_admin_account_deletion',
      {
        p_actor_id: actor.id,
        p_target_id: parsedId.data,
        p_request_id: auditContext.requestId,
        p_client_ip: auditContext.clientIp,
        p_user_agent: auditContext.userAgent,
      },
    );

    const reservation = (Array.isArray(reservationData)
      ? reservationData[0]
      : reservationData) as DeletionReservation | null;

    if (reservationError || !reservation) {
      console.error('Admin account deletion reservation failed.', {
        accountId: parsedId.data,
        code: reservationError?.code,
      });

      const reservationMessage = reservationError?.message ?? '';
      if (reservationMessage.includes('last active Administrator')) {
        await recordDeletionDenied('last_active_admin');
      } else if (reservationMessage.includes('only be deleted by their owner')) {
        await recordDeletionDenied('administrator_self_only');
      } else if (reservationMessage.includes('deletion is already in progress')) {
        await recordDeletionDenied('deletion_in_progress');
      } else if (reservationMessage.includes('Account not found')) {
        await recordDeletionDenied('account_not_found');
      } else {
        await recordDeletionFailed('reservation_failed');
      }

      return reservationErrorResponse(reservationError?.message);
    }

    const restoreReservation = async () => {
      const { error: restoreError } = await adminClient.rpc('restore_admin_account_deletion', {
        p_actor_id: actor.id,
        p_previous_status: reservation.previous_status,
        p_target_id: reservation.target_user_id,
        p_request_id: auditContext.requestId,
        p_client_ip: auditContext.clientIp,
        p_user_agent: auditContext.userAgent,
      });
      if (restoreError) {
        console.error('Failed to restore an account after deletion was interrupted.', {
          accountId: reservation.target_user_id,
          code: restoreError.code,
        });
      }
    };

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      reservation.target_user_id,
      false,
    );

    if (deleteError) {
      await restoreReservation();
      console.error('Supabase Auth rejected an account deletion request.', {
        accountId: reservation.target_user_id,
        status: deleteError.status,
      });

      const normalizedMessage = deleteError.message.toLowerCase();
      const retainedFiles =
        normalizedMessage.includes('storage') ||
        normalizedMessage.includes('object') ||
        normalizedMessage.includes('owner');

      await recordDeletionFailed(retainedFiles ? 'retained_files' : 'auth_rejected');

      return NextResponse.json(
        {
          error: retainedFiles
            ? 'This account still owns retained files. Reassign or remove those files before deleting the account.'
            : 'The account could not be deleted. Its previous account state was restored.',
        },
        { status: retainedFiles ? 409 : 500, headers: PRIVATE_NO_STORE },
      );
    }

    const finalAuditPayload = {
      p_actor_id: actor.id,
      p_actor_name: actor.full_name,
      p_target_email: reservation.target_email,
      p_target_id: reservation.target_user_id,
      p_target_name: reservation.target_name,
      p_target_role: reservation.target_role,
      p_request_id: auditContext.requestId,
      p_client_ip: auditContext.clientIp,
      p_user_agent: auditContext.userAgent,
    };

    let finalAudit = await adminClient.rpc('record_admin_account_deleted', finalAuditPayload);
    if (finalAudit.error) {
      finalAudit = await adminClient.rpc('record_admin_account_deleted', finalAuditPayload);
    }

    if (finalAudit.error) {
      console.error('Account deletion succeeded but final audit recording failed after retry.', {
        accountId: reservation.target_user_id,
        code: finalAudit.error.code,
        requestId: auditContext.requestId,
      });
    }

    return NextResponse.json(
      {
        deleted: true,
        selfDeleted: reservation.target_user_id === actor.id,
      },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error('Unexpected Admin account deletion failure.', {
      accountId: parsedId.data,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'The account could not be deleted.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
