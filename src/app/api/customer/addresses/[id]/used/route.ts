import { NextResponse, type NextRequest } from 'next/server';
import { addressIdSchema } from '@/lib/addresses/validation';
import { ADDRESS_PRIVATE_HEADERS, addressRpcErrorResponse, getAddressApiContext } from '@/lib/addresses/apiServer';
import { isSameOriginMutation } from '@/lib/security/request';

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, routeContext: RouteContext) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: ADDRESS_PRIVATE_HEADERS });
  const { id } = await routeContext.params;
  const parsedId = addressIdSchema.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ error: 'Invalid address.' }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });
  const context = await getAddressApiContext('customer-address-use', 120, 600);
  if ('response' in context) return context.response;
  const { error } = await context.adminClient.rpc('customer_mark_address_used', { p_actor_id: context.actor.id, p_address_id: parsedId.data });
  if (error) return addressRpcErrorResponse(error);
  return new NextResponse(null, { status: 204, headers: ADDRESS_PRIVATE_HEADERS });
}
