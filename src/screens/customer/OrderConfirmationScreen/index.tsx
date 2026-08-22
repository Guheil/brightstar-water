'use client';

import { CircleCheckBig } from 'lucide-react';
import { EmptyState } from '@/components';
import { useAppStore } from '@/store';
import { formatPhp, getEstimatedScheduleText, getPreferredScheduleText } from '@/utils';
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
  const preferredSchedule = order ? getPreferredScheduleText(order.deliverySchedule) : null;

  if (!order) {
    return (
      <ConfirmationPage>
        <EmptyState
          action={<SecondaryLink href="/customer/orders">View orders</SecondaryLink>}
          description="The requested order could not be found."
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
          <Title>Order received</Title>
          <Lead>
            {lastPlacedOrderId === order.id
              ? 'Your cart has been cleared and the order is ready for review.'
              : 'Review the confirmation details for this order.'}
          </Lead>
        </HeadingGroup>
        <ReferencePanel>
          <ReferenceItem><dt>Order reference</dt><dd>{order.reference}</dd></ReferenceItem>
          <ReferenceItem><dt>Total</dt><dd>{formatPhp(order.totals.totalCentavos)}</dd></ReferenceItem>
          <ReferenceItem><dt>Estimated arrival</dt><dd>{getEstimatedScheduleText(order.deliverySchedule)}</dd></ReferenceItem>
          <ReferenceItem><dt>Delivery preference</dt><dd>{preferredSchedule ?? 'Earliest available'}</dd></ReferenceItem>
          <ReferenceItem>
            <dt>Payment state</dt>
            <dd>{payment?.status.replaceAll('_', ' ') ?? 'Not available'}</dd>
          </ReferenceItem>
        </ReferencePanel>
        <NextSection>
          <SectionTitle>What happens next</SectionTitle>
          <NextList>
            <li>Admin reviews and confirms the new order.</li>
            <li>Reserved stock remains unavailable to other orders.</li>
            <li>Admin assigns a deliverer and the tracking timeline updates.</li>
            <li>Loyalty points settle only after the delivery is completed.</li>
          </NextList>
        </NextSection>
        <Actions>
          <PrimaryLink href={`/customer/orders/${order.id}`}>Track this order</PrimaryLink>
          <SecondaryLink href="/">Choose a storefront</SecondaryLink>
        </Actions>
      </ConfirmationPanel>
    </ConfirmationPage>
  );
}
