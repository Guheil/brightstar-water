import type {
  AuditCategory,
  AuditEventDetail,
  AuditEventListItem,
  AuditResult,
} from '@/lib/audit/types';

export interface ActivityHistoryScreenProps {
  className?: string;
}

export interface ActivityHistoryFilterState {
  category: 'all' | AuditCategory;
  from: string;
  query: string;
  result: 'all' | AuditResult;
  to: string;
}

export interface ActivityHistoryListResponse {
  events?: AuditEventListItem[];
  nextCursor?: string | null;
  error?: string;
}

export interface ActivityHistoryDetailResponse {
  event?: AuditEventDetail;
  error?: string;
}
