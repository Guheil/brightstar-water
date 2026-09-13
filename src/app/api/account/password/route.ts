import { NextResponse, type NextRequest } from 'next/server';
import { accountPasswordChangeSchema } from '@/lib/auth/accountSecurityValidation';
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

  const parsed = accountPasswordChangeSchema.safeParse(body.value);
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
    console.error('Account password change is missing its server credential.', {
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
      `account-password-change:${profile.id}`,
      6,
      600,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many password change attempts. Please wait and try again.' },
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
    const { error: updateError } = await supabase.auth.updateUser({
      current_password: parsed.data.currentPassword,
      password: parsed.data.newPassword,
    });

    if (updateError) {
      console.warn('Supabase rejected an account password change.', {
        code: updateError.code,
        status: updateError.status,
        userId: profile.id,
      });
      return NextResponse.json(
        {
          error:
            'The password could not be changed. Check your current password and new password requirements.',
        },
        { status: 400, headers: PRIVATE_NO_STORE },
      );
    }

    return NextResponse.json(
      { changed: true, message: 'Your password has been changed.' },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error('Unexpected account password change failure.', {
      message: error instanceof Error ? error.message : 'Unknown error',
      userId: profile.id,
    });
    return NextResponse.json(
      { error: 'The password could not be changed right now.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
