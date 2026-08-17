'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { createManagedAccountSchema } from '@/lib/admin/validation';
import type { SupabaseProfile } from '@/lib/auth/types';
import type { UserRole } from '@/types';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminFormDialog from '../components/AdminFormDialog';
import AdminMetricStrip from '../components/AdminMetricStrip';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDate, getStatusTone, humanize } from '../utils';
import {
  CreateButton,
  FilterField,
  FilterOption,
  Form,
  FormField,
  FormOption,
  Pagination,
  PaginationActions,
  PaginationButton,
  PaginationText,
  Root,
  SearchButton,
  SearchField,
  ToolbarForm,
} from './elements';
import type {
  AccountRoleFilter,
  AccountStatusFilter,
  AccountsScreenProps,
} from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

const roleTone = (role: UserRole) => {
  if (role === 'admin') return 'water' as const;
  if (role === 'deliverer') return 'gas' as const;
  return 'neutral' as const;
};

export default function AccountsScreen({ className, filters, initialData }: AccountsScreenProps) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.query);
  const [roleFilter, setRoleFilter] = useState<AccountRoleFilter>(filters.role ?? 'all');
  const [statusFilter, setStatusFilter] = useState<AccountStatusFilter>(filters.status ?? 'all');
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [formError, setFormError] = useState('');

  const metrics = [
    { label: 'Customers', value: initialData.customerCount },
    { label: 'Deliverers', value: initialData.delivererCount, tone: 'gas' as const },
    { label: 'Administrators', value: initialData.adminCount, tone: 'water' as const },
    { label: 'Inactive accounts', value: initialData.inactiveCount, tone: 'warning' as const },
  ];

  const columns: readonly AdminDataColumn<SupabaseProfile>[] = [
    { key: 'name', label: 'Name', render: (account) => account.full_name },
    { key: 'email', label: 'Email', render: (account) => account.email },
    { key: 'phone', label: 'Contact', render: (account) => account.phone || 'Not set' },
    {
      key: 'role',
      label: 'Role',
      render: (account) => <StatusText tone={roleTone(account.role)}>{humanize(account.role)}</StatusText>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (account) => (
        <StatusText tone={getStatusTone(account.status)}>{humanize(account.status)}</StatusText>
      ),
    },
    { key: 'created', label: 'Created', render: (account) => formatDate(account.created_at) },
  ];

  const navigateWithFilters = (nextPage = 1) => {
    const params = new URLSearchParams();
    const normalizedQuery = query.trim();
    if (normalizedQuery) params.set('q', normalizedQuery);
    if (roleFilter !== 'all') params.set('role', roleFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (nextPage > 1) params.set('page', String(nextPage));
    const suffix = params.toString();
    router.push(suffix ? `/admin/accounts?${suffix}` : '/admin/accounts');
  };

  const resetCreateForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('customer');
    setFormError('');
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const parsed = createManagedAccountSchema.safeParse({
      email,
      fullName,
      password,
      phone,
      role,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Check the account details and try again.');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/admin/accounts', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as { error?: string; account?: SupabaseProfile };

      if (!response.ok || !result.account) {
        setFormError(result.error ?? 'The account could not be created.');
        return;
      }

      setFeedback({
        tone: 'success',
        title: 'Account created',
        message: `${result.account.full_name} can now sign in as ${humanize(result.account.role)}.`,
      });
      setCreateOpen(false);
      resetCreateForm();
      router.refresh();
    } catch {
      setFormError('The account could not be created. Check your connection and try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        actions={
          <CreateButton onClick={() => setCreateOpen(true)} startIcon={<Plus aria-hidden="true" />} variant="contained">
            Create account
          </CreateButton>
        }
        description="Create and review Customer, Deliverer, and Admin accounts."
        title="Accounts"
      />

      <AdminMetricStrip ariaLabel="Account summary" items={metrics} />

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
          label="Role"
          onChange={(event) => setRoleFilter(event.target.value as AccountRoleFilter)}
          select
          value={roleFilter}
        >
          <FilterOption value="all">All roles</FilterOption>
          <FilterOption value="customer">Customer</FilterOption>
          <FilterOption value="deliverer">Deliverer</FilterOption>
          <FilterOption value="admin">Admin</FilterOption>
        </FilterField>
        <FilterField
          label="Status"
          onChange={(event) => setStatusFilter(event.target.value as AccountStatusFilter)}
          select
          value={statusFilter}
        >
          <FilterOption value="all">All statuses</FilterOption>
          <FilterOption value="active">Active</FilterOption>
          <FilterOption value="inactive">Inactive</FilterOption>
        </FilterField>
        <SearchButton type="submit" variant="outlined">Apply</SearchButton>
      </ToolbarForm>

      {initialData.profiles.length ? (
        <AdminDataTable
          ariaLabel="Managed accounts"
          columns={columns}
          getRowKey={(account) => account.id}
          rows={initialData.profiles}
        />
      ) : (
        <EmptyState
          description="Try a different search or filter."
          title="No accounts match these filters"
        />
      )}

      <Pagination>
        <PaginationText>
          Page {initialData.page} of {initialData.pageCount}. {initialData.totalCount} matching accounts.
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
        description="Set the account details and choose the role this person will use when signing in."
        formId="admin-create-account-form"
        onClose={() => {
          if (creating) return;
          setCreateOpen(false);
          resetCreateForm();
        }}
        open={createOpen}
        submitDisabled={creating}
        submitLabel={creating ? 'Creating account...' : 'Create account'}
        title="Create account"
      >
        <Form id="admin-create-account-form" onSubmit={handleCreate}>
          {formError ? <Notice title="Account not created" tone="error">{formError}</Notice> : null}
          <FormField
            autoComplete="name"
            label="Full name"
            onChange={(event) => setFullName(event.target.value)}
            required
            value={fullName}
          />
          <FormField
            autoComplete="email"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <FormField
            autoComplete="new-password"
            helperText="Use at least 8 characters."
            label="Temporary password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <FormField
            helperText={role === 'customer' ? 'Required for Customer accounts.' : 'Optional for this role.'}
            label="Contact number"
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
            required={role === 'customer'}
            value={phone}
          />
          <FormField
            label="Role"
            onChange={(event) => setRole(event.target.value as UserRole)}
            select
            value={role}
          >
            <FormOption value="customer">Customer</FormOption>
            <FormOption value="deliverer">Deliverer</FormOption>
            <FormOption value="admin">Admin</FormOption>
          </FormField>
        </Form>
      </AdminFormDialog>
    </Root>
  );
}
