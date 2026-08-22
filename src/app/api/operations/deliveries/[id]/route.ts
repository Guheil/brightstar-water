import { NextResponse, type NextRequest } from 'next/server';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS } from '@/lib/orders/apiServer';
import { loadOperationalDeliveryDetail } from '@/lib/orders/server';
import { entityUuidSchema } from '@/lib/orders/validation';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = entityUuidSchema.safeParse((await params).id);
  if (!id.success) return NextResponse.json({ error: 'Delivery not found.' }, { status: 404, headers: OPERATIONS_PRIVATE_HEADERS });
  const context = await getOperationsApiContext('operations-delivery-detail', 120, 60);
  if ('response' in context) return context.response;

  try {
    const snapshot = await loadOperationalDeliveryDetail(context.adminClient, context.profileClient, context.actor, id.data);
    if (!snapshot) return NextResponse.json({ error: 'Delivery not found.' }, { status: 404, headers: OPERATIONS_PRIVATE_HEADERS });
    return NextResponse.json(snapshot, { headers: OPERATIONS_PRIVATE_HEADERS });
  } catch (error) {
    console.error('Operational delivery detail failed.', { role: context.actor.role, code: (error as { code?: string })?.code });
    return NextResponse.json({ error: 'The delivery could not be loaded.' }, { status: 500, headers: OPERATIONS_PRIVATE_HEADERS });
  }
}
