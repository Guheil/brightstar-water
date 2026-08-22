'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ClipboardList, PackagePlus, SlidersHorizontal, Truck } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import StatusText from '@/components/ui/StatusText';
import { selectAdminWorkCounts, useAppStore } from '@/store';
import { formatPhp, getAvailableStock, getEffectiveScheduleText, isLowStock } from '@/utils';
import { formatDate, getStatusTone, humanize } from '../utils';
import {
  AttentionGrid,
  CommandBar,
  CommandIcon,
  CommandLink,
  CommandText,
  EmptyMessage,
  Item,
  ItemCopy,
  ItemList,
  ItemMeta,
  ItemTitle,
  PrimarySection,
  Root,
  Section,
  SectionHeader,
  SectionHeading,
  SectionIntro,
  SectionLink,
  SideStack,
  Stage,
  StageCopy,
  StageDescription,
  StageFocus,
  StageFocusCaption,
  StageFocusGrid,
  StageFocusItem,
  StageFocusLabel,
  StageFocusValue,
  StageGrid,
  StageTitle,
  SummaryItem,
  SummaryStrip,
  SummaryTerm,
  SummaryValue,
} from './elements';
import type { OverviewScreenProps } from './interface';

export default function OverviewScreen({ className }: OverviewScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);
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
  const immediateAttention = counts.pendingOrders + counts.unassignedDeliveries + counts.failedDeliveries;
  const reviewBacklog = counts.pendingCancellations + counts.pendingRefunds;

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power2.out' } })
          .from('[data-overview-stage]', { opacity: 0, duration: 0.42 })
          .from('[data-overview-command]', { opacity: 0, x: -8, duration: 0.32 }, '-=0.16');
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <Root className={className} ref={rootRef}>
      <Stage data-overview-stage>
        <StageGrid>
          <StageCopy>
            <StageTitle>Operational overview</StageTitle>
            <StageDescription>
              Review the work that needs a decision now, then move directly into orders,
              deliveries, inventory, or catalog control.
            </StageDescription>
          </StageCopy>
          <StageFocus>
            <StageFocusValue>{immediateAttention}</StageFocusValue>
            <StageFocusCaption>order and delivery items need immediate routing.</StageFocusCaption>
            <StageFocusGrid>
              <StageFocusItem>
                <StageFocusLabel>Low stock</StageFocusLabel>
                <strong>{counts.lowStockProducts}</strong>
              </StageFocusItem>
              <StageFocusItem>
                <StageFocusLabel>Review backlog</StageFocusLabel>
                <strong>{reviewBacklog}</strong>
              </StageFocusItem>
            </StageFocusGrid>
          </StageFocus>
        </StageGrid>
      </Stage>

      <CommandBar aria-label="Admin shortcuts" data-overview-command>
        <CommandLink href="/admin/products/new">
          <CommandIcon><PackagePlus aria-hidden="true" /></CommandIcon>
          <CommandText>Add product</CommandText>
        </CommandLink>
        <CommandLink href="/admin/inventory">
          <CommandIcon><SlidersHorizontal aria-hidden="true" /></CommandIcon>
          <CommandText>Adjust inventory</CommandText>
        </CommandLink>
        <CommandLink href="/admin/orders">
          <CommandIcon><ClipboardList aria-hidden="true" /></CommandIcon>
          <CommandText>Review order queue</CommandText>
        </CommandLink>
        <CommandLink href="/admin/deliveries">
          <CommandIcon><Truck aria-hidden="true" /></CommandIcon>
          <CommandText>Coordinate deliveries</CommandText>
        </CommandLink>
      </CommandBar>

      <SummaryStrip aria-label="Current work summary">
        <SummaryItem data-overview-metric data-tone="water">
          <SummaryTerm>Pending orders</SummaryTerm>
          <SummaryValue>{counts.pendingOrders}</SummaryValue>
        </SummaryItem>
        <SummaryItem data-overview-metric data-tone="primary">
          <SummaryTerm>Unassigned deliveries</SummaryTerm>
          <SummaryValue>{counts.unassignedDeliveries}</SummaryValue>
        </SummaryItem>
        <SummaryItem data-overview-metric data-tone="error">
          <SummaryTerm>Failed deliveries</SummaryTerm>
          <SummaryValue>{counts.failedDeliveries}</SummaryValue>
        </SummaryItem>
        <SummaryItem data-overview-metric data-tone="warning">
          <SummaryTerm>Low-stock products</SummaryTerm>
          <SummaryValue>{counts.lowStockProducts}</SummaryValue>
        </SummaryItem>
        <SummaryItem data-overview-metric data-tone="gas">
          <SummaryTerm>Cancellation / refund review</SummaryTerm>
          <SummaryValue>{reviewBacklog}</SummaryValue>
        </SummaryItem>
      </SummaryStrip>

      <AttentionGrid>
        <PrimarySection data-overview-work>
          <SectionHeader>
            <div>
              <SectionHeading>Orders awaiting review</SectionHeading>
              <SectionIntro>Confirm valid orders before preparation or assignment.</SectionIntro>
            </div>
            <SectionLink href="/admin/orders">Open order queue</SectionLink>
          </SectionHeader>
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
        </PrimarySection>

        <SideStack>
          <Section data-overview-work>
            <SectionHeader>
              <div>
                <SectionHeading>Delivery attention</SectionHeading>
                <SectionIntro>Assign pending work and review failed attempts.</SectionIntro>
              </div>
              <SectionLink href="/admin/deliveries">Open queue</SectionLink>
            </SectionHeader>
            {attentionDeliveries.length ? (
              <ItemList>
                {attentionDeliveries.map((delivery) => (
                  <Item key={delivery.id}>
                    <ItemCopy>
                      <ItemTitle>{delivery.address.recipientName}</ItemTitle>
                      <ItemMeta>
                        {getEffectiveScheduleText(delivery.schedule)}
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
          </Section>

          <Section data-overview-work>
            <SectionHeader>
              <div>
                <SectionHeading>Low stock</SectionHeading>
                <SectionIntro>Available stock accounts for active reservations.</SectionIntro>
              </div>
              <SectionLink href="/admin/inventory">Open inventory</SectionLink>
            </SectionHeader>
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
          </Section>
        </SideStack>
      </AttentionGrid>
    </Root>
  );
}
