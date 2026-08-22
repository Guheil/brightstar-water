import { NextResponse, type NextRequest } from 'next/server';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS } from '@/lib/orders/apiServer';
import { createEvidenceSignedUrl } from '@/lib/orders/evidenceServer';
import { entityUuidSchema } from '@/lib/orders/validation';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = entityUuidSchema.safeParse((await params).id);
  if (!id.success) return NextResponse.json({ error: 'Payment not found.' }, { status: 404, headers: OPERATIONS_PRIVATE_HEADERS });
  const context = await getOperationsApiContext('admin-payment-proof-read', 60, 60, 'admin');
  if ('response' in context) return context.response;
  const { data, error } = await context.adminClient.from('payments').select('proof_path').eq('id', id.data).maybeSingle();
  if (error) return NextResponse.json({ error: 'Payment proof could not be loaded.' }, { status: 500, headers: OPERATIONS_PRIVATE_HEADERS });
  if (!data?.proof_path) return NextResponse.json({ error: 'No payment proof is attached.' }, { status: 404, headers: OPERATIONS_PRIVATE_HEADERS });
  const url = await createEvidenceSignedUrl(context.adminClient, data.proof_path);
  if (!url) return NextResponse.json({ error: 'Payment proof could not be loaded.' }, { status: 500, headers: OPERATIONS_PRIVATE_HEADERS });
  return NextResponse.json({ url }, { headers: OPERATIONS_PRIVATE_HEADERS });
}
