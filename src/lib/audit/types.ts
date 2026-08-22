export const AUDIT_CATEGORIES = [
  'accounts',
  'onboarding',
  'security',
  'orders',
  'products',
  'inventory',
  'deliveries',
  'payments',
  'loyalty',
  'addresses',
  'system',
] as const;

export const AUDIT_RESULTS = ['success', 'failed', 'denied'] as const;

export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];
export type AuditResult = (typeof AUDIT_RESULTS)[number];
export type AuditActorRole = 'customer' | 'admin' | 'deliverer' | 'system';
export type AuditSource =
  | 'admin_dashboard'
  | 'onboarding'
  | 'customer_portal'
  | 'deliverer_app'
  | 'system';

export interface AuditEventListItem {
  eventId: string;
  occurredAt: string;
  eventCode: string;
  category: AuditCategory;
  result: AuditResult;
  summary: string;
  actorUserId: string | null;
  actorName: string;
  actorRole: AuditActorRole;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
}

export interface AuditChangeValue {
  before?: unknown;
  after?: unknown;
}

export type AuditChangeSet = Record<string, AuditChangeValue>;
export type AuditDetailMap = Record<string, unknown>;

export interface AuditEventDetail extends AuditEventListItem {
  changes: AuditChangeSet;
  details: AuditDetailMap;
  reason: string | null;
  requestId: string;
  source: AuditSource;
  clientIp: string | null;
  userAgent: string | null;
  schemaVersion: number;
}

export interface AuditListFilters {
  actorId?: string;
  category?: AuditCategory;
  cursor?: string;
  from?: string;
  limit: number;
  query?: string;
  result?: AuditResult;
  to?: string;
}

export interface AuditListResult {
  events: AuditEventListItem[];
  nextCursor: string | null;
}
