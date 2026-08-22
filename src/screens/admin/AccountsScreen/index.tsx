'use client';

import { Eye, Pencil, Plus, Power, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import {
  createManagedAccountSchema,
  deleteManagedAccountSchema,
  updateManagedProfileSchema,
} from '@/lib/admin/validation';
import { signOutCurrentUser } from '@/lib/auth/client';
import type {
  OnboardingStage,
  ProfileStatus,
  SupabaseProfile,
} from '@/lib/auth/types';
import { useAppStore } from '@/store';
import type { UserRole } from '@/types';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminEntityActionMenu from '../components/AdminEntityActionMenu';
import type { AdminEntityAction } from '../components/AdminEntityActionMenu/interface';
import AdminFormDialog from '../components/AdminFormDialog';
import AdminMetricStrip from '../components/AdminMetricStrip';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDate, getStatusTone, humanize } from '../utils';
import {
  CreateButton,
  DeleteAccountMeta,
  DeleteAccountName,
  DeleteSummary,
  DeleteWarning,
  FilterField,
  FilterOption,
  Form,
  FormField,
  FormOption,
  Pagination,
  PaginationActions,
  PaginationButton,
  PaginationText,
  RoleSwitchButton,
  RoleSwitcher,
  Root,
  SearchButton,
  SearchField,
  TableLink,
  ToolbarForm,
} from './elements';
import type {
  AccountRoleFilter,
  AccountSetupFilter,
  AccountStatusFilter,
  AccountsScreenProps,
} from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

const roleTone = (role: UserRole) => {
  if (role === 'admin') return 'water' as const;
  if (role === 'deliverer') return 'gas' as const;
  return 'neutral' as const;
};

const setupLabel = (stage: OnboardingStage) => {
  if (stage === 'password_required') return 'Password required';
  if (stage === 'profile_required') return 'Details required';
  return 'Ready';
};

