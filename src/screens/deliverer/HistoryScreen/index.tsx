'use client';

import { useMemo, useState } from 'react';
import { fetchOlderOperationalPage } from '@/lib/orders/client';
import type { OperationalCursor } from '@/lib/orders/types';
import type { Delivery } from '@/types';
import DelivererShell from '@/components/layout/DelivererShell';
import EmptyState from '@/components/ui/EmptyState';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import { formatDeliveryDate, formatPhp } from '@/utils';
import { getActiveDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  DayGroup,
  DayTitle,
  HistoryItem,
  HistoryLink,
  HistoryList,
  Intro,
  LoadMoreButton,
  Primary,
  Root,
  Secondary,
  Summary,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
} from './elements';

export default function HistoryScreen() {
  const currentDelivererId = useAppStore(getActiveDelivererId);
  const mergeOperationalSnapshot = useAppStore((state) => state.commands.mergeOperationalSnapshot);
  const [olderCursor, setOlderCursor] = useState<OperationalCursor | null>(null);
  const [olderExhausted, setOlderExhausted] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
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
    [currentDelivererId, deliveryRecords],
  );
  const orders = useAppStore((state) => state.orders.records);
  const customers = useAppStore((state) => state.customers.records);
  const delivered = deliveries.filter((delivery) => delivery.status === 'delivered');
  const cashRecorded = delivered.reduce(
    (sum, delivery) => sum + (delivery.completionEvidence?.cashReceivedCentavos ?? 0),
    0,
  );
  const groups = deliveries.reduce<Record<string, Delivery[]>>((result, delivery) => {
    (result[delivery.schedule.date] ??= []).push(delivery);
    return result;
  }, {});

  const loadOlderDeliveries = async () => {
    if (loadingOlder || olderExhausted || !orders.length) return;
    const oldest = [...orders].sort((a, b) => a.placedAt.localeCompare(b.placedAt) || a.id.localeCompare(b.id))[0];
    if (!oldest) return;
    const cursor = olderCursor ?? { placedAt: oldest.placedAt, id: oldest.id };
    setLoadingOlder(true);
    try {
      const result = await fetchOlderOperationalPage(cursor);
      mergeOperationalSnapshot(result.snapshot);
      setOlderCursor(result.nextCursor);
      if (!result.nextCursor) setOlderExhausted(true);
    } finally {
      setLoadingOlder(false);
    }
  };

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
          <>
            {(Object.entries(groups) as Array<[string, Delivery[]]>).map(([date, items]) => (
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
                            <Primary>{formatDeliveryDate(delivery.schedule.date)} · {delivery.schedule.windowLabel}</Primary>
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
            ))}
          </>
        ) : (
          <EmptyState
            title="No finished deliveries yet."
            description="Delivered or failed assignments will appear here."
          />
        )}
        {orders.length >= 100 && !olderExhausted ? (
          <LoadMoreButton disabled={loadingOlder} onClick={() => void loadOlderDeliveries()}>
            {loadingOlder ? 'Loading older deliveries…' : 'Load older deliveries'}
          </LoadMoreButton>
        ) : null}
      </Root>
    </DelivererShell>
  );
}
