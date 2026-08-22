import { NextResponse, type NextRequest } from 'next/server';
import { addressMutationSchema, addressIdSchema } from '@/lib/addresses/validation';
import { addressRpcPayload, canonicalizeAddressMutationInput, listCustomerAddresses } from '@/lib/addresses/server';
import { ADDRESS_PRIVATE_HEADERS, addressRpcErrorResponse, getAddressApiContext, requireJsonMutation } from '@/lib/addresses/apiServer';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { isSameOriginMutation, readLimitedJson } from '@/lib/security/request';

interface RouteContext { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, routeContext: RouteContext) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: ADDRESS_PRIVATE_HEADERS });
  const jsonError = requireJsonMutation(request);
  if (jsonError) return jsonError;
  const { id } = await routeContext.params;
  const parsedId = addressIdSchema.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ error: 'Invalid address.' }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });
  const context = await getAddressApiContext('customer-address-update', 60, 600);
  if ('response' in context) return context.response;
  const body = await readLimitedJson(request);
  if (!body.ok) return NextResponse.json({ error: 'Invalid request.' }, { status: body.reason === 'too_large' ? 413 : 400, headers: ADDRESS_PRIVATE_HEADERS });
  const parsed = addressMutationSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: 'Check the address details and try again.', issues: parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? 'form'), message: issue.message })) }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });

  const canonical = await canonicalizeAddressMutationInput(parsed.data);
  if (!canonical) return NextResponse.json({ error: 'Choose a valid province, city or municipality, and barangay.' }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });

  const audit = getAuditRequestContext(request);
  const { data, error } = await context.adminClient.rpc('customer_save_address', {
    p_actor_id: context.actor.id,
    p_address_id: parsedId.data,
    ...addressRpcPayload(canonical),
    p_request_id: audit.requestId,
    p_client_ip: audit.clientIp,
    p_user_agent: audit.userAgent,
  });
  if (error || !data) return addressRpcErrorResponse(error);
  const addresses = await listCustomerAddresses(context.adminClient, context.actor.id);
  const address = addresses.find((item) => item.id === parsedId.data);
  if (!address) return NextResponse.json({ error: 'The address could not be reloaded.' }, { status: 500, headers: ADDRESS_PRIVATE_HEADERS });
  return NextResponse.json({ address, addresses }, { headers: ADDRESS_PRIVATE_HEADERS });
}

export async function DELETE(request: NextRequest, routeContext: RouteContext) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: ADDRESS_PRIVATE_HEADERS });
  const { id } = await routeContext.params;
  const parsedId = addressIdSchema.safeParse(id);
  if (!parsedId.success) return NextResponse.json({ error: 'Invalid address.' }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });
  const context = await getAddressApiContext('customer-address-delete', 30, 600);
  if ('response' in context) return context.response;
  const audit = getAuditRequestContext(request);
  const { error } = await context.adminClient.rpc('customer_delete_address', {
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
