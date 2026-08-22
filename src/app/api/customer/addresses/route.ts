import { NextResponse, type NextRequest } from 'next/server';
import { addressMutationSchema } from '@/lib/addresses/validation';
import { addressRpcPayload, canonicalizeAddressMutationInput, listCustomerAddresses } from '@/lib/addresses/server';
import { ADDRESS_PRIVATE_HEADERS, addressRpcErrorResponse, getAddressApiContext, requireJsonMutation } from '@/lib/addresses/apiServer';
import { getAuditRequestContext } from '@/lib/audit/requestContext';
import { isSameOriginMutation, readLimitedJson } from '@/lib/security/request';

export async function GET() {
  const context = await getAddressApiContext('customer-address-read', 180, 60);
  if ('response' in context) return context.response;
  try {
    const addresses = await listCustomerAddresses(context.adminClient, context.actor.id);
    return NextResponse.json({ addresses }, { headers: ADDRESS_PRIVATE_HEADERS });
  } catch (error) {
    console.error('Customer address read failed.', { userId: context.actor.id, code: (error as { code?: string })?.code });
    return NextResponse.json({ error: 'Saved addresses could not be loaded.' }, { status: 500, headers: ADDRESS_PRIVATE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403, headers: ADDRESS_PRIVATE_HEADERS });
  const jsonError = requireJsonMutation(request);
  if (jsonError) return jsonError;
  const context = await getAddressApiContext('customer-address-create', 30, 600);
  if ('response' in context) return context.response;

  const body = await readLimitedJson(request);
  if (!body.ok) return NextResponse.json({ error: body.reason === 'too_large' ? 'Request is too large.' : 'Invalid request.' }, { status: body.reason === 'too_large' ? 413 : 400, headers: ADDRESS_PRIVATE_HEADERS });
  const parsed = addressMutationSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Check the address details and try again.', issues: parsed.error.issues.map((issue) => ({ field: String(issue.path[0] ?? 'form'), message: issue.message })) }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });
  }

  const canonical = await canonicalizeAddressMutationInput(parsed.data);
  if (!canonical) return NextResponse.json({ error: 'Choose a valid province, city or municipality, and barangay.' }, { status: 400, headers: ADDRESS_PRIVATE_HEADERS });

  const audit = getAuditRequestContext(request);
  const { data, error } = await context.adminClient.rpc('customer_save_address', {
    p_actor_id: context.actor.id,
    p_address_id: null,
    ...addressRpcPayload(canonical),
    p_request_id: audit.requestId,
    p_client_ip: audit.clientIp,
    p_user_agent: audit.userAgent,
  });
  if (error || !data) {
    console.error('Customer address creation failed.', { userId: context.actor.id, code: error?.code, requestId: audit.requestId });
    return addressRpcErrorResponse(error);
  }
  const addresses = await listCustomerAddresses(context.adminClient, context.actor.id);
  const address = addresses.find((item) => item.id === data);
  if (!address) return NextResponse.json({ error: 'The address was saved but could not be reloaded.' }, { status: 500, headers: ADDRESS_PRIVATE_HEADERS });
  return NextResponse.json({ address, addresses }, { status: 201, headers: ADDRESS_PRIVATE_HEADERS });
}
