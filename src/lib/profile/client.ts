'use client';

import type { CustomerProfileUpdatePayload } from './validation';
import type { CustomerProfileUpdateResponse } from './types';

async function parseProfileResponse(response: Response): Promise<CustomerProfileUpdateResponse> {
  const payload = await response.json().catch(() => null) as
    | CustomerProfileUpdateResponse
    | { error?: string }
    | null;

  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'Your profile could not be updated.';
    throw new Error(message);
  }

  return payload as CustomerProfileUpdateResponse;
}

export async function updateCustomerProfile(
  input: CustomerProfileUpdatePayload,
): Promise<CustomerProfileUpdateResponse> {
  return parseProfileResponse(await fetch('/api/customer/profile', {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }));
}
