'use client';

import { useMemo } from 'react';
import DelivererShell from '@/components/layout/DelivererShell';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import { demoDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  Address,
  Arrow,
  DeliveryLink,
  Intro,
  Payment,
  Primary,
  Queue,
  QueueItem,
  Root,
  Secondary,
  Time,
} from './elements';

function statusLabel(status: string) {
  return status.replaceAll('_', ' ');
}

export default function ActiveDeliveriesScreen() {
  const deliveryRecords = useAppStore((state) => state.deliveries.records);
  const deliveries = useMemo(
    () =>
      deliveryRecords
        .filter(
          (delivery) =>
            delivery.delivererId === demoDelivererId &&
            ['assigned', 'accepted', 'out_for_delivery'].includes(delivery.status),
        )
        .toSorted((a, b) => {
          const dateOrder = a.schedule.date.localeCompare(b.schedule.date);
          return dateOrder || a.schedule.windowLabel.localeCompare(b.schedule.windowLabel);
        }),
    [deliveryRecords],
  );
  const customers = useAppStore((state) => state.customers.records);
  const orders = useAppStore((state) => state.orders.records);
  const deliverer = useAppStore((state) =>
    state.deliveries.deliverers.find((item) => item.id === demoDelivererId),
  );

  return (
    <DelivererShell
      brandName="MRJE + Bright Star"
      navigation={delivererNavigation}
      activeHref="/deliverer/deliveries"
      headerTitle="Active deliveries"
      headerMeta={`${deliveries.length} assigned today`}
      userName={deliverer?.displayName}
    >
      <Root>
        <Notice tone="info" title="Frontend prototype">
          All customer details, payment records, and delivery addresses shown
          here are fictional.
        </Notice>
        <Intro>
          Work through assigned stops in schedule order. This prototype records
          status updates but does not use GPS or background location.
        </Intro>
        {deliveries.length ? (
          <Queue>
            {deliveries.map((delivery) => {
              const customer = customers.find(
                (item) => item.id === delivery.customerId,
              );
              const order = orders.find((item) => item.id === delivery.orderId);

              return (
                <QueueItem key={delivery.id}>
                  <DeliveryLink href={`/deliverer/deliveries/${delivery.id}`}>
                    <div>
                      <Time>{delivery.schedule.windowLabel}</Time>
                      <Secondary>{delivery.schedule.date}</Secondary>
                    </div>
                    <Address>
                      <Primary>{customer?.displayName ?? 'Demo customer'}</Primary>
                      <Secondary>
                        {delivery.address.area} · {delivery.address.addressLine}
                      </Secondary>
                      <Secondary>{order?.reference ?? delivery.orderId}</Secondary>
                    </Address>
                    <Payment>
                      <Primary>{delivery.paymentMethod.toUpperCase()}</Primary>
                      <Secondary>
                        {delivery.paymentMethod === 'cod'
                          ? `${formatPhp(delivery.amountToCollectCentavos)} to collect`
                          : 'No cash collection'}
                      </Secondary>
                      <StatusText tone="info">
                        {statusLabel(delivery.status)}
                      </StatusText>
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