export default function AccountsScreen({
  className,
  currentActorId,
  filters,
  initialData,
}: AccountsScreenProps) {
  const router = useRouter();
  const clearAuthSession = useAppStore((state) => state.commands.signOut);
  const [query, setQuery] = useState(filters.query);
  const [roleFilter, setRoleFilter] = useState<AccountRoleFilter>(filters.role ?? 'all');
  const [statusFilter, setStatusFilter] = useState<AccountStatusFilter>(filters.status ?? 'all');
  const [setupFilter, setSetupFilter] = useState<AccountSetupFilter>(filters.setup ?? 'all');

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [createError, setCreateError] = useState('');

  const [editingAccount, setEditingAccount] = useState<SupabaseProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<ProfileStatus>('active');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [pendingStatusAccount, setPendingStatusAccount] = useState<SupabaseProfile | null>(null);

  const [deletingAccount, setDeletingAccount] = useState<SupabaseProfile | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteEmailConfirmation, setDeleteEmailConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const allAccountCount =
    initialData.customerCount + initialData.delivererCount + initialData.adminCount;

  const metrics = [
    { label: 'All accounts', value: allAccountCount },
    { label: 'Customers', value: initialData.customerCount },
    { label: 'Deliverers', value: initialData.delivererCount, tone: 'gas' as const },
    { label: 'Administrators', value: initialData.adminCount, tone: 'water' as const },
  ];

  const roleViews: readonly { label: string; value: AccountRoleFilter }[] = [
    { label: `All ${allAccountCount}`, value: 'all' },
    { label: `Customers ${initialData.customerCount}`, value: 'customer' },
    { label: `Deliverers ${initialData.delivererCount}`, value: 'deliverer' },
    { label: `Administrators ${initialData.adminCount}`, value: 'admin' },
  ];

  const navigateWithFilters = (
    nextPage = 1,
    nextRole: AccountRoleFilter = roleFilter,
  ) => {
    const params = new URLSearchParams();
    const normalizedQuery = query.trim();
    if (normalizedQuery) params.set('q', normalizedQuery);
    if (nextRole !== 'all') params.set('role', nextRole);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (setupFilter !== 'all') params.set('setup', setupFilter);
    if (nextPage > 1) params.set('page', String(nextPage));
    const suffix = params.toString();
    router.push(suffix ? `/admin/accounts?${suffix}` : '/admin/accounts');
  };

  const changeRoleView = (nextRole: AccountRoleFilter) => {
    setRoleFilter(nextRole);
    navigateWithFilters(1, nextRole);
  };

  const resetCreateForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('customer');
    setCreateError('');
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError('');

    const parsed = createManagedAccountSchema.safeParse({
      email,
      fullName,
      password,
      phone,
      role,
    });

    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? 'Check the account details and try again.');
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
        setCreateError(result.error ?? 'The account could not be created.');
        return;
      }

      setFeedback({
        tone: 'success',
        title: 'Account created',
        message: `${result.account.full_name} can sign in with the temporary password and complete first-login setup.`,
      });
      setCreateOpen(false);
      resetCreateForm();
      router.refresh();
    } catch {
      setCreateError('The account could not be created. Check your connection and try again.');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (account: SupabaseProfile) => {
    setEditingAccount(account);
    setEditName(account.full_name);
    setEditPhone(account.phone);
    setEditStatus(account.status);
    setEditError('');
  };

  const saveAccount = async (
    account: SupabaseProfile,
    nextValues: { fullName: string; phone: string; status: ProfileStatus },
  ) => {
    const parsed = updateManagedProfileSchema.safeParse(nextValues);
    if (!parsed.success) {
      setEditError(parsed.error.issues[0]?.message ?? 'Check the account details and try again.');
      return false;
    }

    if (
      account.role === 'customer' &&
      account.onboarding_stage === 'complete' &&
      !/^09\d{9}$/.test(parsed.data.phone)
    ) {
      setEditError('A completed Customer account needs a mobile number in 09XXXXXXXXX format.');
      return false;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/accounts/${encodeURIComponent(account.id)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as { error?: string; account?: SupabaseProfile };

      if (!response.ok || !result.account) {
        setEditError(result.error ?? 'The account could not be updated.');
        return false;
      }

      setFeedback({
        tone: 'success',
        title: 'Account updated',
        message: `${result.account.full_name}'s account details are up to date.`,
      });
      router.refresh();
      return true;
    } catch {
      setEditError('The account could not be updated. Check your connection and try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const submitEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingAccount) return;

    const saved = await saveAccount(editingAccount, {
      fullName: editName,
      phone: editPhone,
      status: editStatus,
    });
    if (saved) {
      setEditingAccount(null);
      setEditError('');
    }
  };

  const confirmStatus = async () => {
    if (!pendingStatusAccount) return;
    setEditError('');
    const nextStatus: ProfileStatus = pendingStatusAccount.status === 'active' ? 'inactive' : 'active';
    const saved = await saveAccount(pendingStatusAccount, {
      fullName: pendingStatusAccount.full_name,
      phone: pendingStatusAccount.phone,
      status: nextStatus,
    });
    if (saved) {
      setPendingStatusAccount(null);
      setEditError('');
    }
  };

  const openDelete = (account: SupabaseProfile) => {
    setDeletingAccount(account);
    setDeletePassword('');
    setDeleteEmailConfirmation('');
    setDeleteError('');
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeletingAccount(null);
    setDeletePassword('');
    setDeleteEmailConfirmation('');
    setDeleteError('');
  };

  const submitDelete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deletingAccount) return;
    setDeleteError('');

    const selfAdminDelete =
      deletingAccount.role === 'admin' && deletingAccount.id === currentActorId;

    if (selfAdminDelete && initialData.activeAdminCount <= 1) {
      setDeleteError('Create or activate another Administrator before deleting this account.');
      return;
    }

    if (
      selfAdminDelete &&
      deleteEmailConfirmation.trim().toLowerCase() !== deletingAccount.email.toLowerCase()
    ) {
      setDeleteError('Type your administrator email exactly to confirm account deletion.');
      return;
    }

    const payload = selfAdminDelete
      ? {
          confirmationEmail: deleteEmailConfirmation,
          currentPassword: deletePassword,
        }
      : { currentPassword: deletePassword };

    const parsed = deleteManagedAccountSchema.safeParse(payload);
    if (!parsed.success) {
      setDeleteError(parsed.error.issues[0]?.message ?? 'Check the deletion confirmation and try again.');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/accounts/${encodeURIComponent(deletingAccount.id)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = (await response.json()) as {
        deleted?: boolean;
        error?: string;
        selfDeleted?: boolean;
      };

      if (!response.ok || !result.deleted) {
        setDeleteError(result.error ?? 'The account could not be deleted.');
        return;
      }

      if (result.selfDeleted) {
        try {
          await signOutCurrentUser();
        } catch {
          // The Auth user has already been removed. Local state is cleared below.
        }
        clearAuthSession();
        router.replace('/login');
        router.refresh();
        return;
      }

      setFeedback({
        tone: 'success',
        title: 'Account deleted',
        message: `${deletingAccount.full_name}'s login account was permanently removed.`,
      });
      closeDelete();
      router.refresh();
    } catch {
      setDeleteError('The account could not be deleted. Check your connection and try again.');
    } finally {
      setDeleting(false);
    }
  };

  const actionsFor = (account: SupabaseProfile): readonly AdminEntityAction[] => {
    const actions: AdminEntityAction[] = [
      {
        icon: Eye,
        label: 'View account',
        onSelect: () => router.push(`/admin/accounts/${account.id}`),
      },
    ];

    if (account.role !== 'admin') {
      actions.push(
        {
          icon: Pencil,
          label: 'Edit account',
          onSelect: () => openEdit(account),
        },
        {
          icon: Power,
          label: account.status === 'active' ? 'Deactivate account' : 'Activate account',
          onSelect: () => {
            setEditError('');
            setPendingStatusAccount(account);
          },
        },
        {
          icon: Trash2,
          label: 'Delete account',
          onSelect: () => openDelete(account),
          tone: 'danger',
        },
      );
    } else if (account.id === currentActorId) {
      actions.push({
        disabled: initialData.activeAdminCount <= 1,
        icon: Trash2,
        label:
          initialData.activeAdminCount <= 1
            ? 'Delete unavailable: last admin'
            : 'Delete my account',
        onSelect: () => openDelete(account),
        tone: 'danger',
      });
    }

    return actions;
  };

  const columns: readonly AdminDataColumn<SupabaseProfile>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (account) => (
        <TableLink href={`/admin/accounts/${account.id}`}>{account.full_name}</TableLink>
      ),
    },
    { key: 'email', label: 'Email', render: (account) => account.email },
    { key: 'phone', label: 'Contact', render: (account) => account.phone || 'Not set' },
    {
      key: 'role',
      label: 'Role',
      render: (account) => (
        <StatusText tone={roleTone(account.role)}>{humanize(account.role)}</StatusText>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (account) => (
        <StatusText tone={getStatusTone(account.status)}>{humanize(account.status)}</StatusText>
      ),
    },
    {
      key: 'setup',
      label: 'Setup',
      render: (account) => (
        <StatusText tone={account.onboarding_stage === 'complete' ? 'success' : 'warning'}>
          {setupLabel(account.onboarding_stage)}
        </StatusText>
      ),
    },
    { key: 'created', label: 'Created', render: (account) => formatDate(account.created_at) },
    {
      align: 'right',
      key: 'actions',
      label: 'Actions',
      render: (account) => (
        <AdminEntityActionMenu
          actions={actionsFor(account)}
          ariaLabel={`Actions for ${account.full_name}`}
        />
      ),
    },
  ];

  return (
    <Root className={className}>
      <AdminPageHeader
        actions={
          <CreateButton
            onClick={() => setCreateOpen(true)}
            startIcon={<Plus aria-hidden="true" />}
            variant="contained"
          >
            Create account
          </CreateButton>
        }
        description="One directory for every Customer, Deliverer, and Administrator login account."
        title="Accounts"
      />

      <AdminMetricStrip ariaLabel="Account summary" items={metrics} />

      {feedback ? (
        <Notice title={feedback.title} tone={feedback.tone}>
          {feedback.message}
        </Notice>
      ) : null}

      <RoleSwitcher aria-label="Account role view">
        {roleViews.map((view) => (
          <RoleSwitchButton
            $active={roleFilter === view.value}
            aria-pressed={roleFilter === view.value}
            key={view.value}
            onClick={() => changeRoleView(view.value)}
          >
            {view.label}
          </RoleSwitchButton>
        ))}
      </RoleSwitcher>

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
          label="Status"
          onChange={(event) => setStatusFilter(event.target.value as AccountStatusFilter)}
          select
          value={statusFilter}
        >
          <FilterOption value="all">All statuses</FilterOption>
          <FilterOption value="active">Active</FilterOption>
          <FilterOption value="inactive">Inactive</FilterOption>
        </FilterField>
        <FilterField
          label="Setup"
          onChange={(event) => setSetupFilter(event.target.value as AccountSetupFilter)}
          select
          value={setupFilter}
        >
          <FilterOption value="all">All setup states</FilterOption>
          <FilterOption value="complete">Ready</FilterOption>
          <FilterOption value="password_required">Password required</FilterOption>
          <FilterOption value="profile_required">Details required</FilterOption>
        </FilterField>
        <SearchButton type="submit" variant="outlined">
          Apply
        </SearchButton>
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
          description="Try a different role view, search, status, or setup filter."
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
        description="Create the account with a temporary password. The user will replace it and finish any missing details on first sign-in."
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
          {createError ? <Notice title="Account not created" tone="error">{createError}</Notice> : null}
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
            helperText="Share this only with the account owner. They must replace it on first sign-in."
            label="Temporary password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <FormField
            helperText="Optional here. If missing, the user will complete it during first-login setup."
            label="Contact number"
            onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
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
            <FormOption value="admin">Administrator</FormOption>
          </FormField>
        </Form>
      </AdminFormDialog>

      <AdminFormDialog
        description="Update the account holder's name, contact number, or account state. Login email and role are intentionally protected here."
        formId="admin-edit-account-form"
        onClose={() => {
          if (saving) return;
          setEditingAccount(null);
          setEditError('');
        }}
        open={Boolean(editingAccount)}
        submitDisabled={saving}
        submitLabel={saving ? 'Saving...' : 'Save account'}
        title={editingAccount ? `Edit ${editingAccount.full_name}` : 'Edit account'}
      >
        <Form id="admin-edit-account-form" onSubmit={submitEdit}>
          {editError ? <Notice title="Account not updated" tone="error">{editError}</Notice> : null}
          <FormField
            label="Full name"
            onChange={(event) => setEditName(event.target.value)}
            required
            value={editName}
          />
          <FormField disabled label="Login email" value={editingAccount?.email ?? ''} />
          <FormField disabled label="Role" value={editingAccount ? humanize(editingAccount.role) : ''} />
          <FormField
            helperText={
              editingAccount?.role === 'customer' && editingAccount.onboarding_stage === 'complete'
                ? 'Required for completed Customer accounts.'
                : 'Optional if this account does not require a contact number yet.'
            }
            label="Contact number"
            onChange={(event) => setEditPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
            required={
              editingAccount?.role === 'customer' && editingAccount.onboarding_stage === 'complete'
            }
            value={editPhone}
          />
          <FormField
            label="Account state"
            onChange={(event) => setEditStatus(event.target.value as ProfileStatus)}
            select
            value={editStatus}
          >
            <FormOption value="active">Active</FormOption>
            <FormOption value="inactive">Inactive</FormOption>
          </FormField>
        </Form>
      </AdminFormDialog>

      <AdminConfirmDialog
        confirmLabel={pendingStatusAccount?.status === 'active' ? 'Deactivate account' : 'Activate account'}
        confirmTone="primary"
        description={
          pendingStatusAccount?.status === 'active'
            ? `This ${pendingStatusAccount ? humanize(pendingStatusAccount.role) : 'user'} will not be able to enter their workspace until the account is activated again.`
            : `This ${pendingStatusAccount ? humanize(pendingStatusAccount.role) : 'user'} will be able to use their workspace again.`
        }
        onClose={() => {
          if (saving) return;
          setPendingStatusAccount(null);
          setEditError('');
        }}
        onConfirm={confirmStatus}
        open={Boolean(pendingStatusAccount)}
        title={pendingStatusAccount?.status === 'active' ? 'Deactivate this account?' : 'Activate this account?'}
      />

      <AdminFormDialog
        description={
          deletingAccount?.role === 'admin'
            ? 'Deleting your Administrator account permanently removes your login and immediately ends your Admin access.'
            : 'Permanent deletion removes this person’s login account. This action cannot be undone.'
        }
        formId="admin-delete-account-form"
        onClose={closeDelete}
        open={Boolean(deletingAccount)}
        submitDisabled={deleting}
        submitLabel={deleting ? 'Deleting account...' : deletingAccount?.role === 'admin' ? 'Delete my account' : 'Delete account'}
        submitTone="danger"
        title={deletingAccount?.role === 'admin' ? 'Delete your Administrator account?' : 'Delete this account?'}
      >
        <Form id="admin-delete-account-form" onSubmit={submitDelete}>
          {deleteError ? <Notice title="Account not deleted" tone="error">{deleteError}</Notice> : null}
          {deletingAccount ? (
            <DeleteSummary>
              <DeleteAccountName>{deletingAccount.full_name}</DeleteAccountName>
              <DeleteAccountMeta>
                {humanize(deletingAccount.role)} · {deletingAccount.email}
              </DeleteAccountMeta>
            </DeleteSummary>
          ) : null}
          {deletingAccount?.role === 'admin' ? (
            <>
              <DeleteWarning>
                At least one other active Administrator must remain after this account is deleted.
              </DeleteWarning>
              <FormField
                autoComplete="off"
                label="Type your administrator email to confirm"
                onChange={(event) => setDeleteEmailConfirmation(event.target.value)}
                required
                type="email"
                value={deleteEmailConfirmation}
              />
            </>
          ) : null}
          <FormField
            autoComplete="current-password"
            helperText="Required to authorize this permanent account deletion."
            label="Your current administrator password"
            onChange={(event) => setDeletePassword(event.target.value)}
            required
            type="password"
            value={deletePassword}
          />
        </Form>
      </AdminFormDialog>
    </Root>
  );
}
