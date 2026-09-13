import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CancellationRequest, CancellationStatus, Customer, CustomerAccountStatus, DelivererProfile,
  Delivery, DeliveryFailureReason, DeliveryScheduleMode, DeliveryStatus, InventoryReservationStatus,
  LoyaltyActivityType, Order, OrderEvent, OrderEventType, OrderItem, OrderStatus, PaymentMethod,
  PaymentRecord, PaymentStatus, ProductCategory, ProductUnit, RefundRecord, RefundStatus, UserRole,
} from '@/types';
import type { SupabaseProfile } from '@/lib/auth/types';
import type { OperationalSnapshot } from './types';

// The generated Supabase schema does not yet include the operational tables. Keep the
// untyped database boundary explicit here instead of leaking `any` through the domain mappers.
interface ScheduleRow {
  schedule_date: string;
  schedule_window_label: string;
  schedule_mode: DeliveryScheduleMode;
  estimated_date: string | null;
  estimated_window_label: string | null;
  preferred_date: string | null;
  preferred_window_label: string | null;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  unit_price_centavos: number | string;
  quantity: number | string;
  line_total_centavos: number | string;
}

interface OrderEventRow {
  id: string;
  order_id: string;
  event_type: OrderEventType;
  label: string;
  description: string | null;
  actor_role: UserRole | 'system';
  actor_id: string | null;
  occurred_at: string;
}

interface CancellationRow {
  id: string;
  order_id: string;
  status: CancellationStatus;
  reason: string;
  requested_at: string;
  requested_by: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
}

interface RefundRow {
  id: string;
  order_id: string;
  payment_id: string;
  amount_centavos: number | string;
  status: RefundStatus;
  reason: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution_note: string | null;
}

interface PaymentRow {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount_centavos: number | string;
  reference: string | null;
  proof_path: string | null;
  verified_at: string | null;
  paid_at: string | null;
  updated_at: string;
}

interface DeliveryRow extends ScheduleRow {
  id: string;
  order_id: string;
  customer_id: string;
  deliverer_id: string | null;
  status: DeliveryStatus;
  recipient_name: string;
  phone: string;
  address_line: string;
  area: string;
  municipality: string;
  province: string;
  distance_meters: number | string;
  latitude: number | string | null;
  longitude: number | string | null;
  delivery_note: string | null;
  payment_method: PaymentMethod;
  amount_to_collect_centavos: number | string;
  assigned_at: string | null;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  failure_reason: DeliveryFailureReason | null;
  failure_note: string | null;
  failure_reported_at: string | null;
  failure_reported_by: string | null;
  completion_recorded_at: string | null;
  completion_cash_centavos: number | string | null;
  completion_note: string | null;
  completion_proof_path: string | null;
  completion_recorded_by: string | null;
  updated_at: string;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  status: CustomerAccountStatus;
  created_at: string;
  updated_at: string;
}

interface DelivererProfileRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  status: 'active' | 'inactive';
}

interface LoyaltyAccountRow {
  customer_id: string;
  points_available: number | string;
  updated_at: string;
}

interface LoyaltyActivityRow {
  id: string;
  customer_id: string;
  activity_type: LoyaltyActivityType;
  points: number | string;
  description: string;
  order_id: string | null;
  reason: string | null;
  created_at: string;
}

interface OrderRow extends ScheduleRow {
  id: string;
  reference: string;
  customer_id: string;
  status: OrderStatus;
  subtotal_centavos: number | string;
  delivery_fee_centavos: number | string;
  loyalty_discount_centavos: number | string;
  total_centavos: number | string;
  payment_method: PaymentMethod;
  delivery_address_id: string | null;
  customer_note: string | null;
  loyalty_qualifying_subtotal_centavos: number | string;
  loyalty_points_pending: number | string;
  loyalty_points_awarded: number | string;
  loyalty_points_redeemed: number | string;
  loyalty_redeemed_at: string | null;
  loyalty_redemption_restored_at: string | null;
  loyalty_settled_at: string | null;
  inventory_reservation_status: InventoryReservationStatus;
  placed_at: string;
  updated_at: string;
}

interface DeliveryLookupRow {
  order_id: string;
}

const n = (value: unknown) => Number(value ?? 0);

