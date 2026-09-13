import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { profileCanAccessApplication } from '@/lib/auth/types';
import { customerProfileUpdateSchema } from '@/lib/profile/validation';
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

export async function PATCH(request: NextRequest) {
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
  if (!actor || !profileCanAccessApplication(actor)) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401, headers: PRIVATE_NO_STORE });
  }
  if (actor.role !== 'customer') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const body = await readLimitedJson(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' },
      { status: body.reason === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE },
    );
  }

  const parsed = customerProfileUpdateSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? 'Check your profile details and try again.',
        issues: parsed.error.issues.map((issue) => ({
          field: String(issue.path[0] ?? 'form'),
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
    console.error('Customer profile update rate limiting is not configured.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
      userId: actor.id,
    });
    return NextResponse.json(
      { error: 'Profile updates are not configured on the server yet.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  try {
    const rateLimit = await consumeServerRateLimit(
      adminClient,
      `customer-profile-update:${actor.id}`,
      20,
      600,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many profile update attempts. Please wait and try again.' },
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
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
      })
      .eq('id', actor.id)
      .select('id,email,full_name,phone,updated_at')
      .single();

    if (error || !data) {
      console.error('Customer profile update failed.', {
        code: error?.code,
        userId: actor.id,
      });
      return NextResponse.json(
        { error: 'Your profile could not be updated right now.' },
        { status: 500, headers: PRIVATE_NO_STORE },
      );
    }

    return NextResponse.json(
      {
        profile: {
          id: data.id,
          displayName: data.full_name,
          email: data.email,
          phone: data.phone,
          updatedAt: data.updated_at,
        },
      },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error('Unexpected customer profile update failure.', {
      message: error instanceof Error ? error.message : 'Unknown error',
      userId: actor.id,
    });
    return NextResponse.json(
      { error: 'Your profile could not be updated right now.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
