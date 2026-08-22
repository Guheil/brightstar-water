import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getOperationsApiContext, hasMultipart, OPERATIONS_PRIVATE_HEADERS, operationsRpcError } from '@/lib/orders/apiServer';
import { OrderEvidenceError, removeOrderEvidence, uploadOrderEvidence } from '@/lib/orders/evidenceServer';
import { deliveryCompletionSchema, entityUuidSchema } from '@/lib/orders/validation';
import { isSameOriginMutation } from '@/lib/security/request';

const MAX_FORM_BYTES = 6 * 1024 * 1024;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: OPERATIONS_PRIVATE_HEADERS });
  if (!hasMultipart(request)) return NextResponse.json({ error: 'Delivery evidence form data is required.' }, { status: 415, headers: OPERATIONS_PRIVATE_HEADERS });
  const rawLength = request.headers.get('content-length');
  const size = rawLength == null ? Number.NaN : Number(rawLength);
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FORM_BYTES) return NextResponse.json({ error: 'The delivery evidence is too large.' }, { status: 413, headers: OPERATIONS_PRIVATE_HEADERS });
  const id = entityUuidSchema.safeParse((await params).id); if (!id.success) return NextResponse.json({ error: 'Delivery not found.' }, { status: 404, headers: OPERATIONS_PRIVATE_HEADERS });
  const context = await getOperationsApiContext('delivery-complete', 30, 600, 'deliverer'); if ('response' in context) return context.response;
  let form: FormData; try { form = await request.formData(); } catch { return NextResponse.json({ error: 'The delivery evidence could not be read.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS }); }
  const rawPayload = form.get('payload'); if (typeof rawPayload !== 'string' || rawPayload.length > 4000) return NextResponse.json({ error: 'Completion details are invalid.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  let raw: unknown; try { raw = JSON.parse(rawPayload); } catch { return NextResponse.json({ error: 'Completion details are invalid.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS }); }
  const parsed = deliveryCompletionSchema.safeParse(raw); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Completion details are invalid.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  const proofValue = form.get('proof'); const proof = proofValue instanceof File && proofValue.size > 0 ? proofValue : null;
  if (!proof) return NextResponse.json({ error: 'Add a delivery photo before completing the stop.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  let proofPath: string | null = null;
  try {
    proofPath = await uploadOrderEvidence(context.adminClient, context.actor.id, 'deliveries', proof);
    const audit = getAuditRequestContext(request);
    const { error } = await context.adminClient.rpc('deliverer_complete_order_delivery', { p_actor_id: context.actor.id, p_delivery_id: id.data, p_cash_received_centavos: parsed.data.cashReceivedCentavos ?? null, p_proof_path: proofPath, p_note: parsed.data.note ?? null, p_request_id: audit.requestId, p_client_ip: audit.clientIp, p_user_agent: audit.userAgent });
    if (error) { await removeOrderEvidence(context.adminClient, proofPath).catch(() => undefined); return operationsRpcError(error); }
    return NextResponse.json({ ok: true }, { headers: OPERATIONS_PRIVATE_HEADERS });
  } catch (error) {
    await removeOrderEvidence(context.adminClient, proofPath).catch(() => undefined);
    if (error instanceof OrderEvidenceError) return NextResponse.json({ error: error.message }, { status: error.code === 'too_large' ? 413 : 400, headers: OPERATIONS_PRIVATE_HEADERS });
    return NextResponse.json({ error: 'The delivery could not be completed.' }, { status: 500, headers: OPERATIONS_PRIVATE_HEADERS });
  }
}
