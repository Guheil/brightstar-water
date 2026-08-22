import { revalidatePath } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { getAdminProduct } from '@/lib/catalog/server';
import { inventoryAdjustmentSchema, productIdSchema } from '@/lib/catalog/validation';
import { createAdminClient } from '@/lib/supabase/admin';
import { consumeAdminRateLimit } from '@/lib/security/rateLimit';
import {
  hasJsonContentType,
  isRequestBodyWithinLimit,
  isSameOriginMutation,
  readLimitedJson,
} from '@/lib/security/request';

const PRIVATE_NO_STORE = { 'Cache-Control': 'private, no-store' } as const;

interface InventoryRouteContext {
  params: Promise<{ productId: string }>;
}

export async function POST(request: NextRequest, context: InventoryRouteContext) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json({ error: 'JSON content is required.' }, { status: 415, headers: PRIVATE_NO_STORE });
  }
  if (!isRequestBodyWithinLimit(request)) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413, headers: PRIVATE_NO_STORE });
  }

  const actor = await getAuthenticatedProfile();
  if (!actor || actor.role !== 'admin' || actor.status !== 'active' || actor.onboarding_stage !== 'complete') {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403, headers: PRIVATE_NO_STORE });
  }

  const { productId } = await context.params;
  const parsedId = productIdSchema.safeParse(productId);
  if (!parsedId.success) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404, headers: PRIVATE_NO_STORE });
  }

  const body = await readLimitedJson(request);
  if (!body.ok) {
    return NextResponse.json({ error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' }, { status: body.reason === 'too_large' ? 413 : 400, headers: PRIVATE_NO_STORE });
  }
  const parsed = inventoryAdjustmentSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Check the inventory adjustment.' },
      { status: 400, headers: PRIVATE_NO_STORE },
    );
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json({ error: 'Inventory management is not configured.' }, { status: 503, headers: PRIVATE_NO_STORE });
  }

  try {
    const limit = await consumeAdminRateLimit(adminClient, `admin-inventory-adjust:${actor.id}`, 80, 600);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many inventory adjustments. Please try again shortly.' },
        { status: 429, headers: { ...PRIVATE_NO_STORE, 'Retry-After': String(limit.retryAfterSeconds) } },
      );
    }

    const auditContext = getAuditRequestContext(request);
    const { error } = await adminClient.rpc('admin_adjust_product_inventory', {
      p_actor_id: actor.id,
      p_product_id: parsedId.data,
      p_mode: parsed.data.mode,
      p_quantity: parsed.data.quantity,
      p_reason: parsed.data.reason,
      p_request_id: auditContext.requestId,
      p_client_ip: auditContext.clientIp,
      p_user_agent: auditContext.userAgent,
    });

    if (error) {
      const conflict = /reserved stock/i.test(error.message);
      return NextResponse.json(
        { error: conflict ? 'Physical stock cannot be reduced below the quantity reserved by active orders.' : 'The inventory adjustment could not be applied.' },
        { status: conflict ? 409 : 500, headers: PRIVATE_NO_STORE },
      );
    }

    const updated = await getAdminProduct(parsedId.data);
    if (!updated?.inventory) throw new Error('Updated inventory could not be reloaded.');
    revalidatePath('/api/catalog');
    return NextResponse.json({ inventory: updated.inventory }, { status: 200, headers: PRIVATE_NO_STORE });
  } catch (error) {
    console.error('Unexpected inventory adjustment failure.', {
      productId: parsedId.data,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'The inventory adjustment could not be applied.' }, { status: 500, headers: PRIVATE_NO_STORE });
  }
}
