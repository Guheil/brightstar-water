import { NextResponse, type NextRequest } from 'next/server';
import { addressIdSchema } from '@/lib/addresses/validation';
import { listCustomerAddresses } from '@/lib/addresses/server';
import { ADDRESS_PRIVATE_HEADERS, addressRpcErrorResponse, getAddressApiContext } from '@/lib/addresses/apiServer';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { isSameOriginMutation } from '@/lib/security/request';

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, routeContext: RouteContext) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: ADDRESS_PRIVATE_HEADERS });
  const { id } = await routeContext.params;
  const parsedId = addressIdSchema.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ error: 'Invalid address.' }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });
  const context = await getAddressApiContext('customer-address-default', 60, 600);
  if ('response' in context) return context.response;
  const audit = getAuditRequestContext(request);
  const { error } = await context.adminClient.rpc('customer_set_default_address', {
    p_actor_id: context.actor.id,
    p_address_id: parsedId.data,
    p_request_id: audit.requestId,
    p_client_ip: audit.clientIp,
    p_user_agent: audit.userAgent,
  });
  if (error) return addressRpcErrorResponse(error);
  const addresses = await listCustomerAddresses(context.adminClient, context.actor.id);
  return NextResponse.json({ addresses }, { headers: ADDRESS_PRIVATE_HEADERS });
}