function scheduleOf(row: ScheduleRow) {
  return {
    date: String(row.schedule_date),
    windowLabel: String(row.schedule_window_label),
    mode: row.schedule_mode,
    ...(row.estimated_date ? { estimatedDate: String(row.estimated_date) } : {}),
    ...(row.estimated_window_label ? { estimatedWindowLabel: String(row.estimated_window_label) } : {}),
    ...(row.preferred_date ? { preferredDate: String(row.preferred_date) } : {}),
    ...(row.preferred_window_label ? { preferredWindowLabel: String(row.preferred_window_label) } : {}),
  };
}

function mapItem(row: OrderItemRow): OrderItem {
  return {
    productId: row.product_id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    unit: row.unit,
    unitPriceCentavos: n(row.unit_price_centavos),
    quantity: n(row.quantity),
    lineTotalCentavos: n(row.line_total_centavos),
  };
}

function mapEvent(row: OrderEventRow): OrderEvent {
  return {
    id: row.id,
    orderId: row.order_id,
    type: row.event_type,
    label: row.label,
    ...(row.description ? { description: row.description } : {}),
    actorRole: row.actor_role,
    ...(row.actor_id ? { actorId: row.actor_id } : {}),
    occurredAt: row.occurred_at,
  };
}

function mapCancellation(row: CancellationRow): CancellationRequest {
  return {
    id: row.id, orderId: row.order_id, status: row.status, reason: row.reason,
    requestedAt: row.requested_at, requestedBy: row.requested_by,
    ...(row.reviewed_at ? { reviewedAt: row.reviewed_at } : {}),
    ...(row.reviewed_by ? { reviewedBy: row.reviewed_by } : {}),
    ...(row.review_note ? { reviewNote: row.review_note } : {}),
  };
}

function mapRefund(row: RefundRow): RefundRecord {
  return {
    id: row.id, orderId: row.order_id, paymentId: row.payment_id,
    amountCentavos: n(row.amount_centavos), status: row.status, reason: row.reason,
    createdAt: row.created_at, updatedAt: row.updated_at,
    ...(row.resolved_at ? { resolvedAt: row.resolved_at } : {}),
    ...(row.resolution_note ? { resolutionNote: row.resolution_note } : {}),
  };
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id, orderId: row.order_id, method: row.method, status: row.status,
    amountCentavos: n(row.amount_centavos),
    ...(row.reference ? { reference: row.reference } : {}),
    ...(row.proof_path ? { proofAvailable: true } : {}),
    ...(row.verified_at ? { verifiedAt: row.verified_at } : {}),
    ...(row.paid_at ? { paidAt: row.paid_at } : {}),
    updatedAt: row.updated_at,
  };
}

function mapDelivery(row: DeliveryRow): Delivery {
  const failure = row.failure_reason && row.failure_reported_at && row.failure_reported_by ? {
    reason: row.failure_reason,
    ...(row.failure_note ? { note: row.failure_note } : {}),
    reportedAt: row.failure_reported_at,
    reportedBy: row.failure_reported_by,
  } : undefined;
  const completionEvidence = row.completion_recorded_at && row.completion_recorded_by ? {
    ...(row.completion_cash_centavos != null ? { cashReceivedCentavos: n(row.completion_cash_centavos) } : {}),
    ...(row.completion_note ? { note: row.completion_note } : {}),
    ...(row.completion_proof_path ? { proofAvailable: true } : {}),
    recordedAt: row.completion_recorded_at,
    recordedBy: row.completion_recorded_by,
  } : undefined;
  return {
    id: row.id, orderId: row.order_id, customerId: row.customer_id,
    ...(row.deliverer_id ? { delivererId: row.deliverer_id } : {}),
    status: row.status, schedule: scheduleOf(row),
    address: {
      recipientName: row.recipient_name, phonePlaceholder: row.phone,
      addressLine: row.address_line, area: row.area, municipality: row.municipality,
      province: row.province, distanceKm: n(row.distance_meters) / 1000,
      ...(row.latitude != null ? { latitude: n(row.latitude) } : {}),
      ...(row.longitude != null ? { longitude: n(row.longitude) } : {}),
      ...(row.delivery_note ? { deliveryNote: row.delivery_note } : {}),
    },
    paymentMethod: row.payment_method, amountToCollectCentavos: n(row.amount_to_collect_centavos),
    ...(row.assigned_at ? { assignedAt: row.assigned_at } : {}),
    ...(row.accepted_at ? { acceptedAt: row.accepted_at } : {}),
    ...(row.started_at ? { startedAt: row.started_at } : {}),
    ...(row.completed_at ? { completedAt: row.completed_at } : {}),
    ...(failure ? { failure } : {}),
    ...(completionEvidence ? { completionEvidence } : {}),
    updatedAt: row.updated_at,
  };
}

