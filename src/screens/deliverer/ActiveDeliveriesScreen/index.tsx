'use client';

import { useMemo } from 'react';
import DelivererShell from '@/components/layout/DelivererShell';
import EmptyState from '@/components/ui/EmptyState';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import { formatDeliveryDate, formatPhp } from '@/utils';
import { getActiveDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  Address,
  Arrow,
  Collection,
  CollectionLabel,
  CollectionValue,
  DeliveryLink,
  Intro,
  IntroGrid,
  IntroTitle,
  Payment,
  Primary,
  Queue,
  QueueItem,
  Root,
  Secondary,
  Time,
  TimeBlock,
} from './elements';

function statusLabel(status: string) {
  return status.replaceAll('_', ' ');
}

export default function ActiveDeliveriesScreen() {
  const currentDelivererId = useAppStore(getActiveDelivererId);
  const deliveryRecords = useAppStore((state) => state.deliveries.records);
  const deliveries = useMemo(
    () =>
      deliveryRecords
        .filter(
          (delivery) =>
            delivery.delivererId === currentDelivererId &&
            ['assigned', 'accepted', 'out_for_delivery'].includes(delivery.status),
        )
        .toSorted((a, b) => {
          const dateOrder = a.schedule.date.localeCompare(b.schedule.date);
          return dateOrder || a.schedule.windowLabel.localeCompare(b.schedule.windowLabel);
        }),
    [currentDelivererId, deliveryRecords],
  );
  const customers = useAppStore((state) => state.customers.records);
  const orders = useAppStore((state) => state.orders.records);
  const deliverer = useAppStore((state) =>
    state.deliveries.deliverers.find((item) => item.id === currentDelivererId),
  );
  const codToCollect = deliveries
    .filter((delivery) => delivery.paymentMethod === 'cod')
    .reduce((sum, delivery) => sum + delivery.amountToCollectCentavos, 0);

  return (
    <DelivererShell
      activeHref="/deliverer/deliveries"
      brandName="MRJE + Bright Star"
      headerMeta={`${deliveries.length} deliveries in your queue`}
      headerTitle="Active deliveries"
      navigation={delivererNavigation}
      userName={deliverer?.displayName}
    >
      <Root>
        <IntroGrid>
          <div>
            <IntroTitle>Work the route in schedule order.</IntroTitle>
            <Intro>
              Open each stop for directions, customer contact, payment details, and progress actions.
            </Intro>
          </div>
          <Collection>
            <CollectionValue>{formatPhp(codToCollect)}</CollectionValue>
            <CollectionLabel>cash expected from active COD stops</CollectionLabel>
          </Collection>
        </IntroGrid>
        {deliveries.length ? (
          <Queue>
            {deliveries.map((delivery) => {
              const customer = customers.find((item) => item.id === delivery.customerId);
              const order = orders.find((item) => item.id === delivery.orderId);
              const categories = new Set(order?.items.map((item) => item.category) ?? []);
              const tone = categories.size > 1 ? 'mixed' : categories.has('gas') ? 'gas' : 'water';

              return (
                <QueueItem key={delivery.id}>
                  <DeliveryLink href={`/deliverer/deliveries/${delivery.id}`} $tone={tone}>
                    <TimeBlock>
                      <Time>{delivery.schedule.windowLabel}</Time>
                      <Secondary>{formatDeliveryDate(delivery.schedule.date)}</Secondary>
                    </TimeBlock>
                    <Address>
                      <Primary>{customer?.displayName ?? 'Customer'}</Primary>
                      <Secondary>{tone === 'gas' ? 'MRJE Gas' : tone === 'water' ? 'Bright Star Water' : 'Mixed storefront order'}</Secondary>
                      <Secondary>{delivery.address.area} · {delivery.address.addressLine}</Secondary>
                      <Secondary>{order?.reference ?? delivery.orderId} · {delivery.address.distanceKm.toFixed(1)} km</Secondary>
                    </Address>
                    <Payment>
                      <Primary>{delivery.paymentMethod.toUpperCase()}</Primary>
                      <Secondary>
                        {delivery.paymentMethod === 'cod'
                          ? `${formatPhp(delivery.amountToCollectCentavos)} to collect`
                          : 'No cash collection'}
                      </Secondary>
                      <StatusText tone="info">{statusLabel(delivery.status)}</StatusText>
                    </Payment>
                    <Arrow aria-hidden="true">→</Arrow>
                  </DeliveryLink>
                </QueueItem>
              );
            })}
          </Queue>
        ) : (
          <EmptyState
            title="No active deliveries are assigned to you."
            description="New assignments will appear here after an Admin assigns a confirmed order."
          />
        )}
      </Root>
    </DelivererShell>
  );
}
