import type { GCashPaymentSettingsView, UpdateGCashPaymentSettingsInput } from './types';

interface ErrorBody { error?: string }

export class PaymentSettingsApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'PaymentSettingsApiError';
  }
}

async function parse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as ErrorBody & T;
  if (!response.ok) throw new PaymentSettingsApiError(body.error ?? 'Payment settings could not be loaded.', response.status);
  return body;
}

export async function fetchAdminGCashPaymentSettings(signal?: AbortSignal): Promise<GCashPaymentSettingsView> {
  return parse(await fetch('/api/admin/payment-settings', {
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  }));
}

export async function updateAdminGCashPaymentSettings(
  input: UpdateGCashPaymentSettingsInput,
  qrFile?: File | null,
): Promise<GCashPaymentSettingsView> {
  const form = new FormData();
  form.set('payload', JSON.stringify(input));
  if (qrFile) form.set('qr', qrFile, 'gcash-qr');
  return parse(await fetch('/api/admin/payment-settings', {
    method: 'PATCH',
    credentials: 'same-origin',
    body: form,
  }));
}

export async function fetchCustomerGCashPaymentSettings(signal?: AbortSignal): Promise<GCashPaymentSettingsView> {
  return parse(await fetch('/api/customer/payment-settings', {
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
  }));
}
