'use client';

import { useMemo } from 'react';

import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import type { Order } from '@/types';
import { formatPhp } from '@/utils';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDate, getStatusTone, humanize } from '../utils';
import {
  AddressItem,
  AddressList,
  AddressText,
  AddressTitle,
  DetailList,
  DetailTerm,
  DetailValue,
  EmptyActionLink,
  Root,
  Section,
  SectionTitle,
  TableLink,
} from './elements';
import type { CustomerDetailScreenProps } from './interface';

export default function CustomerDetailScreen({
  customerId,
}: CustomerDetailScreenProps) {
  const customer = useAppStore((state) =>
    state.customers.records.find((item) => item.id === customerId),
  );
  const allOrders = useAppStore((state) => state.orders.records);
  const loyalty = useAppStore((state) =>
    state.loyalty.accounts.find((account) => account.customerId === customerId),
  );
  const allActivity = useAppStore((state) => state.loyalty.activity);
  const orders = useMemo(
    () =>
      allOrders
        .filter((order) => order.customerId === customerId)
        .sort((a, b) => b.placedAt.localeCompare(a.placedAt)),
    [allOrders, customerId],
  );
  const activity = useMemo(
    () => allActivity.filter((item) => item.customerId === customerId),
    [allActivity, customerId],
  );

  if (!customer) {
    return (
      <EmptyState
        action={<EmptyActionLink href="/admin/customers">Return to customers</EmptyActionLink>}
        description="This fictional customer may have been removed when the demo state was reset."
        title="Customer not found"
      />
    );
  }

  const columns: readonly AdminDataColumn<Order>[] = [
    {
      key: 'order',
      label: 'Order',
      render: (order) => (
        <TableLink href={`/admin/orders/${order.id}`}>{order.reference}</TableLink>
      ),
    },
    { key: 'date', label: 'Placed', render: (order) => formatDate(order.placedAt) },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      render: (order) => formatPhp(order.totals.totalCentavos),
    },
    {
      key: 'status',
      label: 'Status',
      render: (order) => (
        <StatusText tone={getStatusTone(order.status)}>{humanize(order.status)}</StatusText>
      ),
    },
  ];

  return (
    <Root>
      <AdminPageHeader
        backHref="/admin/customers"
        backLabel="Back to customers"
        description="Fictional profile, address, order, and loyalty information used only for workflow demonstration."
        title={customer.displayName}
      />
      <Notice title="Data minimization" tone="info">
        This record intentionally avoids real identity data and invasive customer analytics.
      </Notice>

      <Section>
        <SectionTitle>Profile</SectionTitle>
        <DetailList>
          <DetailTerm>Email</DetailTerm>
          <DetailValue>{customer.email}</DetailValue>
          <DetailTerm>Contact placeholder</DetailTerm>
          <DetailValue>{customer.phonePlaceholder}</DetailValue>
          <DetailTerm>Account state</DetailTerm>
          <DetailValue>{humanize(customer.status)}</DetailValue>
          <DetailTerm>Order count</DetailTerm>
          <DetailValue>{orders.length}</DetailValue>
          <DetailTerm>Loyalty balance</DetailTerm>
          <DetailValue>{loyalty?.pointsAvailable ?? 0} points</DetailValue>
          <DetailTerm>Loyalty activity</DetailTerm>
          <DetailValue>{activity.length} recorded events</DetailValue>
        </DetailList>
      </Section>

      <Section>
        <SectionTitle>Saved delivery information</SectionTitle>
        <AddressList>
          {customer.addresses.map((address) => (
            <AddressItem key={address.id}>
              <AddressTitle>{address.label}</AddressTitle>
              <AddressText>
                {address.addressLine}, {address.area}, {address.municipality},{' '}
                {address.province}
              </AddressText>
              <AddressText>
                {address.distanceKm} km demo distance ·{' '}
                {address.isDefault ? 'Default address' : 'Additional address'}
              </AddressText>
            </AddressItem>
          ))}
        </AddressList>
      </Section>

      <Section>
        <SectionTitle>Purchase history</SectionTitle>
        {orders.length ? (
          <AdminDataTable
            ariaLabel={`${customer.displayName} purchase history`}
            columns={columns}
            getRowKey={(order) => order.id}
            rows={orders}
          />
        ) : (
          <DetailValue>No fictional orders recorded.</DetailValue>
        )}
      </Section>
    </Root>
  );
}
