import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import {
  managedAccountIdSchema,
  updateManagedProfileSchema,
} from '@/lib/admin/validation';
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

interface CustomerRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: CustomerRouteContext) {
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

  const { id } = await context.params;
  const parsedId = managedAccountIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Customer not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
  }

  const body = await readLimitedJson(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' },
      { status: body.reason === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE },
    );
  }

  const json = body.value;

  const parsed = updateManagedProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Check the customer details and try again.',
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
    console.error('Admin customer management is not configured.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
    });
    return NextResponse.json(
      { error: 'Customer management is not configured on the server yet.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  try {
    const rateLimit = await consumeAdminRateLimit(
      adminClient,
      `admin-customer-update:${actor.id}`,
      60,
      600,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many customer updates. Please try again shortly.' },
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
    const { data, error } = await adminClient.rpc('admin_update_customer_profile', {
      p_actor_id: actor.id,
      p_customer_id: parsedId.data,
      p_full_name: fullName,
      p_phone: phone,
      p_status: status,
    });

    const profile = Array.isArray(data) ? data[0] : data;
    if (error || !profile) {
      const notFound = error?.message?.includes('Customer not found');
      console.error('Admin customer update failed.', {
        customerId: parsedId.data,
        code: error?.code,
      });
      return NextResponse.json(
        { error: notFound ? 'Customer not found.' : 'The customer could not be updated.' },
        { status: notFound ? 404 : 500, headers: PRIVATE_NO_STORE },
      );
    }

    return NextResponse.json(
      { customer: profile as SupabaseProfile },
      { status: 200, headers: PRIVATE_NO_STORE },
    );
  } catch (error) {
    console.error('Unexpected Admin customer update failure.', {
      customerId: parsedId.data,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'The customer could not be updated.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
