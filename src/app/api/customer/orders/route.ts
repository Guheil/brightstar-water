import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getOperationsApiContext, hasMultipart, OPERATIONS_PRIVATE_HEADERS, operationsRpcError } from '@/lib/orders/apiServer';
import { OrderEvidenceError, removeOrderEvidence, uploadOrderEvidence } from '@/lib/orders/evidenceServer';
import { placeOrderSchema } from '@/lib/orders/validation';
import { isSameOriginMutation } from '@/lib/security/request';

const MAX_FORM_BYTES = 6 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: OPERATIONS_PRIVATE_HEADERS });
  if (!hasMultipart(request)) return NextResponse.json({ error: 'Order form data is required.' }, { status: 415, headers: OPERATIONS_PRIVATE_HEADERS });
  const rawLength = request.headers.get('content-length');
  const size = rawLength == null ? Number.NaN : Number(rawLength);
  if (!Number.isFinite(size) || size <= 0 || size > MAX_FORM_BYTES) return NextResponse.json({ error: 'The order request is too large.' }, { status: 413, headers: OPERATIONS_PRIVATE_HEADERS });

  const context = await getOperationsApiContext('order-create', 12, 600, 'customer');
  if ('response' in context) return context.response;
  let form: FormData;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: 'The order form could not be read.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS }); }
  const rawPayload = form.get('payload');
  if (typeof rawPayload !== 'string' || rawPayload.length > 16_000) return NextResponse.json({ error: 'Order details are invalid.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  let raw: unknown;
  try { raw = JSON.parse(rawPayload); } catch { return NextResponse.json({ error: 'Order details are invalid.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS }); }
  const parsed = placeOrderSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Check the order details.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });

  const proofValue = form.get('proof');
  const proof = proofValue instanceof File && proofValue.size > 0 ? proofValue : null;
  if (parsed.data.paymentMethod === 'gcash' && !proof) return NextResponse.json({ error: 'Upload your GCash payment screenshot.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });
  if (parsed.data.paymentMethod === 'cod' && proof) return NextResponse.json({ error: 'Payment proof only applies to GCash orders.' }, { status: 400, headers: OPERATIONS_PRIVATE_HEADERS });

  let proofPath: string | null = null;
  try {
    if (proof) proofPath = await uploadOrderEvidence(context.adminClient, context.actor.id, 'payments', proof);
    const audit = getAuditRequestContext(request);
    const { data, error } = await context.adminClient.rpc('customer_place_order', {
      p_actor_id: context.actor.id,
      p_items: parsed.data.items,
      p_address_id: parsed.data.deliveryAddressId,
      p_schedule: parsed.data.deliverySchedule,
      p_payment_method: parsed.data.paymentMethod,
      p_payment_proof_path: proofPath,
      p_customer_note: parsed.data.customerNote ?? null,
      p_idempotency_key: parsed.data.idempotencyKey,
      p_request_id: audit.requestId,
      p_client_ip: audit.clientIp,
      p_user_agent: audit.userAgent,
    });
    if (error || !data) {
      await removeOrderEvidence(context.adminClient, proofPath).catch(() => undefined);
      return operationsRpcError(error);
    }
    if (proofPath) {
      const { data: storedPayment } = await context.adminClient
        .from('payments')
        .select('proof_path')
        .eq('order_id', data)
        .maybeSingle();
      if (storedPayment?.proof_path !== proofPath) {
        await removeOrderEvidence(context.adminClient, proofPath).catch(() => undefined);
      }
    }
    return NextResponse.json({ orderId: data }, { status: 201, headers: OPERATIONS_PRIVATE_HEADERS });
  } catch (error) {
    await removeOrderEvidence(context.adminClient, proofPath).catch(() => undefined);
    if (error instanceof OrderEvidenceError) return NextResponse.json({ error: error.message }, { status: error.code === 'too_large' ? 413 : 400, headers: OPERATIONS_PRIVATE_HEADERS });
    console.error('Order placement failed.', { userId: context.actor.id, code: (error as { code?: string })?.code });
    return NextResponse.json({ error: 'The order could not be placed.' }, { status: 500, headers: OPERATIONS_PRIVATE_HEADERS });
  }
}
