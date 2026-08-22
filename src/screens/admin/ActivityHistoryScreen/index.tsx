'use client';

import { History, Search, X } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { AUDIT_CATEGORIES, AUDIT_RESULTS } from '@/lib/audit/types';
import type {
  AuditEventDetail,
  AuditEventListItem,
  AuditResult,
} from '@/lib/audit/types';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminPageHeader from '../components/AdminPageHeader';
import { humanize } from '../utils';
import {
  ActivitySummary,
  ApplyButton,
  ChangeField,
  ChangeList,
  ChangeRow,
  ChangeValue,
  ClearButton,
  CloseButton,
  DetailBody,
  DetailDrawer,
  DetailGrid,
  DetailHeader,
  DetailLead,
  DetailSection,
  DetailSectionTitle,
  DetailShell,
  DetailTerm,
  DetailTitle,
  DetailValue,
  FilterActions,
  FilterField,
  FilterForm,
  FilterOption,
  FilterSection,
  LoadMoreButton,
  LoadMoreWrap,
  MutedCopy,
  PersonCopy,
  PersonName,
  PersonRole,
  ResultBar,
  ResultText,
  Root,
  SearchField,
  SecurityBody,
  SecurityDetails,
  SecuritySummary,
  TargetCopy,
  TargetName,
  TargetType,
  ViewButton,
} from './elements';
import type {
  ActivityHistoryDetailResponse,
  ActivityHistoryFilterState,
  ActivityHistoryListResponse,
  ActivityHistoryScreenProps,
} from './interface';

const DEFAULT_FILTERS: ActivityHistoryFilterState = {
  category: 'all',
  from: '',
  query: '',
  result: 'all',
  to: '',
};

const categoryLabel: Record<string, string> = {
  accounts: 'Accounts',
  onboarding: 'Onboarding',
  security: 'Security',
  orders: 'Orders',
  products: 'Products',
  inventory: 'Inventory',
  deliveries: 'Deliveries',
  payments: 'Payments',
  loyalty: 'Loyalty',
  addresses: 'Addresses',
  system: 'System',
};

const sourceLabel: Record<string, string> = {
  admin_dashboard: 'Admin dashboard',
  onboarding: 'First-time setup',
  customer_portal: 'Customer account',
  deliverer_app: 'Deliverer workspace',
  system: 'System',
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Manila',
});

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : dateTimeFormatter.format(date);
}

