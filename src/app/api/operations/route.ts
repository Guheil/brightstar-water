import { NextResponse } from 'next/server';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS } from '@/lib/orders/apiServer';
import { loadOperationalSnapshot } from '@/lib/orders/server';

export async function GET() {
  const context = await getOperationsApiContext('operations-read', 180, 60);
  if ('response' in context) return context.response;
  try {
    const snapshot = await loadOperationalSnapshot(context.adminClient, context.profileClient, context.actor);
    return NextResponse.json(snapshot, { headers: OPERATIONS_PRIVATE_HEADERS });
  } catch (error) {
    console.error('Operational snapshot failed.', { role: context.actor.role, code: (error as { code?: string })?.code });
    return NextResponse.json({ error: 'Orders and deliveries could not be loaded.' }, { status: 500, headers: OPERATIONS_PRIVATE_HEADERS });
  }
}
