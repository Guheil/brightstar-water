'use client';

import type { DeliveryAddress } from '@/types';
import type { AddressListResponse, AddressMutationInput, AddressMutationResponse, PsgcLevel, PsgcOption } from './types';

async function parseJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as T | { error?: string } | null;
  if (!response.ok) {
    const message = payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'The request could not be completed.';
    throw new Error(message);
  }
  return payload as T;
}

export async function fetchCustomerAddresses(): Promise<DeliveryAddress[]> {
  const response = await fetch('/api/customer/addresses', { cache: 'no-store', credentials: 'same-origin' });
  return (await parseJson<AddressListResponse>(response)).addresses;
}

export async function createCustomerAddress(input: AddressMutationInput): Promise<AddressMutationResponse> {
  return parseJson<AddressMutationResponse>(await fetch('/api/customer/addresses', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function updateCustomerAddress(id: string, input: AddressMutationInput): Promise<AddressMutationResponse> {
  return parseJson<AddressMutationResponse>(await fetch(`/api/customer/addresses/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function deleteCustomerAddress(id: string): Promise<AddressListResponse> {
  return parseJson<AddressListResponse>(await fetch(`/api/customer/addresses/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
  }));
}

export async function setDefaultCustomerAddress(id: string): Promise<AddressListResponse> {
  return parseJson<AddressListResponse>(await fetch(`/api/customer/addresses/${encodeURIComponent(id)}/default`, {
    method: 'POST',
    credentials: 'same-origin',
  }));
}

export async function markCustomerAddressUsed(id: string): Promise<void> {
  const response = await fetch(`/api/customer/addresses/${encodeURIComponent(id)}/used`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!response.ok) throw new Error('The selected address could not be confirmed.');
}

export async function fetchPsgcOptions(level: PsgcLevel, filters: { provinceCode?: string; municipalityCode?: string } = {}): Promise<PsgcOption[]> {
  const params = new URLSearchParams({ level });
  if (filters.provinceCode) params.set('provinceCode', filters.provinceCode);
  if (filters.municipalityCode) params.set('municipalityCode', filters.municipalityCode);
  const response = await fetch(`/api/reference/psgc?${params.toString()}`, { cache: 'force-cache', credentials: 'same-origin' });
  return (await parseJson<{ options: PsgcOption[] }>(response)).options;
}
