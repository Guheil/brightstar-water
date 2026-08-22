import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS, operationsRpcError } from '@/lib/orders/apiServer';
import { entityUuidSchema, refundUpdateSchema } from '@/lib/orders/validation';
import { hasJsonContentType, isRequestBodyWithinLimit, isSameOriginMutation, readLimitedJson } from '@/lib/security/request';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: OPERATIONS_PRIVATE_HEADERS });
  if (!hasJsonContentType(request)) return NextResponse.json({ error: 'JSON content is required.' }, { status: 415, headers: OPERATIONS_PRIVATE_HEADERS });
  if (!isRequestBodyWithinLimit(request)) return NextResponse.json({ error: 'Request is too large.' }, { status: 413, headers: OPERATIONS_PRIVATE_HEADERS });
  const body = await readLimitedJson(request); if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  const parsed = refundUpdateSchema.safeParse(body.value); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  const id = entityUuidSchema.safeParse((await params).id); if (!id.success) return NextResponse.json({ error: 'Order not found.' }, { status: 404, headers: OPERATIONS_PRIVATE_HEADERS });
  const context = await getOperationsApiContext('admin-refund-update', 30, 600, 'admin'); if ('response' in context) return context.response;
  const audit = getAuditRequestContext(request);
  const extra = { p_target_status: parsed.data.status, p_note: parsed.data.note ?? null };
  const { error } = await context.adminClient.rpc('admin_update_order_refund', { p_actor_id: context.actor.id, p_order_id: id.data, ...extra, p_request_id: audit.requestId, p_client_ip: audit.clientIp, p_user_agent: audit.userAgent });
  if (error) return operationsRpcError(error);
  return NextResponse.json({ ok: true }, { headers: OPERATIONS_PRIVATE_HEADERS });
}
