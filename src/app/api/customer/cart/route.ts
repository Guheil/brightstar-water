import { NextResponse, type NextRequest } from 'next/server';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS, operationsRpcError } from '@/lib/orders/apiServer';
import { replaceCustomerCartSchema } from '@/lib/cart/validation';
import { hasJsonContentType, isSameOriginMutation, readLimitedJson } from '@/lib/security/request';

export async function GET() {
  const context = await getOperationsApiContext('cart-read', 120, 600, 'customer');
  if ('response' in context) return context.response;

  const { data, error } = await context.adminClient
    .from('customer_cart_items')
    .select('product_id,quantity')
    .eq('customer_id', context.actor.id)
    .order('updated_at', { ascending: true });

  if (error) {
    console.error('Customer cart read failed.', { userId: context.actor.id, code: error.code });
    return NextResponse.json({ error: 'Your saved cart could not be loaded.' }, { status: 500, headers: OPERATIONS_PRIVATE_HEADERS });
  }

  return NextResponse.json({
    items: (data ?? []).map((row) => ({ productId: row.product_id, quantity: row.quantity })),
  }, { headers: OPERATIONS_PRIVATE_HEADERS });
}

export async function PUT(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: OPERATIONS_PRIVATE_HEADERS });
  }
  if (!hasJsonContentType(request)) {
    return NextResponse.json({ error: 'JSON request required.' }, { status: 415, headers: OPERATIONS_PRIVATE_HEADERS });
  }

  const body = await readLimitedJson(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.reason === 'too_large' ? 'The cart request is too large.' : 'Cart details are invalid.' },
      { status: body.reason === 'too_large' ? 413 : 400, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }

  const parsed = replaceCustomerCartSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Cart details are invalid.' },
      { status: 400, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }

  const context = await getOperationsApiContext('cart-write', 80, 600, 'customer');
  if ('response' in context) return context.response;

  const { error } = await context.adminClient.rpc('customer_replace_cart', {
    p_actor_id: context.actor.id,
    p_items: parsed.data.items,
  });

  if (error) return operationsRpcError(error);
  return new NextResponse(null, { status: 204, headers: OPERATIONS_PRIVATE_HEADERS });
}
