'use client';

import { Eye, Pencil, Power } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import type { Customer, CustomerAccountStatus } from '@/types';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminEntityActionMenu from '../components/AdminEntityActionMenu';
import AdminFormDialog from '../components/AdminFormDialog';
import AdminPageHeader from '../components/AdminPageHeader';
import AdminMetricStrip from '../components/AdminMetricStrip';
import { updateCustomerState } from '../customerState';
import { formatDate, getStatusTone, humanize } from '../utils';
import {
  EditField,
  EditForm,
  EditOption,
  ResetButton,
  Root,
  SearchField,
  TableLink,
  Toolbar,
} from './elements';
import type { CustomersScreenProps } from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

export default function CustomersScreen({ className }: CustomersScreenProps) {
  const router = useRouter();
  const customers = useAppStore((state) => state.customers.records);
  const orders = useAppStore((state) => state.orders.records);
  const loyalty = useAppStore((state) => state.loyalty.accounts);
  const [query, setQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [pendingStatusCustomer, setPendingStatusCustomer] = useState<Customer | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<CustomerAccountStatus>('active');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const customerMetrics = [
    { label: 'Customers', value: customers.length },
    { label: 'Active accounts', value: customers.filter((customer) => customer.status === 'active').length, tone: 'success' as const },
    { label: 'With orders', value: customers.filter((customer) => orders.some((order) => order.customerId === customer.id)).length, tone: 'water' as const },
    { label: 'Inactive accounts', value: customers.filter((customer) => customer.status === 'inactive').length, tone: 'warning' as const },
  ];

  const filteredCustomers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return customers.filter(
      (customer) =>
        !normalized ||
        customer.displayName.toLowerCase().includes(normalized) ||
        customer.email.toLowerCase().includes(normalized) ||
        customer.phonePlaceholder.toLowerCase().includes(normalized),
    );
  }, [customers, query]);

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setDisplayName(customer.displayName);
    setEmail(customer.email);
    setPhone(customer.phonePlaceholder);
    setStatus(customer.status);
  };

  const columns: readonly AdminDataColumn<Customer>[] = [
    {
      key: 'customer',
      label: 'Customer',
      render: (customer) => (
        <TableLink href={`/admin/customers/${customer.id}`}>{customer.displayName}</TableLink>
      ),
    },
    { key: 'contact', label: 'Contact', render: (customer) => customer.phonePlaceholder },
    {
      key: 'orders',
      label: 'Orders',
      align: 'right',
      render: (customer) => orders.filter((order) => order.customerId === customer.id).length,
    },
    {
      key: 'last_order',
      label: 'Last order',
      render: (customer) => {
        const lastOrder = orders
          .filter((order) => order.customerId === customer.id)
          .sort((a, b) => b.placedAt.localeCompare(a.placedAt))[0];
        return lastOrder ? formatDate(lastOrder.placedAt) : 'No orders';
      },
    },
    {
      key: 'loyalty',
      label: 'Loyalty balance',
      align: 'right',
      render: (customer) =>
        loyalty.find((account) => account.customerId === customer.id)?.pointsAvailable ?? 0,
    },
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
              onSelect: () => setPendingStatusCustomer(customer),
            },
          ]}
          ariaLabel={`Actions for ${customer.displayName}`}
        />
      ),
    },
  ];

  const submitEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCustomer) return;
    const result = updateCustomerState(editingCustomer.id, {
      displayName,
      email,
      phonePlaceholder: phone,
      status,
    });
    if (!result.ok) {
      setFeedback({ tone: 'error', title: 'Customer not updated', message: result.error.message });
      return;
    }
    setFeedback({
      tone: 'success',
      title: 'Customer updated',
      message: `${result.value.displayName}'s account details were updated.`,
    });
    setEditingCustomer(null);
  };

  const confirmStatus = () => {
    if (!pendingStatusCustomer) return;
    const nextStatus: CustomerAccountStatus =
      pendingStatusCustomer.status === 'active' ? 'inactive' : 'active';
    const result = updateCustomerState(pendingStatusCustomer.id, {
      displayName: pendingStatusCustomer.displayName,
      email: pendingStatusCustomer.email,
      phonePlaceholder: pendingStatusCustomer.phonePlaceholder,
      status: nextStatus,
    });
    setFeedback(
      result.ok
        ? {
            tone: 'success',
            title: nextStatus === 'active' ? 'Customer activated' : 'Customer deactivated',
            message:
              nextStatus === 'active'
                ? 'The customer account is active again.'
                : 'The account is inactive while order and loyalty history remain preserved.',
          }
        : { tone: 'error', title: 'Account state not changed', message: result.error.message },
    );
    setPendingStatusCustomer(null);
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Review customer profiles, order history, saved delivery information, and account state."
        title="Customers"
      />

      <AdminMetricStrip ariaLabel="Customer summary" items={customerMetrics} />

      {feedback ? (
        <Notice title={feedback.title} tone={feedback.tone}>
          {feedback.message}
        </Notice>
      ) : null}

      <Toolbar>
        <SearchField
          label="Search name, email, or contact"
          onChange={(event) => setQuery(event.target.value)}
          value={query}
        />
      </Toolbar>

      {filteredCustomers.length ? (
        <AdminDataTable
          ariaLabel="Customer records"
          columns={columns}
          getRowKey={(customer) => customer.id}
          rows={filteredCustomers}
        />
      ) : (
        <EmptyState
          action={<ResetButton onClick={() => setQuery('')}>Clear search</ResetButton>}
          description="Try another customer name, email, or contact number."
          title="No customers match this search"
        />
      )}

      <AdminFormDialog
        description="Update contact details or account state. Purchase, address, and loyalty history are managed separately and are not deleted here."
        formId="customer-edit-form"
        onClose={() => setEditingCustomer(null)}
        open={Boolean(editingCustomer)}
        submitLabel="Save customer"
        title={editingCustomer ? `Edit ${editingCustomer.displayName}` : 'Edit customer'}
      >
        <EditForm id="customer-edit-form" onSubmit={submitEdit}>
          <EditField
            label="Customer name"
            onChange={(event) => setDisplayName(event.target.value)}
            required
            value={displayName}
          />
          <EditField
            autoComplete="email"
            label="Email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <EditField
            label="Contact number"
            onChange={(event) => setPhone(event.target.value)}
            required
            value={phone}
          />
          <EditField
            label="Account state"
            onChange={(event) => setStatus(event.target.value as CustomerAccountStatus)}
            select
            value={status}
          >
            <EditOption value="active">Active</EditOption>
            <EditOption value="inactive">Inactive</EditOption>
          </EditField>
        </EditForm>
      </AdminFormDialog>

      <AdminConfirmDialog
        confirmLabel={
          pendingStatusCustomer?.status === 'active' ? 'Deactivate account' : 'Activate account'
        }
        confirmTone="primary"
        description={
          pendingStatusCustomer?.status === 'active'
            ? 'The customer account will become inactive, but its order, address, and loyalty history will remain available to Admin.'
            : 'The customer account will return to active status.'
        }
        onClose={() => setPendingStatusCustomer(null)}
        onConfirm={confirmStatus}
        open={Boolean(pendingStatusCustomer)}
        title={
          pendingStatusCustomer?.status === 'active'
            ? 'Deactivate this customer account?'
            : 'Activate this customer account?'
        }
      />
    </Root>
  );
}