function mapCustomer(profile: ProfileRow): Customer {
  return {
    id: profile.id, displayName: profile.full_name, email: profile.email,
    phonePlaceholder: profile.phone ?? '', status: profile.status,
    addresses: [], createdAt: profile.created_at, updatedAt: profile.updated_at,
  };
}

function mapDeliverer(profile: DelivererProfileRow): DelivererProfile {
  return {
    id: profile.id, displayName: profile.full_name, email: profile.email,
    phonePlaceholder: profile.phone ?? '', status: profile.status === 'active' ? 'available' : 'off_duty',
  };
}

async function mustRows<T>(promise: PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const { data, error } = await promise;
  if (error) throw error;
  return data ?? [];
}

async function hydrateOperationalSnapshot(
  client: SupabaseClient,
  profileClient: SupabaseClient,
  actor: SupabaseProfile,
  orderRows: OrderRow[],
): Promise<OperationalSnapshot> {
  const orderIds = orderRows.map((row) => row.id);
  if (!orderIds.length) return emptySnapshot(actor, profileClient);

  const [itemRows, paymentRows, deliveryRows, eventRows, cancellationRows, refundRows] = await Promise.all([
    mustRows<OrderItemRow>(client.from('order_items').select('*').in('order_id', orderIds).order('id')),
    mustRows<PaymentRow>(client.from('payments').select('*').in('order_id', orderIds)),
    mustRows<DeliveryRow>(client.from('deliveries').select('*').in('order_id', orderIds)),
    mustRows<OrderEventRow>(client.from('order_events').select('*').in('order_id', orderIds).order('occurred_at').order('id')),
    mustRows<CancellationRow>(client.from('order_cancellations').select('*').in('order_id', orderIds)),
    mustRows<RefundRow>(client.from('refunds').select('*').in('order_id', orderIds)),
  ]);

  const itemsByOrder = new Map<string, OrderItem[]>();
  itemRows.forEach((row) => itemsByOrder.set(row.order_id, [...(itemsByOrder.get(row.order_id) ?? []), mapItem(row)]));
  const eventsByOrder = new Map<string, OrderEvent[]>();
  eventRows.forEach((row) => eventsByOrder.set(row.order_id, [...(eventsByOrder.get(row.order_id) ?? []), mapEvent(row)]));
  const cancellationByOrder = new Map(cancellationRows.map((row) => [row.order_id, mapCancellation(row)]));
  const refundByOrder = new Map(refundRows.map((row) => [row.order_id, mapRefund(row)]));
  const paymentByOrder = new Map(paymentRows.map((row) => [row.order_id, row]));
  const deliveryByOrder = new Map(deliveryRows.map((row) => [row.order_id, row]));

  const orders: Order[] = orderRows.map((row) => ({
    id: row.id,
    reference: row.reference,
    customerId: row.customer_id,
    status: row.status,
    items: itemsByOrder.get(row.id) ?? [],
    totals: {
      subtotalCentavos: n(row.subtotal_centavos),
      deliveryFeeCentavos: n(row.delivery_fee_centavos),
      loyaltyDiscountCentavos: n(row.loyalty_discount_centavos),
      totalCentavos: n(row.total_centavos),
    },
    paymentId: paymentByOrder.get(row.id)?.id ?? '',
    paymentMethod: row.payment_method,
    deliveryId: deliveryByOrder.get(row.id)?.id ?? '',
    deliveryAddressId: row.delivery_address_id ?? '',
    deliverySchedule: scheduleOf(row),
    ...(row.customer_note ? { customerNote: row.customer_note } : {}),
    loyalty: {
      qualifyingSubtotalCentavos: n(row.loyalty_qualifying_subtotal_centavos),
      pointsPending: n(row.loyalty_points_pending),
      pointsAwarded: n(row.loyalty_points_awarded),
      pointsRedeemed: n(row.loyalty_points_redeemed),
      discountCentavos: n(row.loyalty_discount_centavos),
      ...(row.loyalty_redeemed_at ? { redeemedAt: row.loyalty_redeemed_at } : {}),
      ...(row.loyalty_redemption_restored_at ? { redemptionRestoredAt: row.loyalty_redemption_restored_at } : {}),
      ...(row.loyalty_settled_at ? { settledAt: row.loyalty_settled_at } : {}),
    },
    inventoryReservationStatus: row.inventory_reservation_status,
    ...(cancellationByOrder.has(row.id) ? { cancellation: cancellationByOrder.get(row.id)! } : {}),
    ...(refundByOrder.has(row.id) ? { refund: refundByOrder.get(row.id)! } : {}),
    events: eventsByOrder.get(row.id) ?? [],
    placedAt: row.placed_at,
    updatedAt: row.updated_at,
  }));

  const customerIds = [...new Set(orderRows.map((row) => row.customer_id))];
  const [profileRows, delivererProfiles, loyaltyAccounts, loyaltyActivity] = await Promise.all([
    actor.role === 'customer'
      ? Promise.resolve<ProfileRow[]>([actor])
      : actor.role === 'admin' && customerIds.length
        ? mustRows<ProfileRow>(profileClient.from('profiles').select('id,email,full_name,phone,status,created_at,updated_at').in('id', customerIds))
      : Promise.resolve<ProfileRow[]>([]),
    actor.role === 'admin'
      ? mustRows<DelivererProfileRow>(profileClient.from('profiles').select('id,email,full_name,phone,status').eq('role', 'deliverer').eq('onboarding_stage', 'complete').order('full_name').limit(500))
      : Promise.resolve<DelivererProfileRow[]>(actor.role === 'deliverer'
        ? [{ id: actor.id, email: actor.email, full_name: actor.full_name, phone: actor.phone, status: actor.status }]
        : []),
    actor.role === 'customer'
      ? mustRows<LoyaltyAccountRow>(client.from('loyalty_accounts').select('*').eq('customer_id', actor.id))
      : customerIds.length
        ? mustRows<LoyaltyAccountRow>(client.from('loyalty_accounts').select('*').in('customer_id', customerIds).limit(500))
        : Promise.resolve<LoyaltyAccountRow[]>([]),
    actor.role === 'customer'
      ? mustRows<LoyaltyActivityRow>(client.from('loyalty_activity').select('*').eq('customer_id', actor.id).order('created_at', { ascending: false }).limit(200))
      : customerIds.length
        ? mustRows<LoyaltyActivityRow>(client.from('loyalty_activity').select('*').in('customer_id', customerIds).order('created_at', { ascending: false }).limit(500))
        : Promise.resolve<LoyaltyActivityRow[]>([]),
  ]);

  return {
    orders,
    deliveries: deliveryRows.map(mapDelivery),
    payments: paymentRows.map(mapPayment),
    deliverers: delivererProfiles.map(mapDeliverer),
    customers: profileRows.map(mapCustomer),
    loyaltyAccounts: loyaltyAccounts.map((row) => ({
      customerId: row.customer_id,
      pointsAvailable: n(row.points_available),
      updatedAt: row.updated_at,
    })),
    loyaltyActivity: loyaltyActivity.map((row) => ({
      id: row.id,
      customerId: row.customer_id,
      type: row.activity_type,
      points: n(row.points),
      description: row.description,
      ...(row.order_id ? { orderId: row.order_id } : {}),
      ...(row.reason ? { reason: row.reason } : {}),
      createdAt: row.created_at,
    })),
  };
}

