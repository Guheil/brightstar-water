import type { OperationalCursor, OperationalPage, OperationalSnapshot, PlaceOrderPayload } from './types';
import type { DeliveryFailureReason, RefundStatus } from '@/types';

interface ApiErrorBody { error?: string }
export class OperationsApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = 'OperationsApiError'; }
}
async function parse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!response.ok) throw new OperationsApiError(body.error ?? 'The request could not be completed.', response.status);
  return body;
}
export async function fetchOperationalSnapshot(signal?: AbortSignal): Promise<OperationalSnapshot> {
  return parse(await fetch('/api/operations', { credentials: 'same-origin', cache: 'no-store', signal }));
}
export async function fetchOperationalVersion(signal?: AbortSignal): Promise<{ version: number; updatedAt: string }> {
  return parse(await fetch('/api/operations/version', { credentials: 'same-origin', cache: 'no-store', signal }));
}
export async function fetchOlderOperationalPage(cursor: OperationalCursor, signal?: AbortSignal): Promise<OperationalPage> {
  const params = new URLSearchParams({ placedAt: cursor.placedAt, id: cursor.id });
  return parse(await fetch(`/api/operations/page?${params.toString()}`, { credentials: 'same-origin', cache: 'no-store', signal }));
}
export async function fetchOperationalOrderDetail(orderId: string, signal?: AbortSignal): Promise<OperationalSnapshot> {
  return parse(await fetch(`/api/operations/orders/${encodeURIComponent(orderId)}`, { credentials: 'same-origin', cache: 'no-store', signal }));
}
export async function fetchOperationalDeliveryDetail(deliveryId: string, signal?: AbortSignal): Promise<OperationalSnapshot> {
  return parse(await fetch(`/api/operations/deliveries/${encodeURIComponent(deliveryId)}`, { credentials: 'same-origin', cache: 'no-store', signal }));
}
export async function placeCustomerOrder(payload: PlaceOrderPayload, proof?: File | null): Promise<{ orderId: string }> {
  const form = new FormData(); form.set('payload', JSON.stringify(payload)); if (proof) form.set('proof', proof, 'payment-proof');
  return parse(await fetch('/api/customer/orders', { method: 'POST', credentials: 'same-origin', body: form }));
}
async function jsonMutation<T>(url: string, body: unknown = {}): Promise<T> {
  return parse(await fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }));
}
export const requestOrderCancellation = (id: string, reason: string) => jsonMutation(`/api/customer/orders/${encodeURIComponent(id)}/cancel`, { reason });
export const adminConfirmOrder = (id: string) => jsonMutation(`/api/admin/orders/${encodeURIComponent(id)}/confirm`);
export const adminPrepareOrder = (id: string) => jsonMutation(`/api/admin/orders/${encodeURIComponent(id)}/prepare`);
export const adminAssignDelivery = (id: string, delivererId: string) => jsonMutation(`/api/admin/orders/${encodeURIComponent(id)}/assign`, { delivererId });
export const adminVerifyPayment = (id: string, reference?: string) => jsonMutation(`/api/admin/orders/${encodeURIComponent(id)}/verify-payment`, { ...(reference?.trim() ? { reference: reference.trim() } : {}) });
export const adminResolveCancellation = (id: string, decision: 'approve' | 'reject', note?: string) => jsonMutation(`/api/admin/orders/${encodeURIComponent(id)}/cancellation`, { decision, ...(note?.trim() ? { note: note.trim() } : {}) });
export const adminUpdateRefund = (id: string, status: RefundStatus, note?: string) => jsonMutation(`/api/admin/orders/${encodeURIComponent(id)}/refund`, { status, ...(note?.trim() ? { note: note.trim() } : {}) });
export const delivererAcceptDelivery = (id: string) => jsonMutation(`/api/deliverer/deliveries/${encodeURIComponent(id)}/accept`);
export const delivererStartDelivery = (id: string) => jsonMutation(`/api/deliverer/deliveries/${encodeURIComponent(id)}/start`);
export const delivererFailDelivery = (id: string, reason: DeliveryFailureReason, note?: string) => jsonMutation(`/api/deliverer/deliveries/${encodeURIComponent(id)}/fail`, { reason, ...(note?.trim() ? { note: note.trim() } : {}) });
export async function delivererCompleteDelivery(id: string, payload: { cashReceivedCentavos?: number; note?: string }, proof: File): Promise<void> {
  const form = new FormData(); form.set('payload', JSON.stringify(payload)); form.set('proof', proof, 'delivery-proof');
  await parse(await fetch(`/api/deliverer/deliveries/${encodeURIComponent(id)}/complete`, { method: 'POST', credentials: 'same-origin', body: form }));
}

export async function fetchAdminPaymentProof(paymentId: string): Promise<string> {
  const result = await parse<{ url: string }>(await fetch(`/api/admin/payments/${encodeURIComponent(paymentId)}/proof`, { credentials: 'same-origin', cache: 'no-store' }));
  return result.url;
}

export const adminAdjustLoyalty = (customerId: string, pointsDelta: number, reason: string) => jsonMutation('/api/admin/loyalty/adjust', { customerId, pointsDelta, reason });