function resultTone(result: AuditResult) {
  if (result === 'success') return 'success' as const;
  if (result === 'denied') return 'warning' as const;
  return 'error' as const;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'Not set';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(formatValue).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${humanize(key)}: ${formatValue(item)}`)
      .join('; ');
  }
  return 'Recorded';
}

function buildHistoryUrl(filters: ActivityHistoryFilterState, cursor?: string | null) {
  const params = new URLSearchParams({ limit: '25' });
  const query = filters.query.trim();
  if (query) params.set('q', query);
  if (filters.category !== 'all') params.set('category', filters.category);
  if (filters.result !== 'all') params.set('result', filters.result);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (cursor) params.set('cursor', cursor);
  return `/api/admin/activity-history?${params.toString()}`;
}

export default function ActivityHistoryScreen({ className }: ActivityHistoryScreenProps) {
  const [filters, setFilters] = useState<ActivityHistoryFilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<ActivityHistoryFilterState>(DEFAULT_FILTERS);
  const [events, setEvents] = useState<AuditEventListItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detail, setDetail] = useState<AuditEventDetail | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(buildHistoryUrl(appliedFilters), {
          credentials: 'same-origin',
          cache: 'no-store',
          signal: controller.signal,
        });
        const result = (await response.json()) as ActivityHistoryListResponse;
        if (!response.ok || !result.events) {
          setEvents([]);
          setNextCursor(null);
          setError(result.error ?? 'Activity History could not be loaded.');
          return;
        }
        setEvents(result.events);
        setNextCursor(result.nextCursor ?? null);
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setEvents([]);
        setNextCursor(null);
        setError('Activity History could not be loaded. Check your connection and try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, [appliedFilters]);

  const openDetails = async (eventId: string) => {
    setDetail(null);
    setDetailError('');
    setDetailOpen(true);
    setDetailLoading(true);

    try {
      const response = await fetch(`/api/admin/activity-history/${encodeURIComponent(eventId)}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const result = (await response.json()) as ActivityHistoryDetailResponse;
      if (!response.ok || !result.event) {
        setDetailError(result.error ?? 'This activity could not be loaded.');
        return;
      }
      setDetail(result.event);
    } catch {
      setDetailError('This activity could not be loaded. Check your connection and try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: readonly AdminDataColumn<AuditEventListItem>[] = [
  {
    key: 'time',
    label: 'Time',
    render: (event) => formatDateTime(event.occurredAt),
  },
  {
    key: 'person',
    label: 'Person',
    render: (event) => (
      <PersonCopy>
        <PersonName>{event.actorName}</PersonName>
        <PersonRole>{humanize(event.actorRole)}</PersonRole>
      </PersonCopy>
    ),
  },
  {
    key: 'activity',
    label: 'What happened',
    render: (event) => <ActivitySummary>{event.summary}</ActivitySummary>,
  },
  {
    key: 'target',
    label: 'Affected record',
    render: (event) => (
      <TargetCopy>
        <TargetName>{event.targetLabel ?? 'System'}</TargetName>
        <TargetType>{event.targetType ? humanize(event.targetType) : 'No record'}</TargetType>
      </TargetCopy>
    ),
  },
  {
    key: 'area',
    label: 'Area',
    render: (event) => categoryLabel[event.category] ?? humanize(event.category),
  },
  {
    key: 'result',
    label: 'Result',
    render: (event) => (
      <StatusText tone={resultTone(event.result)}>{humanize(event.result)}</StatusText>
    ),
  },
  {
    key: 'view',
    label: 'Details',
    render: (event) => (
      <ViewButton onClick={() => void openDetails(event.eventId)} variant="text">
        View
      </ViewButton>
    ),
  },
  ];

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError('');

    try {
      const response = await fetch(buildHistoryUrl(appliedFilters, nextCursor), {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const result = (await response.json()) as ActivityHistoryListResponse;
      const nextEvents = result.events;
      if (!response.ok || !nextEvents) {
        setError(result.error ?? 'More activity could not be loaded.');
        return;
      }
      setEvents((current) => [...current, ...nextEvents]);
      setNextCursor(result.nextCursor ?? null);
    } catch {
      setError('More activity could not be loaded. Check your connection and try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const submitFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters({ ...filters, query: filters.query.trim() });
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const changeEntries = detail ? Object.entries(detail.changes) : [];
  const detailEntries = detail ? Object.entries(detail.details) : [];

  return (
    <Root aria-busy={loading} className={className}>
      <AdminPageHeader
        description="A record of important actions made in the system. Entries explain who did what, what changed, and whether the action succeeded."
        title="Activity History"
      />

      <FilterSection>
        <FilterForm onSubmit={submitFilters}>
          <SearchField
            label="Search activity"
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="Person, account, or action"
            value={filters.query}
          />
          <FilterField
            label="Area"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value as ActivityHistoryFilterState['category'],
              }))
            }
            select
            value={filters.category}
          >
            <FilterOption value="all">All areas</FilterOption>
            {AUDIT_CATEGORIES.map((category) => (
              <FilterOption key={category} value={category}>
                {categoryLabel[category] ?? humanize(category)}
              </FilterOption>
            ))}
          </FilterField>
          <FilterField
            label="Result"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                result: event.target.value as ActivityHistoryFilterState['result'],
              }))
            }
            select
            value={filters.result}
          >
            <FilterOption value="all">All results</FilterOption>
            {AUDIT_RESULTS.map((result) => (
              <FilterOption key={result} value={result}>
                {humanize(result)}
              </FilterOption>
            ))}
          </FilterField>
          <FilterField
            label="From"
            onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            type="date"
            value={filters.from}
          />
          <FilterField
            label="To"
            onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            type="date"
            value={filters.to}
          />
          <FilterActions>
            <ApplyButton startIcon={<Search aria-hidden="true" />} type="submit" variant="contained">
              Search
            </ApplyButton>
            <ClearButton onClick={clearFilters} type="button" variant="text">
              Clear
            </ClearButton>
          </FilterActions>
        </FilterForm>
        <ResultBar>
          <ResultText aria-live="polite">
            {loading ? 'Loading activity…' : `${events.length} ${events.length === 1 ? 'entry' : 'entries'} shown`}
          </ResultText>
          <ResultText>Times are shown in Philippine time.</ResultText>
        </ResultBar>
      </FilterSection>

      {error ? <Notice tone="error" title="Activity History unavailable">{error}</Notice> : null}

      {!loading && events.length === 0 && !error ? (
        <EmptyState
          description="Try a wider date range or remove some filters. New important system actions will appear here automatically."
          icon={<History />}
          title="No matching activity"
        />
      ) : null}

      {events.length > 0 ? (
        <AdminDataTable
          ariaLabel="System activity history"
          columns={columns}
          getRowKey={(event) => event.eventId}
          rows={events}
        />
      ) : null}

      {nextCursor ? (
        <LoadMoreWrap>
          <LoadMoreButton disabled={loadingMore} onClick={() => void loadMore()} variant="outlined">
            {loadingMore ? 'Loading…' : 'Load older activity'}
          </LoadMoreButton>
        </LoadMoreWrap>
      ) : null}

      <DetailDrawer
        anchor="right"
        onClose={() => setDetailOpen(false)}
        open={detailOpen}
        slotProps={{
          paper: {
            'aria-labelledby': 'activity-history-detail-title',
            role: 'dialog',
          },
        }}
      >
        <DetailShell>
          <DetailHeader>
            <div>
              <DetailTitle id="activity-history-detail-title">Activity details</DetailTitle>
              <DetailLead>
                {detail?.summary ?? (detailLoading ? 'Loading activity details…' : 'Review this activity record.')}
              </DetailLead>
            </div>
            <CloseButton aria-label="Close activity details" onClick={() => setDetailOpen(false)}>
              <X aria-hidden="true" />
            </CloseButton>
          </DetailHeader>

          <DetailBody>
            {detailError ? <Notice tone="error">{detailError}</Notice> : null}

            {detail ? (
              <>
                <DetailSection>
                  <DetailSectionTitle>What happened</DetailSectionTitle>
                  <DetailGrid>
                    <DetailTerm>Result</DetailTerm>
                    <DetailValue><StatusText tone={resultTone(detail.result)}>{humanize(detail.result)}</StatusText></DetailValue>
                    <DetailTerm>When</DetailTerm>
                    <DetailValue>{formatDateTime(detail.occurredAt)}</DetailValue>
                    <DetailTerm>Area</DetailTerm>
                    <DetailValue>{categoryLabel[detail.category] ?? humanize(detail.category)}</DetailValue>
                    <DetailTerm>Source</DetailTerm>
                    <DetailValue>{sourceLabel[detail.source] ?? humanize(detail.source)}</DetailValue>
                    {detail.reason ? (
                      <>
                        <DetailTerm>Reason</DetailTerm>
                        <DetailValue>{detail.reason}</DetailValue>
                      </>
                    ) : null}
                  </DetailGrid>
                </DetailSection>

                <DetailSection>
                  <DetailSectionTitle>People and records</DetailSectionTitle>
                  <DetailGrid>
                    <DetailTerm>Person</DetailTerm>
                    <DetailValue>{detail.actorName} ({humanize(detail.actorRole)})</DetailValue>
                    <DetailTerm>Affected record</DetailTerm>
                    <DetailValue>{detail.targetLabel ?? 'System'}</DetailValue>
                    {detail.targetId ? (
                      <>
                        <DetailTerm>Record reference</DetailTerm>
                        <DetailValue>{detail.targetId}</DetailValue>
                      </>
                    ) : null}
                  </DetailGrid>
                </DetailSection>

                <DetailSection>
                  <DetailSectionTitle>Changes</DetailSectionTitle>
                  {changeEntries.length > 0 ? (
                    <ChangeList>
                      {changeEntries.map(([field, change]) => (
                        <ChangeRow key={field}>
                          <ChangeField>{humanize(field)}</ChangeField>
                          <ChangeValue>Before: {formatValue(change.before)}</ChangeValue>
                          <ChangeValue>After: {formatValue(change.after)}</ChangeValue>
                        </ChangeRow>
                      ))}
                    </ChangeList>
                  ) : (
                    <MutedCopy>No before-and-after field changes were needed for this event.</MutedCopy>
                  )}
                </DetailSection>

                {detailEntries.length > 0 ? (
                  <DetailSection>
                    <DetailSectionTitle>Additional details</DetailSectionTitle>
                    <DetailGrid>
                      {detailEntries.map(([field, value]) => (
                        <Fragment key={field}>
                          <DetailTerm>{humanize(field)}</DetailTerm>
                          <DetailValue>{formatValue(value)}</DetailValue>
                        </Fragment>
                      ))}
                    </DetailGrid>
                  </DetailSection>
                ) : null}

                <DetailSection>
                  <DetailSectionTitle>Traceability</DetailSectionTitle>
                  <DetailGrid>
                    <DetailTerm>Trace reference</DetailTerm>
                    <DetailValue>{detail.requestId}</DetailValue>
                    <DetailTerm>Event reference</DetailTerm>
                    <DetailValue>{detail.eventId}</DetailValue>
                    <DetailTerm>Event type</DetailTerm>
                    <DetailValue>{detail.eventCode}</DetailValue>
                  </DetailGrid>

                  {detail.clientIp || detail.userAgent ? (
                    <SecurityDetails>
                      <SecuritySummary>Security details</SecuritySummary>
                      <SecurityBody>
                        <DetailGrid>
                          {detail.clientIp ? (
                            <>
                              <DetailTerm>Client IP</DetailTerm>
                              <DetailValue>{detail.clientIp}</DetailValue>
                            </>
                          ) : null}
                          {detail.userAgent ? (
                            <>
                              <DetailTerm>Browser or device</DetailTerm>
                              <DetailValue>{detail.userAgent}</DetailValue>
                            </>
                          ) : null}
                        </DetailGrid>
                      </SecurityBody>
                    </SecurityDetails>
                  ) : null}
                </DetailSection>
              </>
            ) : null}
          </DetailBody>
        </DetailShell>
      </DetailDrawer>
    </Root>
  );
}
