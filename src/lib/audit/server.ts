import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type {
  AuditActorRole,
  AuditCategory,
  AuditChangeSet,
  AuditDetailMap,
  AuditEventDetail,
  AuditEventListItem,
  AuditListFilters,
  AuditListResult,
  AuditResult,
  AuditSource,
} from './types';

interface AuditListRow {
  id: number | string;
  event_id: string;
  occurred_at: string;
  event_code: string;
  category: AuditCategory;
  result: AuditResult;
  summary: string;
  actor_user_id: string | null;
  actor_name: string;
  actor_role: AuditActorRole;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
}

interface AuditDetailRow extends AuditListRow {
  changes: unknown;
  details: unknown;
  reason: string | null;
  request_id: string;
  source: AuditSource;
  client_ip: string | null;
  user_agent: string | null;
  schema_version: number;
}

const auditCursorSchema = z.object({
  occurredAt: z.string().datetime({ offset: true }),
  id: z.string().regex(/^\d+$/),
});

function encodeCursor(row: AuditListRow): string {
  return Buffer.from(
    JSON.stringify({ occurredAt: row.occurred_at, id: String(row.id) }),
    'utf8',
  ).toString('base64url');
}

function decodeCursor(value?: string): { occurredAt: string; id: string } | null {
  if (!value) return null;

  try {
    const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as unknown;
    const parsed = auditCursorSchema.safeParse(decoded);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mapListRow(row: AuditListRow): AuditEventListItem {
  return {
    eventId: row.event_id,
    occurredAt: row.occurred_at,
    eventCode: row.event_code,
    category: row.category,
    result: row.result,
    summary: row.summary,
    actorUserId: row.actor_user_id,
    actorName: row.actor_name,
    actorRole: row.actor_role,
    targetType: row.target_type,
    targetId: row.target_id,
    targetLabel: row.target_label,
  };
}

function toPhilippinesStart(date?: string): string | null {
  return date ? `${date}T00:00:00+08:00` : null;
}

function toPhilippinesEnd(date?: string): string | null {
  return date ? `${date}T23:59:59.999+08:00` : null;
}

export async function listAdminAuditEvents(
  adminClient: SupabaseClient,
  filters: AuditListFilters,
): Promise<AuditListResult> {
  const cursor = decodeCursor(filters.cursor);
  if (filters.cursor && !cursor) throw new Error('Invalid audit cursor');

  const { data, error } = await adminClient.rpc('list_admin_audit_events', {
    p_actor_id: filters.actorId ?? null,
    p_category: filters.category ?? null,
    p_cursor_id: cursor?.id ?? null,
    p_cursor_occurred_at: cursor?.occurredAt ?? null,
    p_from: toPhilippinesStart(filters.from),
    p_limit: filters.limit,
    p_query: filters.query ?? null,
    p_result: filters.result ?? null,
    p_to: toPhilippinesEnd(filters.to),
  });

  if (error) throw error;

  const rows = (Array.isArray(data) ? data : []) as AuditListRow[];
  const hasNextPage = rows.length > filters.limit;
  const visibleRows = hasNextPage ? rows.slice(0, filters.limit) : rows;
  const lastRow = visibleRows.at(-1);

  return {
    events: visibleRows.map(mapListRow),
    nextCursor: hasNextPage && lastRow ? encodeCursor(lastRow) : null,
  };
}

export async function getAdminAuditEvent(
  adminClient: SupabaseClient,
  eventId: string,
): Promise<AuditEventDetail | null> {
  const { data, error } = await adminClient.rpc('get_admin_audit_event', {
    p_event_id: eventId,
  });

  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as AuditDetailRow | null;
  if (!row) return null;

  return {
    ...mapListRow(row),
    changes: asObject(row.changes) as AuditChangeSet,
    details: asObject(row.details) as AuditDetailMap,
    reason: row.reason,
    requestId: row.request_id,
    source: row.source,
    clientIp: row.client_ip,
    userAgent: row.user_agent,
    schemaVersion: Number(row.schema_version),
  };
}
