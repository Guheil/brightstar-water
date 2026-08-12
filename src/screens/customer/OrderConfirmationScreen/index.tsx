'use client';

import { CircleCheckBig } from 'lucide-react';
import { EmptyState, Notice } from '@/components';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import { useCustomerCart } from '../_shared/CustomerAreaShell';
import {
  Actions,
  ConfirmationPage,
  ConfirmationPanel,
  HeadingGroup,
  IconMark,
  Lead,
  NextList,
  NextSection,
  PrimaryLink,
  ReferenceItem,
  ReferencePanel,
  SecondaryLink,
  SectionTitle,
  Title,
} from './elements';
import type { OrderConfirmationScreenProps } from './interface';

export default function OrderConfirmationScreen({ orderId }: OrderConfirmationScreenProps) {
  const order = useAppStore((state) =>
    state.orders.records.find((item) => item.id === orderId),
  );
  const payment = useAppStore((state) =>
    state.payments.records.find((item) => item.orderId === orderId),
  );
  const { lastPlacedOrderId } = useCustomerCart();

  if (!order) {
    return (
      <ConfirmationPage>
        <EmptyState
          action={<SecondaryLink href="/customer/orders">View demo orders</SecondaryLink>}
          description="The requested order does not exist in the current prototype session."
          title="Order confirmation unavailable"
        />
      </ConfirmationPage>
    );
  }

  return (
    <ConfirmationPage>
      <ConfirmationPanel>
        <IconMark><CircleCheckBig aria-hidden="true" /></IconMark>
        <HeadingGroup>
          <Title>Demo order received</Title>
          <Lead>
            {lastPlacedOrderId === order.id
              ? 'Your cart was cleared and the shared prototype workflow now contains this order.'
              : 'This is a fictional confirmation record from the current prototype workspace.'}
          </Lead>
        </HeadingGroup>
        <Notice tone="success" title="No real purchase was made">
          The order, payment, address and schedule are presentation data only.
        </Notice>
        <ReferencePanel>
          <ReferenceItem><dt>Order reference</dt><dd>{order.reference}</dd></ReferenceItem>
          <ReferenceItem><dt>Total</dt><dd>{formatPhp(order.totals.totalCentavos)}</dd></ReferenceItem>
          <ReferenceItem><dt>Delivery date</dt><dd>{order.deliverySchedule.date}</dd></ReferenceItem>
          <ReferenceItem>
            <dt>Payment state</dt>
            <dd>{payment?.status.replaceAll('_', ' ') ?? 'Not available'}</dd>
          </ReferenceItem>
        </ReferencePanel>
        <NextSection>
          <SectionTitle>What happens next in the demo</SectionTitle>
          <NextList>
            <li>Admin reviews and confirms the new order.</li>
            <li>Reserved stock remains unavailable to other demo orders.</li>
            <li>Admin assigns a fictional deliverer and the tracking timeline updates.</li>
            <li>Loyalty points settle only after the delivery is completed.</li>
          </NextList>
        </NextSection>
        <Actions>
          <PrimaryLink href={`/customer/orders/${order.id}`}>Track this order</PrimaryLink>
          <SecondaryLink href="/shop">Continue shopping</SecondaryLink>
        </Actions>
      </ConfirmationPanel>
    </ConfirmationPage>
  );
}