const INITIAL_ORDER_LIMIT = 100;
export const OPERATIONAL_PAGE_LIMIT = 100;

export async function loadOperationalSnapshot(
  client: SupabaseClient,
  profileClient: SupabaseClient,
  actor: SupabaseProfile,
): Promise<OperationalSnapshot> {
  let orderQuery = client.from('orders').select('*').order('placed_at', { ascending: false }).order('id', { ascending: false }).limit(INITIAL_ORDER_LIMIT);
  if (actor.role === 'customer') orderQuery = orderQuery.eq('customer_id', actor.id);
  if (actor.role === 'deliverer') {
    orderQuery = client.from('orders')
      .select('*,deliveries!inner(deliverer_id)')
      .eq('deliveries.deliverer_id', actor.id)
      .order('placed_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(INITIAL_ORDER_LIMIT);
  }
  return hydrateOperationalSnapshot(client, profileClient, actor, await mustRows<OrderRow>(orderQuery));
}

export interface OperationalCursor {
  placedAt: string;
  id: string;
}

export interface OperationalPage {
  snapshot: OperationalSnapshot;
  nextCursor: OperationalCursor | null;
}

export async function loadOperationalOrderPage(
  client: SupabaseClient,
  profileClient: SupabaseClient,
  actor: SupabaseProfile,
  cursor: OperationalCursor,
  limit = OPERATIONAL_PAGE_LIMIT,
): Promise<OperationalPage> {
  const safeLimit = Math.max(1, Math.min(OPERATIONAL_PAGE_LIMIT, Math.trunc(limit)));
  let orderQuery = client.from('orders')
    .select('*')
    .or(`placed_at.lt.${cursor.placedAt},and(placed_at.eq.${cursor.placedAt},id.lt.${cursor.id})`)
    .order('placed_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(safeLimit + 1);

  if (actor.role === 'customer') orderQuery = orderQuery.eq('customer_id', actor.id);
  if (actor.role === 'deliverer') {
    orderQuery = client.from('orders')
      .select('*,deliveries!inner(deliverer_id)')
      .eq('deliveries.deliverer_id', actor.id)
      .or(`placed_at.lt.${cursor.placedAt},and(placed_at.eq.${cursor.placedAt},id.lt.${cursor.id})`)
      .order('placed_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(safeLimit + 1);
  }

  const rows = await mustRows<OrderRow>(orderQuery);
  const hasMore = rows.length > safeLimit;
  const visibleRows = rows.slice(0, safeLimit);
  const last = visibleRows.at(-1);
  return {
    snapshot: await hydrateOperationalSnapshot(client, profileClient, actor, visibleRows),
    nextCursor: hasMore && last ? { placedAt: last.placed_at, id: last.id } : null,
  };
}

async function emptySnapshot(actor: SupabaseProfile, profileClient?: SupabaseClient): Promise<OperationalSnapshot> {
  if (actor.role === 'admin' && profileClient) {
    const deliverers = await mustRows<DelivererProfileRow>(profileClient.from('profiles').select('id,email,full_name,phone,status').eq('role','deliverer').eq('onboarding_stage','complete').order('full_name').limit(500));
    return { orders: [], deliveries: [], payments: [], deliverers: deliverers.map(mapDeliverer), customers: [], loyaltyAccounts: [], loyaltyActivity: [] };
  }
  const deliverers = actor.role === 'deliverer' ? [mapDeliverer(actor)] : [];
  return { orders: [], deliveries: [], payments: [], deliverers, customers: [], loyaltyAccounts: [], loyaltyActivity: [] };
}

export async function loadOperationalOrderDetail(
  client: SupabaseClient,
  profileClient: SupabaseClient,
  actor: SupabaseProfile,
  orderId: string,
): Promise<OperationalSnapshot | null> {
  let query = client.from('orders').select('*').eq('id', orderId).limit(1);
  if (actor.role === 'customer') query = query.eq('customer_id', actor.id);
  if (actor.role === 'deliverer') {
    query = client.from('orders')
      .select('*,deliveries!inner(deliverer_id)')
      .eq('id', orderId)
      .eq('deliveries.deliverer_id', actor.id)
      .limit(1);
  }
  const rows = await mustRows<OrderRow>(query);
  if (!rows.length) return null;
  return hydrateOperationalSnapshot(client, profileClient, actor, rows);
}

export async function loadOperationalDeliveryDetail(
  client: SupabaseClient,
  profileClient: SupabaseClient,
  actor: SupabaseProfile,
  deliveryId: string,
): Promise<OperationalSnapshot | null> {
  let query = client.from('deliveries').select('order_id').eq('id', deliveryId).limit(1);
  if (actor.role === 'customer') query = query.eq('customer_id', actor.id);
  if (actor.role === 'deliverer') query = query.eq('deliverer_id', actor.id);
  const deliveries = await mustRows<DeliveryLookupRow>(query);
  const orderId = deliveries[0]?.order_id;
  if (!orderId) return null;
  return loadOperationalOrderDetail(client, profileClient, actor, String(orderId));
}
