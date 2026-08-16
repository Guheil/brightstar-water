'use client';

import { useMemo } from 'react';
import DelivererShell from '@/components/layout/DelivererShell';
import EmptyState from '@/components/ui/EmptyState';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import { currentDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  DayGroup,
  DayTitle,
  HistoryItem,
  HistoryLink,
  HistoryList,
  Intro,
  Primary,
  Root,
  Secondary,
  Summary,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
} from './elements';

export default function HistoryScreen() {
  const deliveryRecords = useAppStore((state) => state.deliveries.records);
  const deliveries = useMemo(
    () =>
      deliveryRecords
        .filter(
          (delivery) =>
            delivery.delivererId === currentDelivererId &&
            (delivery.status === 'delivered' || delivery.status === 'failed'),
        )
        .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [deliveryRecords],
  );
  const orders = useAppStore((state) => state.orders.records);
  const customers = useAppStore((state) => state.customers.records);
  const delivered = deliveries.filter((delivery) => delivery.status === 'delivered');
  const cashRecorded = delivered.reduce(
    (sum, delivery) => sum + (delivery.completionEvidence?.cashReceivedCentavos ?? 0),
    0,
  );
  const groups = deliveries.reduce<Record<string, typeof deliveries>>((result, delivery) => {
    (result[delivery.schedule.date] ??= []).push(delivery);
    return result;
  }, {});

  return (
    <DelivererShell
      brandName="MRJE + Bright Star"
      navigation={delivererNavigation}
      activeHref="/deliverer/history"
      headerTitle="Delivery history"
      headerMeta={`${deliveries.length} finished records`}
    >
      <Root>
        <Intro>Review completed and unsuccessful stops, grouped by delivery date.</Intro>
        <Summary aria-label="Delivery history summary">
          <SummaryItem>
            <SummaryLabel>Delivered</SummaryLabel>
            <SummaryValue>{delivered.length}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Needs review</SummaryLabel>
            <SummaryValue>{deliveries.filter((delivery) => delivery.status === 'failed').length}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>COD recorded</SummaryLabel>
            <SummaryValue>{formatPhp(cashRecorded)}</SummaryValue>
          </SummaryItem>
        </Summary>
        {deliveries.length ? (
          Object.entries(groups).map(([date, items]) => (
            <DayGroup key={date}>
              <DayTitle>{date}</DayTitle>
              <HistoryList>
                {items.map((delivery) => {
                  const order = orders.find((item) => item.id === delivery.orderId);
                  const customer = customers.find((item) => item.id === delivery.customerId);
                  return (
                    <HistoryItem key={delivery.id}>
                      <HistoryLink href={`/deliverer/deliveries/${delivery.id}`}>
                        <div>
                          <Primary>{delivery.schedule.windowLabel}</Primary>
                          <Secondary>{delivery.paymentMethod.toUpperCase()}</Secondary>
                        </div>
                        <div>
                          <Primary>{customer?.displayName ?? 'Customer'}</Primary>
                          <Secondary>{order?.reference ?? delivery.orderId} · {delivery.address.area}</Secondary>
                        </div>
                        <StatusText tone={delivery.status === 'delivered' ? 'success' : 'error'}>
                          {delivery.status}
                        </StatusText>
                      </HistoryLink>
                    </HistoryItem>
                  );
                })}
              </HistoryList>
            </DayGroup>
          ))
        ) : (
          <EmptyState
            title="No finished deliveries yet."
            description="Delivered or failed assignments will appear here."
          />
        )}
      </Root>
    </DelivererShell>
  );
}
