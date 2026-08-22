import { NextResponse, type NextRequest } from 'next/server';
import { getAdminAuditEvent } from '@/lib/audit/server';
import { auditEventIdSchema } from '@/lib/audit/validation';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { consumeAdminRateLimit } from '@/lib/security/rateLimit';
import { createAdminClient } from '@/lib/supabase/admin';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

interface ActivityHistoryRouteContext {
  params: Promise<{ eventId: string }>;
}

export async function GET(_request: NextRequest, context: ActivityHistoryRouteContext) {
  const actor = await getAuthenticatedProfile();
  if (
    !actor ||
    actor.role !== 'admin' ||
    actor.status !== 'active' ||
    actor.onboarding_stage !== 'complete'
  ) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const { eventId } = await context.params;
  const parsedId = auditEventIdSchema.safeParse(eventId);
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Activity not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Activity History details are missing their server credential.', {
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
      `admin-activity-history-detail:${actor.id}`,
      180,
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

    const event = await getAdminAuditEvent(adminClient, parsedId.data);
    if (!event) {
      return NextResponse.json({ error: 'Activity not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
    }

    return NextResponse.json({ event }, { status: 200, headers: PRIVATE_NO_STORE });
  } catch (error) {
    console.error('Activity History detail request failed.', {
      adminId: actor.id,
      eventId: parsedId.data,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'This activity could not be loaded.' },
      { status: 500, headers: PRIVATE_NO_STORE },
    );
  }
}
