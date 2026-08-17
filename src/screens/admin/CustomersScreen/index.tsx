'use client';

import { Eye, Pencil, Power } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { updateCustomerProfileSchema } from '@/lib/admin/validation';
import type { ProfileStatus, SupabaseProfile } from '@/lib/auth/types';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminEntityActionMenu from '../components/AdminEntityActionMenu';
import AdminFormDialog from '../components/AdminFormDialog';
import AdminMetricStrip from '../components/AdminMetricStrip';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDate, getStatusTone, humanize } from '../utils';
import {
  EditField,
  EditForm,
  EditOption,
  FilterField,
  FilterOption,
  Pagination,
  PaginationActions,
  PaginationButton,
  PaginationText,
  Root,
  SearchButton,
  SearchField,
  TableLink,
  ToolbarForm,
} from './elements';
import type { CustomerStatusFilter, CustomersScreenProps } from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

export default function CustomersScreen({ className, filters, initialData }: CustomersScreenProps) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.query);
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>(filters.status ?? 'all');
  const [editingCustomer, setEditingCustomer] = useState<SupabaseProfile | null>(null);
  const [pendingStatusCustomer, setPendingStatusCustomer] = useState<SupabaseProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<ProfileStatus>('active');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const metrics = [
    { label: 'Customers', value: initialData.customerCount },
    { label: 'Active accounts', value: initialData.activeCount, tone: 'success' as const },
    { label: 'Inactive accounts', value: initialData.inactiveCount, tone: 'warning' as const },
  ];

  const navigateWithFilters = (nextPage = 1) => {
    const params = new URLSearchParams();
    const normalizedQuery = query.trim();
    if (normalizedQuery) params.set('q', normalizedQuery);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (nextPage > 1) params.set('page', String(nextPage));
    const suffix = params.toString();
    router.push(suffix ? `/admin/customers?${suffix}` : '/admin/customers');
  };

  const openEdit = (customer: SupabaseProfile) => {
    setEditingCustomer(customer);
    setDisplayName(customer.full_name);
    setPhone(customer.phone);
    setStatus(customer.status);
    setFormError('');
  };

  const saveCustomer = async (
    customer: SupabaseProfile,
    nextValues: { fullName: string; phone: string; status: ProfileStatus },
  ) => {
    const parsed = updateCustomerProfileSchema.safeParse(nextValues);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Check the customer details and try again.');
      return false;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/customers/${encodeURIComponent(customer.id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as { error?: string; customer?: SupabaseProfile };
      if (!response.ok || !result.customer) {
        setFormError(result.error ?? 'The customer could not be updated.');
        return false;
      }

      setFeedback({
        tone: 'success',
        title: 'Customer updated',
        message: `${result.customer.full_name}'s account details are up to date.`,
      });
      router.refresh();
      return true;
    } catch {
      setFormError('The customer could not be updated. Check your connection and try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const columns: readonly AdminDataColumn<SupabaseProfile>[] = [
    {
      key: 'customer',
      label: 'Customer',
      render: (customer) => (
        <TableLink href={`/admin/customers/${customer.id}`}>{customer.full_name}</TableLink>
      ),
    },
    { key: 'email', label: 'Email', render: (customer) => customer.email },
    { key: 'contact', label: 'Contact', render: (customer) => customer.phone },
    { key: 'created', label: 'Registered', render: (customer) => formatDate(customer.created_at) },
    {
      key: 'status',
      label: 'Account state',
      render: (customer) => (
        <StatusText tone={getStatusTone(customer.status)}>{humanize(customer.status)}</StatusText>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (customer) => (
        <AdminEntityActionMenu
          actions={[
            {
              label: 'View customer',
              icon: Eye,
              onSelect: () => router.push(`/admin/customers/${customer.id}`),
            },
            {
              label: 'Edit account',
              icon: Pencil,
              onSelect: () => openEdit(customer),
            },
            {
              label: customer.status === 'active' ? 'Deactivate account' : 'Activate account',
              icon: Power,
              onSelect: () => {
                setFormError('');
                setPendingStatusCustomer(customer);
              },
            },
          ]}
          ariaLabel={`Actions for ${customer.full_name}`}
        />
      ),
    },
  ];

  const submitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCustomer) return;
    const ok = await saveCustomer(editingCustomer, { fullName: displayName, phone, status });
    if (ok) setEditingCustomer(null);
  };

  const confirmStatus = async () => {
    if (!pendingStatusCustomer) return;
    const nextStatus: ProfileStatus = pendingStatusCustomer.status === 'active' ? 'inactive' : 'active';
    const ok = await saveCustomer(pendingStatusCustomer, {
      fullName: pendingStatusCustomer.full_name,
      phone: pendingStatusCustomer.phone,
      status: nextStatus,
    });
    if (ok) setPendingStatusCustomer(null);
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Review live customer profiles and manage their account state."
        title="Customers"
      />

      <AdminMetricStrip ariaLabel="Customer summary" items={metrics} />

      {feedback ? (
        <Notice title={feedback.title} tone={feedback.tone}>
          {feedback.message}
        </Notice>
      ) : null}

      <ToolbarForm
        onSubmit={(event) => {
          event.preventDefault();
          navigateWithFilters(1);
        }}
      >
        <SearchField
          label="Search name, email, or contact"
          onChange={(event) => setQuery(event.target.value)}
          value={query}
        />
        <FilterField
          label="Account state"
          onChange={(event) => setStatusFilter(event.target.value as CustomerStatusFilter)}
          select
          value={statusFilter}
        >
          <FilterOption value="all">All states</FilterOption>
          <FilterOption value="active">Active</FilterOption>
          <FilterOption value="inactive">Inactive</FilterOption>
        </FilterField>
        <SearchButton type="submit" variant="outlined">Apply</SearchButton>
      </ToolbarForm>

      {initialData.profiles.length ? (
        <AdminDataTable
          ariaLabel="Customer records"
          columns={columns}
          getRowKey={(customer) => customer.id}
          rows={initialData.profiles}
        />
      ) : (
        <EmptyState
          description="Try another customer name, email, contact number, or account state."
          title="No customers match these filters"
        />
      )}

      <Pagination>
        <PaginationText>
          Page {initialData.page} of {initialData.pageCount}. {initialData.totalCount} matching customers.
        </PaginationText>
        <PaginationActions>
          <PaginationButton
            disabled={initialData.page <= 1}
            onClick={() => navigateWithFilters(initialData.page - 1)}
            variant="outlined"
          >
            Previous
          </PaginationButton>
          <PaginationButton
            disabled={initialData.page >= initialData.pageCount}
            onClick={() => navigateWithFilters(initialData.page + 1)}
            variant="outlined"
          >
            Next
          </PaginationButton>
        </PaginationActions>
      </Pagination>

      <AdminFormDialog
        description="Update the customer's name, contact number, or account state. The login email stays unchanged here."
        formId="customer-edit-form"
        onClose={() => {
          if (saving) return;
          setEditingCustomer(null);
          setFormError('');
        }}
        open={Boolean(editingCustomer)}
        submitDisabled={saving}
        submitLabel={saving ? 'Saving...' : 'Save customer'}
        title={editingCustomer ? `Edit ${editingCustomer.full_name}` : 'Edit customer'}
      >
        <EditForm id="customer-edit-form" onSubmit={submitEdit}>
          {formError ? <Notice title="Customer not updated" tone="error">{formError}</Notice> : null}
          <EditField
            label="Customer name"
            onChange={(event) => setDisplayName(event.target.value)}
            required
            value={displayName}
          />
          <EditField
            disabled
            label="Login email"
            value={editingCustomer?.email ?? ''}
          />
          <EditField
            label="Contact number"
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
            required
            value={phone}
          />
          <EditField
            label="Account state"
            onChange={(event) => setStatus(event.target.value as ProfileStatus)}
            select
            value={status}
          >
            <EditOption value="active">Active</EditOption>
            <EditOption value="inactive">Inactive</EditOption>
          </EditField>
        </EditForm>
      </AdminFormDialog>

      <AdminConfirmDialog
        confirmLabel={pendingStatusCustomer?.status === 'active' ? 'Deactivate account' : 'Activate account'}
        confirmTone="primary"
        description={
          pendingStatusCustomer?.status === 'active'
            ? 'This customer will no longer be able to use the Customer workspace until the account is activated again.'
            : 'This customer will be able to use the Customer workspace again.'
        }
        onClose={() => {
          if (saving) return;
          setPendingStatusCustomer(null);
          setFormError('');
        }}
        onConfirm={confirmStatus}
        open={Boolean(pendingStatusCustomer)}
        title={pendingStatusCustomer?.status === 'active' ? 'Deactivate this customer account?' : 'Activate this customer account?'}
      />
    </Root>
  );
}
