import { NextResponse, type NextRequest } from 'next/server';
import { listAdminAuditEvents } from '@/lib/audit/server';
import { auditListQuerySchema, readAuditQuery } from '@/lib/audit/validation';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { consumeAdminRateLimit } from '@/lib/security/rateLimit';
import { createAdminClient } from '@/lib/supabase/admin';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

export async function GET(request: NextRequest) {
  const actor = await getAuthenticatedProfile();
  if (
    !actor ||
    actor.role !== 'admin' ||
    actor.status !== 'active' ||
    actor.onboarding_stage !== 'complete'
  ) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const rawQuery = readAuditQuery(request.nextUrl.searchParams);
  if (!rawQuery) {
    return NextResponse.json({ error: 'Invalid activity-history filters.' }, { status: 400, headers: PRIVATE_NO_STORE });
  }

  const parsed = auditListQuerySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid activity-history filters.' },
      { status: 400, headers: PRIVATE_NO_STORE },
    );
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Activity History is missing its server credential.', {
      message: error instanceof Error ? error.message : 'Unknown configuration error',
    });
    return NextResponse.json(
      { error: 'Activity History is not configured on the server yet.' },
      { status: 503, headers: PRIVATE_NO_STORE },
    );
  }

  try {
    const rateLimit = await consumeAdminRateLimit(
      adminClient,
      `admin-activity-history-list:${actor.id}`,
      120,
      600,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many history requests. Please try again shortly.' },
        {
          status: 429,
          headers: {
            ...PRIVATE_NO_STORE,
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        },
      );
    }

    const result = await listAdminAuditEvents(adminClient, {
      actorId: parsed.data.actorId,
      category: parsed.data.category,
      cursor: parsed.data.cursor,
      from: parsed.data.from,
      limit: parsed.data.limit,
      query: parsed.data.q,
      result: parsed.data.result,
      to: parsed.data.to,
    });

    return NextResponse.json(result, { status: 200, headers: PRIVATE_NO_STORE });
  } catch (error) {
    console.error('Activity History list request failed.', {
      adminId: actor.id,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Activity History could not be loaded.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
