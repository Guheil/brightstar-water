import 'server-only';

import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { consumeServerRateLimit } from '@/lib/security/rateLimit';
import { createAdminClient } from '@/lib/supabase/admin';

export const ADDRESS_PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' } as const;

export async function getAddressApiContext(rateKey: string, limit: number, windowSeconds: number) {
  const actor = await getAuthenticatedProfile();
  if (!actor || actor.role !== 'customer' || actor.status !== 'active' || actor.onboarding_stage !== 'complete') {
    return { response: NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: ADDRESS_PRIVATE_HEADERS }) } as const;
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return { response: NextResponse.json({ error: 'Saved addresses are not configured.' }, { status: 503, headers: ADDRESS_PRIVATE_HEADERS }) } as const;
  }

  try {
    const rate = await consumeServerRateLimit(adminClient, `${rateKey}:${actor.id}`, limit, windowSeconds);
    if (!rate.allowed) {
      return {
        response: NextResponse.json(
          { error: 'Too many address requests. Please try again shortly.' },
          { status: 429, headers: { ...ADDRESS_PRIVATE_HEADERS, 'Retry-After': String(rate.retryAfterSeconds) } },
        ),
      } as const;
    }
  } catch {
    return { response: NextResponse.json({ error: 'The request could not be completed.' }, { status: 503, headers: ADDRESS_PRIVATE_HEADERS }) } as const;
  }

  return { actor, adminClient } as const;
}

export function addressRpcErrorResponse(error: { code?: string; message?: string } | null | undefined) {
  const message = error?.message ?? '';
  if (/outside the service area/i.test(message)) {
    return NextResponse.json({ error: 'That pin is outside the current delivery area.' }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });
  }
  if (/address limit reached/i.test(message)) {
    return NextResponse.json({ error: 'You can save up to 10 delivery addresses.' }, { status: 409, headers: ADDRESS_PRIVATE_HEADERS });
  }
  if (/address not found/i.test(message)) {
    return NextResponse.json({ error: 'That saved address could not be found.' }, { status: 404, headers: ADDRESS_PRIVATE_HEADERS });
  }
  if (/invalid|custom label|required/i.test(message)) {
    return NextResponse.json({ error: 'Check the address details and try again.' }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });
  }
  return NextResponse.json({ error: 'The saved address could not be updated.' }, { status: 500, headers: ADDRESS_PRIVATE_HEADERS });
}

export function requireJsonMutation(request: NextRequest) {
  const type = request.headers.get('content-type')?.toLowerCase() ?? '';
  if (!type.startsWith('application/json')) {
    return NextResponse.json({ error: 'JSON content is required.' }, { status: 415, headers: ADDRESS_PRIVATE_HEADERS });
  }
  const rawLength = request.headers.get('content-length');
  if (rawLength && Number(rawLength) > 16 * 1024) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413, headers: ADDRESS_PRIVATE_HEADERS });
  }
  return null;
}
