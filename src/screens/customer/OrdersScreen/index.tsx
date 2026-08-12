'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { EmptyState, StatusText } from '@/components';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import { getActiveCustomerId } from '../_shared/customer';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../_shared/orderPresentation';
import {
  DateText,
  DetailLink,
  FilterBar,
  FilterButton,
  Header,
  HeaderCopy,
  ItemSummary,
  Lead,
  OrderList,
  OrderRow,
  OrdersPage,
  Reference,
  ReferenceGroup,
  ShopLink,
  Title,
  Total,
} from './elements';
import type { CustomerOrderFilter, OrderFilterOption } from './interface';

const FILTERS: readonly OrderFilterOption[] = [
  { id: 'all', label: 'All orders' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Delivered' },
  { id: 'exceptions', label: 'Cancelled or failed' },
];

export default function OrdersScreen() {
  const [filter, setFilter] = useState<CustomerOrderFilter>('all');
  const customerId = useAppStore(getActiveCustomerId);
  const orders = useAppStore((state) => state.orders.records);
  const customerOrders = orders
    .filter((order) => order.customerId === customerId)
    .filter((order) => {
      if (filter === 'active') {
        return !['delivered', 'cancelled', 'delivery_failed'].includes(order.status);
      }
      if (filter === 'completed') return order.status === 'delivered';
      if (filter === 'exceptions') {
        return ['cancelled', 'delivery_failed'].includes(order.status);
      }
      return true;
    })
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));

  return (
    <OrdersPage>
      <Header>
        <HeaderCopy>
          <Title>My orders</Title>
          <Lead>
            Follow active demo deliveries and review how completed or exceptional orders are recorded.
          </Lead>
        </HeaderCopy>
        <ShopLink href="/shop">Start another order</ShopLink>
      </Header>

      <FilterBar aria-label="Filter customer orders">
        {FILTERS.map((option) => (
          <FilterButton
            aria-pressed={filter === option.id}
            key={option.id}
            onClick={() => setFilter(option.id)}
            $active={filter === option.id}
          >
            {option.label}
          </FilterButton>
        ))}
      </FilterBar>

      {customerOrders.length ? (
        <OrderList>
          {customerOrders.map((order) => (
            <OrderRow key={order.id}>
              <ReferenceGroup>
                <Reference>{order.reference}</Reference>
                <DateText>Placed {order.placedAt.slice(0, 10)}</DateText>
              </ReferenceGroup>
              <ItemSummary>
                {order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
              </ItemSummary>
              <StatusText tone={ORDER_STATUS_TONES[order.status]}>
                {ORDER_STATUS_LABELS[order.status]}
              </StatusText>
              <Total>{formatPhp(order.totals.totalCentavos)}</Total>
              <DetailLink href={`/customer/orders/${order.id}`}>View details</DetailLink>
            </OrderRow>
          ))}
        </OrderList>
      ) : (
        <EmptyState
          action={<ShopLink href="/shop">Browse products</ShopLink>}
          description={
            filter === 'all'
              ? 'Placed demo orders will appear here.'
              : 'No orders match this filter in the current demo state.'
          }
          icon={<ClipboardList />}
          title={filter === 'all' ? 'No orders yet' : 'No matching orders'}
        />
      )}
    </OrdersPage>
  );
}

