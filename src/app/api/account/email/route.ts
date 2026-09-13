import { NextResponse, type NextRequest } from 'next/server';
import { accountEmailChangeSchema } from '@/lib/auth/accountSecurityValidation';
import { verifyPasswordForEmail } from '@/lib/auth/passwordVerification';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { profileCanAccessApplication } from '@/lib/auth/types';
import { consumeServerRateLimit } from '@/lib/security/rateLimit';
import {
  hasJsonContentType,
  isRequestBodyWithinLimit,
  isSameOriginMutation,
  readLimitedJson,
} from '@/lib/security/request';
import { createAdminClient } from '@/lib/supabase/admin';

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
  if (!profile || !profileCanAccessApplication(profile)) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401, headers: PRIVATE_NO_STORE });
  }

  const body = await readLimitedJson(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' },
      { status: body.reason === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE },
    );
  }

  const parsed = accountEmailChangeSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Check the login email and password details and try again.',
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path[0] ? String(issue.path[0]) : 'form',
          message: issue.message,
        })),
      },
      { status: 400, headers: PRIVATE_NO_STORE },
    );
  }

  if (parsed.data.newEmail === profile.email.toLowerCase()) {
    return NextResponse.json(
      { error: 'Enter a different login email.' },
      { status: 400, headers: PRIVATE_NO_STORE },
    );
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Account login-email change is missing its server credential.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
      userId: profile.id,
    });
    return NextResponse.json(
      { error: 'Account security is not configured on the server yet.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  try {
    const rateLimit = await consumeServerRateLimit(
      adminClient,
      `account-email-change:${profile.id}`,
      5,
      600,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login-email change attempts. Please wait and try again.' },
        {
          status: 429,
          headers: {
            ...PRIVATE_NO_STORE,
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const passwordVerified = await verifyPasswordForEmail(
      profile.email,
      parsed.data.currentPassword,
    );

    if (!passwordVerified) {
      return NextResponse.json(
        { error: 'The current password is incorrect.' },
        { status: 400, headers: PRIVATE_NO_STORE },
      );
    }

    // Email-shaped login identifiers may not have a reachable inbox. The admin
    // method is therefore used only after the
    // signed-in user's current password has been re-verified. The secret key
    // never leaves this server route.
    const { data, error: updateError } = await adminClient.auth.admin.updateUserById(profile.id, {
      email: parsed.data.newEmail,
      email_confirm: true,
    });

    if (updateError || !data.user) {
      console.warn('Supabase rejected an account login-email change.', {
        code: updateError?.code,
        status: updateError?.status,
        userId: profile.id,
      });

      const duplicateEmail = /already|registered|exists|duplicate/i.test(updateError?.message ?? '');
      return NextResponse.json(
        {
          error: duplicateEmail
            ? 'That login email is already in use.'
            : 'The login email could not be changed. Check the address and try again.',
        },
        { status: duplicateEmail ? 409 : 400, headers: PRIVATE_NO_STORE },
      );
    }

    return NextResponse.json(
      {
        changed: true,
        newEmail: parsed.data.newEmail,
        message: 'Login email changed. Sign in again using the new login email.',
      },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error('Unexpected account login-email change failure.', {
      message: error instanceof Error ? error.message : 'Unknown error',
      userId: profile.id,
    });
    return NextResponse.json(
      { error: 'The login email could not be changed right now.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
