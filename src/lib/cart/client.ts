import type { CartLine } from '@/types';
import type { CustomerCartResponse } from './types';

async function readError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const body = await response.json() as { error?: string };
    if (body.error) message = body.error;
  } catch {
    // Keep the safe fallback when the server does not return JSON.
  }
  throw new Error(message);
}

export async function fetchCustomerCart(): Promise<CartLine[]> {
  const response = await fetch('/api/customer/cart', {
    method: 'GET',
    cache: 'no-store',
    credentials: 'same-origin',
  });
  if (!response.ok) return readError(response, 'Your saved cart could not be loaded.');
  const body = await response.json() as CustomerCartResponse;
  return Array.isArray(body.items) ? body.items : [];
}

export async function replaceCustomerCart(items: CartLine[]): Promise<void> {
  const response = await fetch('/api/customer/cart', {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) return readError(response, 'Your cart could not be saved.');
}
