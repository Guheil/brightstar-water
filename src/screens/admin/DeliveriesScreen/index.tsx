'use client';

import { useMemo, useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import type { Delivery } from '@/types';
import { formatPhp } from '@/utils';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminPageHeader from '../components/AdminPageHeader';
import { getStatusTone, humanize } from '../utils';
import {
  FilterBar,
  FilterField,
  FilterOption,
  ResetButton,
  ResultCount,
  Root,
  TableLink,
} from './elements';
import type { DeliveriesScreenProps } from './interface';

export default function DeliveriesScreen({ className }: DeliveriesScreenProps) {
  const deliveries = useAppStore((state) => state.deliveries.records);
  const deliverers = useAppStore((state) => state.deliveries.deliverers);
  const orders = useAppStore((state) => state.orders.records);
  const customers = useAppStore((state) => state.customers.records);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [delivererId, setDelivererId] = useState('all');
  const [date, setDate] = useState('');

  const filteredDeliveries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return deliveries
      .filter((delivery) => {
        const order = orders.find((item) => item.id === delivery.orderId);
        const customer = customers.find((item) => item.id === delivery.customerId);
        const matchesQuery =
          !normalized ||
          order?.reference.toLowerCase().includes(normalized) ||
          customer?.displayName.toLowerCase().includes(normalized) ||
          delivery.address.area.toLowerCase().includes(normalized);
        const matchesStatus = status === 'all' || delivery.status === status;
        const matchesDeliverer =
          delivererId === 'all' ||
          (delivererId === 'unassigned'
            ? !delivery.delivererId
            : delivery.delivererId === delivererId);
        const matchesDate = !date || delivery.schedule.date === date;
        return matchesQuery && matchesStatus && matchesDeliverer && matchesDate;
      })
      .sort((a, b) => {
        const dateOrder = a.schedule.date.localeCompare(b.schedule.date);
        return dateOrder || a.schedule.windowLabel.localeCompare(b.schedule.windowLabel);
      });
  }, [customers, date, delivererId, deliveries, orders, query, status]);

  const columns: readonly AdminDataColumn<Delivery>[] = [
    {
      key: 'order',
      label: 'Order',
      render: (delivery) => {
        const order = orders.find((item) => item.id === delivery.orderId);
        return (
          <TableLink href={`/admin/deliveries/${delivery.id}`}>
            {order?.reference ?? delivery.id}
          </TableLink>
        );
      },
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (delivery) =>
        customers.find((item) => item.id === delivery.customerId)?.displayName ??
        delivery.address.recipientName,
    },
    {
      key: 'schedule',
      label: 'Schedule',
      render: (delivery) => `${delivery.schedule.date} · ${delivery.schedule.windowLabel}`,
    },
    {
      key: 'area',
      label: 'Delivery area',
      render: (delivery) => `${delivery.address.area} · ${delivery.address.distanceKm} km`,
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (delivery) =>
        delivery.paymentMethod === 'cod'
          ? `COD · ${formatPhp(delivery.amountToCollectCentavos)}`
          : 'GCash · no cash collection',
    },
    {
      key: 'deliverer',
      label: 'Deliverer',
      render: (delivery) =>
        deliverers.find((item) => item.id === delivery.delivererId)?.displayName ??
        'Unassigned',
    },
    {
      key: 'status',
      label: 'Status',
      render: (delivery) => (
        <StatusText tone={getStatusTone(delivery.status)}>
          {humanize(delivery.status)}
        </StatusText>
      ),
    },
  ];

  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setDelivererId('all');
    setDate('');
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Coordinate assignments, delivery schedules, and fulfillment exceptions."
        title="Deliveries"
      />

      <FilterBar aria-label="Delivery filters">
        <FilterField
          label="Search order, customer, or area"
          onChange={(event) => setQuery(event.target.value)}
          value={query}
        />
        <FilterField
          label="Status"
          onChange={(event) => setStatus(event.target.value)}
          select
          value={status}
        >
          <FilterOption value="all">All statuses</FilterOption>
          <FilterOption value="unassigned">Unassigned</FilterOption>
          <FilterOption value="assigned">Assigned</FilterOption>
          <FilterOption value="accepted">Accepted</FilterOption>
          <FilterOption value="out_for_delivery">Out for delivery</FilterOption>
          <FilterOption value="delivered">Delivered</FilterOption>
          <FilterOption value="failed">Failed</FilterOption>
          <FilterOption value="cancelled">Cancelled</FilterOption>
        </FilterField>
        <FilterField
          label="Deliverer"
          onChange={(event) => setDelivererId(event.target.value)}
          select
          value={delivererId}
        >
          <FilterOption value="all">All deliverers</FilterOption>
          <FilterOption value="unassigned">Unassigned</FilterOption>
          {deliverers.map((deliverer) => (
            <FilterOption key={deliverer.id} value={deliverer.id}>
              {deliverer.displayName}
            </FilterOption>
          ))}
        </FilterField>
        <FilterField
          label="Schedule date"
          onChange={(event) => setDate(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={date}
        />
        <ResetButton onClick={resetFilters}>Clear filters</ResetButton>
      </FilterBar>

      {filteredDeliveries.length ? (
        <>
          <AdminDataTable
            ariaLabel="Admin deliveries"
            columns={columns}
            getRowKey={(delivery) => delivery.id}
            rows={filteredDeliveries}
          />
          <ResultCount>{filteredDeliveries.length} matching deliveries</ResultCount>
        </>
      ) : (
        <EmptyState
          action={<ResetButton onClick={resetFilters}>Clear filters</ResetButton>}
          description="Change the search, status, deliverer, or schedule date."
          title="No deliveries match these filters"
        />
      )}
    </Root>
  );
}
