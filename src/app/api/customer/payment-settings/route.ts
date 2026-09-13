import { NextResponse } from 'next/server';
import { getOperationsApiContext, OPERATIONS_PRIVATE_HEADERS } from '@/lib/orders/apiServer';
import {
  GCASH_UNAVAILABLE_MESSAGE,
  loadGCashPaymentSettingsRow,
  toCustomerGCashPaymentSettingsView,
} from '@/lib/payments/server';

export async function GET() {
  const context = await getOperationsApiContext('customer-payment-settings-read', 120, 60, 'customer');
  if ('response' in context) return context.response;

  try {
    const row = await loadGCashPaymentSettingsRow(context.adminClient);
    const view = await toCustomerGCashPaymentSettingsView(context.adminClient, row);
    return NextResponse.json(view, { headers: OPERATIONS_PRIVATE_HEADERS });
  } catch (error) {
    console.error('Customer GCash settings read failed.', {
      userId: context.actor.id,
      code: (error as { code?: string })?.code,
    });
    return NextResponse.json(
      { error: GCASH_UNAVAILABLE_MESSAGE },
      { status: 503, headers: OPERATIONS_PRIVATE_HEADERS },
    );
  }
}
