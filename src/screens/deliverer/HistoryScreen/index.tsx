'use client';

import { useMemo } from 'react';
import DelivererShell from '@/components/layout/DelivererShell';
import EmptyState from '@/components/ui/EmptyState';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import { demoDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  HistoryItem,
  HistoryLink,
  HistoryList,
  Intro,
  Primary,
  Root,
  Secondary,
} from './elements';

export default function HistoryScreen() {
  const deliveryRecords = useAppStore((state) => state.deliveries.records);
  const deliveries = useMemo(
    () =>
      deliveryRecords
        .filter(
          (delivery) =>
            delivery.delivererId === demoDelivererId &&
            (delivery.status === 'delivered' || delivery.status === 'failed'),
        )
        .toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [deliveryRecords],
  );
  const orders = useAppStore((state) => state.orders.records);
  const customers = useAppStore((state) => state.customers.records);

  return (
    <DelivererShell
      brandName="MRJE + Bright Star"
      navigation={delivererNavigation}
      activeHref="/deliverer/history"
      headerTitle="Delivery history"
      headerMeta={`${deliveries.length} completed records`}
    >
      <Root>
        <Intro>
          Review prior assignments and their final operational outcome.
        </Intro>
        {deliveries.length ? (
          <HistoryList>
            {deliveries.map((delivery) => {
              const order = orders.find((item) => item.id === delivery.orderId);
              const customer = customers.find(
                (item) => item.id === delivery.customerId,
              );
              return (
                <HistoryItem key={delivery.id}>
                  <HistoryLink href={`/deliverer/deliveries/${delivery.id}`}>
                    <div>
                      <Primary>{delivery.schedule.date}</Primary>
                      <Secondary>{delivery.schedule.windowLabel}</Secondary>
                    </div>
                    <div>
                      <Primary>{customer?.displayName ?? 'Customer'}</Primary>
                      <Secondary>
                        {order?.reference ?? delivery.orderId} · {delivery.address.area}
                      </Secondary>
                    </div>
                    <StatusText
                      tone={delivery.status === 'delivered' ? 'success' : 'error'}
                    >
                      {delivery.status}
                    </StatusText>
                  </HistoryLink>
                </HistoryItem>
              );
            })}
          </HistoryList>
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
