'use client';

import { useState } from 'react';
import DelivererShell from '@/components/layout/DelivererShell';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { selectDeliveryById, selectOrderById, selectPaymentForOrder, useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import { demoDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  ActionButton,
  ActionPanel,
  Column,
  DetailGrid,
  FailureLink,
  Item,
  Items,
  Result,
  Root,
  Section,
  SectionTitle,
  Strong,
  Text,
} from './elements';
import type { DeliveryDetailScreenProps } from './interface';

export default function DeliveryDetailScreen({
  deliveryId,
}: DeliveryDetailScreenProps) {
  const delivery = useAppStore(selectDeliveryById(deliveryId));
  const order = useAppStore(selectOrderById(delivery?.orderId ?? ''));
  const payment = useAppStore(selectPaymentForOrder(delivery?.orderId ?? ''));
  const commands = useAppStore((state) => state.commands);
  const [message, setMessage] = useState('');

  if (!delivery || !order) {
    return (
      <DelivererShell
        brandName="MRJE + Bright Star"
        navigation={delivererNavigation}
        headerTitle="Delivery unavailable"
      >
        <Notice tone="error" title="Delivery not found">
          This assignment is no longer available.
        </Notice>
      </DelivererShell>
    );
  }

  const run = (action: 'accept' | 'start' | 'complete') => {
    const result =
      action === 'accept'
        ? commands.acceptDelivery(delivery.id, demoDelivererId)
        : action === 'start'
          ? commands.startDelivery(delivery.id, demoDelivererId)
          : commands.completeDelivery(delivery.id, demoDelivererId);
    setMessage(result.ok ? 'Delivery state updated.' : result.error.message);
  };

  return (
    <DelivererShell
      brandName="MRJE + Bright Star"
      navigation={delivererNavigation}
      activeHref="/deliverer/deliveries"
      headerTitle={order.reference}
      headerMeta={`${delivery.schedule.date} · ${delivery.schedule.windowLabel}`}
    >
      <Root>
        <DetailGrid>
          <Column>
            <Section aria-labelledby="delivery-address-title">
              <SectionTitle id="delivery-address-title">Delivery</SectionTitle>
              <Strong>{delivery.address.recipientName}</Strong>
              <Text>{delivery.address.phonePlaceholder}</Text>
              <Text>{delivery.address.addressLine}</Text>
              <Text>
                {delivery.address.area}, {delivery.address.municipality},{' '}
                {delivery.address.province}
              </Text>
              {delivery.address.deliveryNote ? (
                <Text>{delivery.address.deliveryNote}</Text>
              ) : null}
            </Section>
            <Section aria-labelledby="delivery-items-title">
              <SectionTitle id="delivery-items-title">Order items</SectionTitle>
              <Items>
                {order.items.map((item) => (
                  <Item key={item.productId}>
                    <Text>{item.name}</Text>
                    <Strong>× {item.quantity}</Strong>
                  </Item>
                ))}
              </Items>
            </Section>
            <Section aria-labelledby="delivery-payment-title">
              <SectionTitle id="delivery-payment-title">Payment</SectionTitle>
              <Strong>{delivery.paymentMethod.toUpperCase()}</Strong>
              <Text>
                {delivery.paymentMethod === 'cod'
                  ? `${formatPhp(delivery.amountToCollectCentavos)} to collect`
                  : `Payment status: ${payment?.status.replaceAll('_', ' ') ?? 'unavailable'}`}
              </Text>
            </Section>
          </Column>
          <ActionPanel>
            <SectionTitle>Update progress</SectionTitle>
            <StatusText tone={delivery.status === 'delivered' ? 'success' : 'info'}>
              {delivery.status.replaceAll('_', ' ')}
            </StatusText>
            {delivery.status === 'assigned' ? (
              <ActionButton variant="contained" onClick={() => run('accept')}>
                Accept assignment
              </ActionButton>
            ) : null}
            {delivery.status === 'accepted' ? (
              <ActionButton variant="contained" onClick={() => run('start')}>
                Start delivery
              </ActionButton>
            ) : null}
            {delivery.status === 'out_for_delivery' ? (
              <>
                <ActionButton variant="contained" onClick={() => run('complete')}>
                  Mark delivered
                </ActionButton>
                <FailureLink href={`/deliverer/deliveries/${delivery.id}/report-failure`}>
                  Report failed delivery
                </FailureLink>
              </>
            ) : null}
            {message ? <Result role="status">{message}</Result> : null}
          </ActionPanel>
        </DetailGrid>
      </Root>
    </DelivererShell>
  );
}
