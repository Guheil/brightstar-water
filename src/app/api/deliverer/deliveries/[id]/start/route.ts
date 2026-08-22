import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS, operationsRpcError } from '@/lib/orders/apiServer';
import { entityUuidSchema } from '@/lib/orders/validation';
import { hasJsonContentType, isRequestBodyWithinLimit, isSameOriginMutation, readLimitedJson } from '@/lib/security/request';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: OPERATIONS_PRIVATE_HEADERS });
  if (!hasJsonContentType(request) || !isRequestBodyWithinLimit(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  const body = await readLimitedJson(request); if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  const id = entityUuidSchema.safeParse((await params).id); if (!id.success) return NextResponse.json({ error: 'Delivery not found.' }, { status: 404, headers: OPERATIONS_PRIVATE_HEADERS });
  const context = await getOperationsApiContext('delivery-start', 60, 600, 'deliverer'); if ('response' in context) return context.response;
  const audit = getAuditRequestContext(request);
  const { error } = await context.adminClient.rpc('deliverer_start_order_delivery', { p_actor_id: context.actor.id, p_delivery_id: id.data, p_request_id: audit.requestId, p_client_ip: audit.clientIp, p_user_agent: audit.userAgent });
  if (error) return operationsRpcError(error);
  return NextResponse.json({ ok: true }, { headers: OPERATIONS_PRIVATE_HEADERS });
}
