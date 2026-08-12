'use client';

import { useMemo, useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import type { Order } from '@/types';
import { formatPhp } from '@/utils';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDate, getStatusTone, humanize } from '../utils';
import {
  FilterBar,
  FilterField,
  FilterOption,
  ResetButton,
  ResultCount,
  ResultFooter,
  ResultPagination,
  Root,
  TableLink,
} from './elements';
import type { OrdersScreenProps, OrderSort } from './interface';

const pageSize = 8;

export default function OrdersScreen({ className }: OrdersScreenProps) {
  const orders = useAppStore((state) => state.orders.records);
  const customers = useAppStore((state) => state.customers.records);
  const payments = useAppStore((state) => state.payments.records);
  const deliveries = useAppStore((state) => state.deliveries.records);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [date, setDate] = useState('');
  const [sort, setSort] = useState<OrderSort>('newest');
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = orders.filter((order) => {
      const customer = customers.find((item) => item.id === order.customerId);
      const matchesQuery =
        !normalizedQuery ||
        order.reference.toLowerCase().includes(normalizedQuery) ||
        customer?.displayName.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === 'all' || order.status === status;
      const matchesPayment =
        paymentMethod === 'all' || order.paymentMethod === paymentMethod;
      const matchesDate = !date || order.placedAt.slice(0, 10) === date;
      return matchesQuery && matchesStatus && matchesPayment && matchesDate;
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.placedAt.localeCompare(b.placedAt);
        case 'total_high':
          return b.totals.totalCentavos - a.totals.totalCentavos;
        case 'schedule':
          return a.deliverySchedule.date.localeCompare(b.deliverySchedule.date);
        default:
          return b.placedAt.localeCompare(a.placedAt);
      }
    });
  }, [customers, date, orders, paymentMethod, query, sort, status]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleOrders = filteredOrders.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const columns: readonly AdminDataColumn<Order>[] = [
    {
      key: 'order',
      label: 'Order',
      render: (order) => (
        <TableLink href={`/admin/orders/${order.id}`}>{order.reference}</TableLink>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order) =>
        customers.find((customer) => customer.id === order.customerId)?.displayName ??
        'Unknown demo customer',
    },
    {
      key: 'date',
      label: 'Placed',
      render: (order) => formatDate(order.placedAt),
    },
    {
      key: 'schedule',
      label: 'Delivery schedule',
      render: (order) => `${order.deliverySchedule.date} · ${order.deliverySchedule.windowLabel}`,
    },
    {
      key: 'payment',
      label: 'Payment',
      render: (order) => {
        const payment = payments.find((item) => item.orderId === order.id);
        return `${order.paymentMethod.toUpperCase()} · ${humanize(payment?.status ?? 'unknown')}`;
      },
    },
    {
      key: 'total',
      label: 'Total',
      align: 'right',
      render: (order) => formatPhp(order.totals.totalCentavos),
    },
    {
      key: 'status',
      label: 'Order status',
      render: (order) => (
        <StatusText tone={getStatusTone(order.status)}>
          {humanize(order.status)}
        </StatusText>
      ),
    },
    {
      key: 'delivery',
      label: 'Delivery',
      render: (order) => {
        const delivery = deliveries.find((item) => item.orderId === order.id);
        return delivery ? (
          <StatusText tone={getStatusTone(delivery.status)}>
            {humanize(delivery.status)}
          </StatusText>
        ) : (
          'No delivery record'
        );
      },
    },
  ];

  const resetFilters = () => {
    setQuery('');
    setStatus('all');
    setPaymentMethod('all');
    setDate('');
    setSort('newest');
    setPage(1);
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Search, filter, and open orders without compressing operational details into decorative cards."
        title="Orders"
      />

      <FilterBar aria-label="Order filters">
        <FilterField
          label="Search order or customer"
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          value={query}
        />
        <FilterField
          label="Order status"
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          select
          value={status}
        >
          <FilterOption value="all">All statuses</FilterOption>
          <FilterOption value="pending_review">Pending review</FilterOption>
          <FilterOption value="confirmed">Confirmed</FilterOption>
          <FilterOption value="preparing">Preparing</FilterOption>
          <FilterOption value="assigned_for_delivery">Assigned</FilterOption>
          <FilterOption value="out_for_delivery">Out for delivery</FilterOption>
          <FilterOption value="delivered">Delivered</FilterOption>
          <FilterOption value="cancelled">Cancelled</FilterOption>
          <FilterOption value="delivery_failed">Delivery failed</FilterOption>
        </FilterField>
        <FilterField
          label="Payment method"
          onChange={(event) => {
            setPaymentMethod(event.target.value);
            setPage(1);
          }}
          select
          value={paymentMethod}
        >
          <FilterOption value="all">All methods</FilterOption>
          <FilterOption value="cod">Cash on delivery</FilterOption>
          <FilterOption value="gcash">GCash</FilterOption>
        </FilterField>
        <FilterField
          label="Placed date"
          onChange={(event) => {
            setDate(event.target.value);
            setPage(1);
          }}
          slotProps={{ inputLabel: { shrink: true } }}
          type="date"
          value={date}
        />
        <FilterField
          label="Sort"
          onChange={(event) => {
            setSort(event.target.value as OrderSort);
            setPage(1);
          }}
          select
          value={sort}
        >
          <FilterOption value="newest">Newest first</FilterOption>
          <FilterOption value="oldest">Oldest first</FilterOption>
          <FilterOption value="total_high">Highest total</FilterOption>
          <FilterOption value="schedule">Delivery schedule</FilterOption>
        </FilterField>
      </FilterBar>

      {visibleOrders.length ? (
        <>
          <AdminDataTable
            ariaLabel="Admin orders"
            columns={columns}
            getRowKey={(order) => order.id}
            rows={visibleOrders}
          />
          <ResultFooter>
            <ResultCount>
              Showing {visibleOrders.length} of {filteredOrders.length} matching orders
            </ResultCount>
            {pageCount > 1 ? (
              <ResultPagination
                count={pageCount}
                onChange={(_, nextPage) => setPage(nextPage)}
                page={safePage}
              />
            ) : null}
          </ResultFooter>
        </>
      ) : (
        <EmptyState
          action={<ResetButton onClick={resetFilters}>Clear filters</ResetButton>}
          description="Try another order reference, customer, status, payment method, or date."
          title="No orders match these filters"
        />
      )}
    </Root>
  );
}
