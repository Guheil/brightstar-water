'use client';

import { useShallow } from 'zustand/react/shallow';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { selectAdminWorkCounts, useAppStore } from '@/store';
import { formatPhp, getAvailableStock, isLowStock } from '@/utils';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDate, getStatusTone, humanize } from '../utils';
import {
  AttentionGrid,
  EmptyMessage,
  Item,
  ItemCopy,
  ItemList,
  ItemMeta,
  ItemTitle,
  Root,
  Section,
  SectionHeading,
  SectionIntro,
  SectionLink,
  SummaryItem,
  SummaryStrip,
  SummaryTerm,
  SummaryValue,
} from './elements';
import type { OverviewScreenProps } from './interface';

export default function OverviewScreen({ className }: OverviewScreenProps) {
  const counts = useAppStore(useShallow(selectAdminWorkCounts));
  const orders = useAppStore((state) => state.orders.records);
  const deliveries = useAppStore((state) => state.deliveries.records);
  const inventory = useAppStore((state) => state.inventory.items);
  const products = useAppStore((state) => state.catalog.products);
  const pendingOrders = orders.filter((order) => order.status === 'pending_review').slice(0, 4);
  const attentionDeliveries = deliveries
    .filter((delivery) => ['unassigned', 'failed'].includes(delivery.status))
    .slice(0, 4);
  const lowStockItems = inventory.filter(isLowStock).slice(0, 4);

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Review the queues that need attention now. Counts come directly from the fictional shared frontend state."
        title="Operational overview"
      />

      <Notice title="Fictional operational data" tone="info">
        This workspace is a frontend prototype. No order, customer, payment, or delivery shown here is real.
      </Notice>

      <SummaryStrip aria-label="Current work summary">
        <SummaryItem>
          <SummaryTerm>Pending orders</SummaryTerm>
          <SummaryValue>{counts.pendingOrders}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryTerm>Unassigned deliveries</SummaryTerm>
          <SummaryValue>{counts.unassignedDeliveries}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryTerm>Failed deliveries</SummaryTerm>
          <SummaryValue>{counts.failedDeliveries}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryTerm>Low-stock products</SummaryTerm>
          <SummaryValue>{counts.lowStockProducts}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryTerm>Cancellation / refund review</SummaryTerm>
          <SummaryValue>
            {counts.pendingCancellations + counts.pendingRefunds}
          </SummaryValue>
        </SummaryItem>
      </SummaryStrip>

      <AttentionGrid>
        <Section>
          <SectionHeading>Orders awaiting review</SectionHeading>
          <SectionIntro>Confirm valid orders before preparation or assignment.</SectionIntro>
          {pendingOrders.length ? (
            <ItemList>
              {pendingOrders.map((order) => (
                <Item key={order.id}>
                  <ItemCopy>
                    <ItemTitle>{order.reference}</ItemTitle>
                    <ItemMeta>
                      {formatDate(order.placedAt)} · {formatPhp(order.totals.totalCentavos)}
                    </ItemMeta>
                  </ItemCopy>
                  <StatusText tone={getStatusTone(order.status)}>
                    {humanize(order.status)}
                  </StatusText>
                </Item>
              ))}
            </ItemList>
          ) : (
            <EmptyMessage>No orders are waiting for review.</EmptyMessage>
          )}
          <SectionLink href="/admin/orders">Open order queue</SectionLink>
        </Section>

        <Section>
          <SectionHeading>Delivery attention</SectionHeading>
          <SectionIntro>Assign pending work and review failed attempts.</SectionIntro>
          {attentionDeliveries.length ? (
            <ItemList>
              {attentionDeliveries.map((delivery) => (
                <Item key={delivery.id}>
                  <ItemCopy>
                    <ItemTitle>{delivery.address.recipientName}</ItemTitle>
                    <ItemMeta>
                      {delivery.schedule.date} · {delivery.schedule.windowLabel}
                    </ItemMeta>
                  </ItemCopy>
                  <StatusText tone={getStatusTone(delivery.status)}>
                    {humanize(delivery.status)}
                  </StatusText>
                </Item>
              ))}
            </ItemList>
          ) : (
            <EmptyMessage>No delivery exceptions need review.</EmptyMessage>
          )}
          <SectionLink href="/admin/deliveries">Open delivery queue</SectionLink>
        </Section>

        <Section>
          <SectionHeading>Low stock</SectionHeading>
          <SectionIntro>Available stock accounts for active reservations.</SectionIntro>
          {lowStockItems.length ? (
            <ItemList>
              {lowStockItems.map((item) => {
                const product = products.find((candidate) => candidate.id === item.productId);

                return (
                  <Item key={item.productId}>
                    <ItemCopy>
                      <ItemTitle>{product?.name ?? item.productId}</ItemTitle>
                      <ItemMeta>Reorder level {item.reorderLevel}</ItemMeta>
                    </ItemCopy>
                    <StatusText tone="warning">
                      {getAvailableStock(item)} available
                    </StatusText>
                  </Item>
                );
              })}
            </ItemList>
          ) : (
            <EmptyMessage>No products are at or below reorder level.</EmptyMessage>
          )}
          <SectionLink href="/admin/inventory">Open inventory</SectionLink>
        </Section>
      </AttentionGrid>
    </Root>
  );
}
