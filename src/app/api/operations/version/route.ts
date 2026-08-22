import { NextResponse } from 'next/server';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS } from '@/lib/orders/apiServer';

export async function GET() {
  const context = await getOperationsApiContext('operations-version', 240, 60);
  if ('response' in context) return context.response;

  try {
    const { data, error } = await context.adminClient
      .from('operational_change_clock')
      .select('version,updated_at')
      .eq('id', true)
      .single();
    if (error) throw error;
    return NextResponse.json(
      { version: Number(data.version), updatedAt: data.updated_at },
      { headers: OPERATIONS_PRIVATE_HEADERS },
    );
  } catch (error) {
    console.error('Operational version read failed.', {
      role: context.actor.role,
      code: (error as { code?: string })?.code,
    });
    return NextResponse.json(
      { error: 'Order synchronization is temporarily unavailable.' },
      { status: 500, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }
}
