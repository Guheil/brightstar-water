'use client';

import { useMemo, useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import type { Customer } from '@/types';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDate, getStatusTone, humanize } from '../utils';
import { ResetButton, Root, SearchField, TableLink } from './elements';
import type { CustomersScreenProps } from './interface';

export default function CustomersScreen({ className }: CustomersScreenProps) {
  const customers = useAppStore((state) => state.customers.records);
  const orders = useAppStore((state) => state.orders.records);
  const loyalty = useAppStore((state) => state.loyalty.accounts);
  const [query, setQuery] = useState('');
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

  const columns: readonly AdminDataColumn<Customer>[] = [
    {
      key: 'customer',
      label: 'Customer',
      render: (customer) => (
        <TableLink href={`/admin/customers/${customer.id}`}>
          {customer.displayName}
        </TableLink>
      ),
    },
    { key: 'contact', label: 'Contact placeholder', render: (customer) => customer.phonePlaceholder },
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
        <StatusText tone={getStatusTone(customer.status)}>
          {humanize(customer.status)}
        </StatusText>
      ),
    },
  ];

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Review fictional customer contact placeholders, purchase history, active work, and loyalty without invasive analytics."
        title="Customers"
      />
      <SearchField
        label="Search name, email, or contact"
        onChange={(event) => setQuery(event.target.value)}
        value={query}
      />
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
          description="Try another fictional name, email, or contact placeholder."
          title="No customers match this search"
        />
      )}
    </Root>
  );
}
