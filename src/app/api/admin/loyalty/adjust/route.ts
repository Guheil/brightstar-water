import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS, operationsRpcError } from '@/lib/orders/apiServer';
import { loyaltyAdjustmentSchema } from '@/lib/orders/validation';
import { hasJsonContentType, isRequestBodyWithinLimit, isSameOriginMutation, readLimitedJson } from '@/lib/security/request';

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: OPERATIONS_PRIVATE_HEADERS });
  if (!hasJsonContentType(request)) return NextResponse.json({ error: 'JSON content is required.' }, { status: 415, headers: OPERATIONS_PRIVATE_HEADERS });
  if (!isRequestBodyWithinLimit(request)) return NextResponse.json({ error: 'Request is too large.' }, { status: 413, headers: OPERATIONS_PRIVATE_HEADERS });
  const body = await readLimitedJson(request); if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  const parsed = loyaltyAdjustmentSchema.safeParse(body.value); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid loyalty adjustment.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  const context = await getOperationsApiContext('admin-loyalty-adjust', 30, 600, 'admin'); if ('response' in context) return context.response;
  const audit = getAuditRequestContext(request);
  const { error } = await context.adminClient.rpc('admin_adjust_customer_loyalty', { p_actor_id: context.actor.id, p_customer_id: parsed.data.customerId, p_points_delta: parsed.data.pointsDelta, p_reason: parsed.data.reason, p_request_id: audit.requestId, p_client_ip: audit.clientIp, p_user_agent: audit.userAgent });
  if (error) return operationsRpcError(error);
  return NextResponse.json({ ok: true }, { headers: OPERATIONS_PRIVATE_HEADERS });
}
