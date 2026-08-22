import 'server-only';

import { NextResponse, type NextRequest } from 'next/server';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { consumeServerRateLimit } from '@/lib/security/rateLimit';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types';

export const OPERATIONS_PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store' } as const;

export async function getOperationsApiContext(rateKey: string, limit: number, windowSeconds: number, role?: UserRole) {
  const actor = await getAuthenticatedProfile();
  if (!actor || actor.status !== 'active' || actor.onboarding_stage !== 'complete' || (role && actor.role !== role)) {
    return { response: NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: OPERATIONS_PRIVATE_HEADERS }) } as const;
  }
  let adminClient;
  let profileClient;
  try {
    adminClient = createAdminClient();
    profileClient = await createClient();
  }
  catch { return { response: NextResponse.json({ error: 'Order services are not configured.' }, { status: 503, headers: OPERATIONS_PRIVATE_HEADERS }) } as const; }
  try {
    const rate = await consumeServerRateLimit(adminClient, `${rateKey}:${actor.id}`, limit, windowSeconds);
    if (!rate.allowed) return { response: NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429, headers: { ...OPERATIONS_PRIVATE_HEADERS, 'Retry-After': String(rate.retryAfterSeconds) } }) } as const;
  } catch {
    return { response: NextResponse.json({ error: 'The request could not be completed.' }, { status: 503, headers: OPERATIONS_PRIVATE_HEADERS }) } as const;
  }
  return { actor, adminClient, profileClient } as const;
}

export function operationsRpcError(error: { message?: string; code?: string } | null | undefined) {
  const message = error?.message ?? '';
  if (/not found/i.test(message)) return NextResponse.json({ error: 'The requested record could not be found.' }, { status: 404, headers: OPERATIONS_PRIVATE_HEADERS });
  if (/not authorized/i.test(message)) return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: OPERATIONS_PRIVATE_HEADERS });
  if (/insufficient stock/i.test(message)) return NextResponse.json({ error: 'One or more products no longer have enough available stock.' }, { status: 409, headers: OPERATIONS_PRIVATE_HEADERS });
  if (/outside the service area/i.test(message)) return NextResponse.json({ error: 'That delivery address is outside the current service area.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  if (/invalid|cannot|already|required|unavailable|ready/i.test(message)) return NextResponse.json({ error: message.slice(0, 180) || 'The operation is not allowed.' }, { status: 409, headers: OPERATIONS_PRIVATE_HEADERS });
  return NextResponse.json({ error: 'The operation could not be completed.' }, { status: 500, headers: OPERATIONS_PRIVATE_HEADERS });
}

export function hasMultipart(request: NextRequest) {
  return (request.headers.get('content-type') ?? '').toLowerCase().startsWith('multipart/form-data;');
}
