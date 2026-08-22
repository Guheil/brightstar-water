'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import DelivererShell from '@/components/layout/DelivererShell';
import EmptyState from '@/components/ui/EmptyState';
import { useAppStore } from '@/store';
import { formatDeliveryDate, formatPhp } from '@/utils';
import { getActiveDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  Greeting,
  Hero,
  HeroGrid,
  HeroText,
  Meta,
  MiniItem,
  MiniLink,
  MiniQueue,
  NextCustomer,
  NextMain,
  NextSection,
  NextSide,
  PrimaryAction,
  QueueHeader,
  QueueLink,
  QueueSection,
  RemainingLabel,
  RemainingNumber,
  Root,
  Schedule,
  SectionTitle,
  Summary,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
  Time,
} from './elements';
import type { DelivererHomeScreenProps } from './interface';

export default function DelivererHomeScreen({ className }: DelivererHomeScreenProps) {
  const currentDelivererId = useAppStore(getActiveDelivererId);
  const rootRef = useRef<HTMLDivElement>(null);
  const deliveries = useAppStore((state) => state.deliveries.records);
  const orders = useAppStore((state) => state.orders.records);
  const customers = useAppStore((state) => state.customers.records);
  const deliverer = useAppStore((state) =>
    state.deliveries.deliverers.find((item) => item.id === currentDelivererId),
  );
  const active = deliveries
    .filter(
      (delivery) =>
        delivery.delivererId === currentDelivererId &&
        ['assigned', 'accepted', 'out_for_delivery'].includes(delivery.status),
    )
    .toSorted((a, b) =>
      a.schedule.date.localeCompare(b.schedule.date) ||
      a.schedule.windowLabel.localeCompare(b.schedule.windowLabel),
    );
  const completed = deliveries.filter(
    (delivery) => delivery.delivererId === currentDelivererId && delivery.status === 'delivered',
  );
  const failed = deliveries.filter(
    (delivery) => delivery.delivererId === currentDelivererId && delivery.status === 'failed',
  );
  const codOutstanding = active
    .filter((delivery) => delivery.paymentMethod === 'cod')
    .reduce((sum, delivery) => sum + delivery.amountToCollectCentavos, 0);
  const nextDelivery = active[0];
  const nextOrder = orders.find((order) => order.id === nextDelivery?.orderId);
  const nextCustomer = customers.find((customer) => customer.id === nextDelivery?.customerId);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-field-next]', { opacity: 0, x: -8, duration: 0.34, ease: 'power2.out' });
      });
      return () => media.revert();
    },
    { scope: rootRef },
  );

  return (
    <DelivererShell
      activeHref="/deliverer"
      brandName="MRJE + Bright Star"
      headerMeta={`${active.length} deliveries in your active queue`}
      headerTitle="Field operations"
      navigation={delivererNavigation}
      userName={deliverer?.displayName}
    >
      <Root className={className} ref={rootRef}>
        <Hero data-field-hero>
          <HeroGrid>
            <div>
              <Greeting>Good day, {deliverer?.displayName?.split(' ')[0] ?? 'Deliverer'}.</Greeting>
              <HeroText>
                Work the next stop first, keep delivery status current, and make cash collection easy to verify.
              </HeroText>
            </div>
            <div>
              <RemainingNumber>{active.length}</RemainingNumber>
              <RemainingLabel>active deliveries remaining</RemainingLabel>
            </div>
          </HeroGrid>
        </Hero>

        {nextDelivery && nextOrder ? (
          <NextSection data-field-next>
            <NextMain>
              <SectionTitle>Next delivery</SectionTitle>
              <Schedule>{formatDeliveryDate(nextDelivery.schedule.date)} · {nextDelivery.schedule.windowLabel}</Schedule>
              <NextCustomer>{nextCustomer?.displayName ?? nextDelivery.address.recipientName}</NextCustomer>
              <Meta>{nextDelivery.address.addressLine}, {nextDelivery.address.area}</Meta>
              <Meta>
                {nextOrder.items.map((item) => `${item.quantity} × ${item.name}`).join(' · ')}
              </Meta>
            </NextMain>
            <NextSide>
              <Meta>{nextDelivery.address.distanceKm.toFixed(1)} km from station</Meta>
              <Meta>
                {nextDelivery.paymentMethod === 'cod'
                  ? `${formatPhp(nextDelivery.amountToCollectCentavos)} cash to collect`
                  : 'GCash payment handled by Admin'}
              </Meta>
              <PrimaryAction href={`/deliverer/deliveries/${nextDelivery.id}`}>
                Open next delivery
              </PrimaryAction>
            </NextSide>
          </NextSection>
        ) : (
          <EmptyState
            description="New assignments will appear here when Admin adds them to your queue."
            title="Your active queue is clear"
          />
        )}

        <Summary aria-label="Delivery shift summary" data-field-summary>
          <SummaryItem>
            <SummaryValue>{active.length}</SummaryValue>
            <SummaryLabel>Active</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{completed.length}</SummaryValue>
            <SummaryLabel>Completed</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{failed.length}</SummaryValue>
            <SummaryLabel>Needs review</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>{formatPhp(codOutstanding)}</SummaryValue>
            <SummaryLabel>COD in queue</SummaryLabel>
          </SummaryItem>
        </Summary>

        {active.length > 1 ? (
          <QueueSection>
            <QueueHeader>
              <SectionTitle>Coming up</SectionTitle>
              <QueueLink href="/deliverer/deliveries">View full queue</QueueLink>
            </QueueHeader>
            <MiniQueue>
              {active.slice(1, 4).map((delivery) => {
                const customer = customers.find((item) => item.id === delivery.customerId);
                return (
                  <MiniItem key={delivery.id}>
                    <Time>{delivery.schedule.windowLabel}</Time>
                    <div>
                      <Meta>{customer?.displayName ?? delivery.address.recipientName}</Meta>
                      <Meta>{delivery.address.area} · {delivery.address.distanceKm.toFixed(1)} km</Meta>
                    </div>
                    <MiniLink href={`/deliverer/deliveries/${delivery.id}`}>Open</MiniLink>
                  </MiniItem>
                );
              })}
            </MiniQueue>
          </QueueSection>
        ) : null}
      </Root>
    </DelivererShell>
  );
}
