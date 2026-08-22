import { NextResponse, type NextRequest } from 'next/server';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS } from '@/lib/orders/apiServer';
import { loadOperationalOrderPage } from '@/lib/orders/server';
import { entityUuidSchema } from '@/lib/orders/validation';

const isoTimestamp = /^20\d{2}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:?\d{2})$/;

export async function GET(request: NextRequest) {
  const context = await getOperationsApiContext('operations-page', 90, 60);
  if ('response' in context) return context.response;

  const placedAt = request.nextUrl.searchParams.get('placedAt') ?? '';
  const id = request.nextUrl.searchParams.get('id') ?? '';
  if (!isoTimestamp.test(placedAt) || !Number.isFinite(Date.parse(placedAt)) || !entityUuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Invalid order cursor.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  }

  try {
    const page = await loadOperationalOrderPage(context.adminClient, context.profileClient, context.actor, { placedAt, id });
    return NextResponse.json(page, { headers: OPERATIONS_PRIVATE_HEADERS });
  } catch (error) {
    console.error('Operational page read failed.', {
      role: context.actor.role,
      code: (error as { code?: string })?.code,
    });
    return NextResponse.json(
      { error: 'Older orders could not be loaded.' },
      { status: 500, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }
}
