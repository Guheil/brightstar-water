'use client';

import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminPageHeader from '../components/AdminPageHeader';
import { ADMIN_ACTOR_ID, formatDateTime, getStatusTone, humanize } from '../utils';
import {
  AssignmentButton,
  AssignmentCopy,
  AssignmentField,
  AssignmentOption,
  AssignmentPanel,
  AssignmentTitle,
  ContentGrid,
  DetailList,
  DetailTerm,
  DetailValue,
  EmptyActionLink,
  InlineLink,
  Item,
  ItemList,
  ItemMeta,
  ItemName,
  MainColumn,
  Root,
  Section,
  SectionTitle,
} from './elements';
import type { DeliveryDetailScreenProps } from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

export default function DeliveryDetailScreen({
  deliveryId,
}: DeliveryDetailScreenProps) {
  const delivery = useAppStore((state) =>
    state.deliveries.records.find((item) => item.id === deliveryId),
  );
  const order = useAppStore((state) =>
    state.orders.records.find((item) => item.id === delivery?.orderId),
  );
  const customer = useAppStore((state) =>
    state.customers.records.find((item) => item.id === delivery?.customerId),
  );
  const payment = useAppStore((state) =>
    state.payments.records.find((item) => item.orderId === delivery?.orderId),
  );
  const deliverers = useAppStore((state) => state.deliveries.deliverers);
  const assignDelivery = useAppStore((state) => state.commands.assignDelivery);
  const [selectedDeliverer, setSelectedDeliverer] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  if (!delivery || !order) {
    return (
      <EmptyState
        action={
          <EmptyActionLink href="/admin/deliveries">Return to deliveries</EmptyActionLink>
        }
        description="This fictional delivery may have been removed when the demo state was reset."
        title="Delivery not found"
      />
    );
  }

  const canAssign =
    ['confirmed', 'preparing', 'assigned_for_delivery'].includes(order.status) &&
    ['unassigned', 'assigned', 'accepted'].includes(delivery.status);
  const currentDeliverer = deliverers.find((item) => item.id === delivery.delivererId);

  const confirmAssignment = () => {
    if (!selectedDeliverer) {
      setFeedback({
        tone: 'error',
        title: 'Choose a deliverer',
        message: 'Select an available fictional deliverer before continuing.',
      });
      setConfirmOpen(false);
      return;
    }

    const result = assignDelivery(
      order.id,
      selectedDeliverer,
      ADMIN_ACTOR_ID,
    );
    setFeedback(
      result.ok
        ? {
            tone: 'success',
            title: delivery.delivererId ? 'Delivery reassigned' : 'Delivery assigned',
            message: 'The deliverer queue and customer-facing order state are synchronized.',
          }
        : { tone: 'error', title: 'Assignment failed', message: result.error.message },
    );
    setConfirmOpen(false);
  };

  return (
    <Root>
      <AdminPageHeader
        backHref="/admin/deliveries"
        backLabel="Back to deliveries"
        description="Review only the customer and fulfillment information needed to coordinate this fictional delivery."
        title={`Delivery for ${order.reference}`}
      />

      {feedback ? (
        <Notice title={feedback.title} tone={feedback.tone}>
          {feedback.message}
        </Notice>
      ) : null}

      <ContentGrid>
        <MainColumn>
          <Section>
            <SectionTitle>Delivery summary</SectionTitle>
            <DetailList>
              <DetailTerm>Status</DetailTerm>
              <DetailValue>
                <StatusText tone={getStatusTone(delivery.status)}>
                  {humanize(delivery.status)}
                </StatusText>
              </DetailValue>
              <DetailTerm>Order</DetailTerm>
              <DetailValue>
                <InlineLink href={`/admin/orders/${order.id}`}>{order.reference}</InlineLink>
              </DetailValue>
              <DetailTerm>Schedule</DetailTerm>
              <DetailValue>
                {delivery.schedule.date} · {delivery.schedule.windowLabel}
              </DetailValue>
              <DetailTerm>Deliverer</DetailTerm>
              <DetailValue>{currentDeliverer?.displayName ?? 'Unassigned'}</DetailValue>
              <DetailTerm>Last update</DetailTerm>
              <DetailValue>{formatDateTime(delivery.updatedAt)}</DetailValue>
            </DetailList>
          </Section>

          <Section>
            <SectionTitle>Delivery contact</SectionTitle>
            <DetailList>
              <DetailTerm>Customer</DetailTerm>
              <DetailValue>{customer?.displayName ?? delivery.address.recipientName}</DetailValue>
              <DetailTerm>Contact placeholder</DetailTerm>
              <DetailValue>{delivery.address.phonePlaceholder}</DetailValue>
              <DetailTerm>Address</DetailTerm>
              <DetailValue>
                {delivery.address.addressLine}, {delivery.address.area},{' '}
                {delivery.address.municipality}, {delivery.address.province}
              </DetailValue>
              <DetailTerm>Demo distance</DetailTerm>
              <DetailValue>{delivery.address.distanceKm} km</DetailValue>
              <DetailTerm>Delivery note</DetailTerm>
              <DetailValue>{delivery.address.deliveryNote ?? 'No delivery note.'}</DetailValue>
            </DetailList>
          </Section>

          <Section>
            <SectionTitle>Items and collection</SectionTitle>
            <ItemList>
              {order.items.map((item) => (
                <Item key={item.productId}>
                  <div>
                    <ItemName>{item.name}</ItemName>
                    <ItemMeta>{item.sku}</ItemMeta>
                  </div>
                  <ItemMeta>× {item.quantity}</ItemMeta>
                </Item>
              ))}
            </ItemList>
            <DetailList>
              <DetailTerm>Payment method</DetailTerm>
              <DetailValue>{delivery.paymentMethod.toUpperCase()}</DetailValue>
              <DetailTerm>Payment status</DetailTerm>
              <DetailValue>{humanize(payment?.status ?? 'unknown')}</DetailValue>
              <DetailTerm>Amount to collect</DetailTerm>
              <DetailValue>{formatPhp(delivery.amountToCollectCentavos)}</DetailValue>
            </DetailList>
          </Section>

          {delivery.failure ? (
            <Section>
              <SectionTitle>Failed delivery record</SectionTitle>
              <DetailList>
                <DetailTerm>Reason</DetailTerm>
                <DetailValue>{humanize(delivery.failure.reason)}</DetailValue>
                <DetailTerm>Note</DetailTerm>
                <DetailValue>{delivery.failure.note ?? 'No note provided.'}</DetailValue>
                <DetailTerm>Reported</DetailTerm>
                <DetailValue>{formatDateTime(delivery.failure.reportedAt)}</DetailValue>
              </DetailList>
            </Section>
          ) : null}
        </MainColumn>

        <AssignmentPanel>
          <AssignmentTitle>Assignment</AssignmentTitle>
          {canAssign ? (
            <>
              <AssignmentCopy>
                Assignment is allowed only before delivery begins. Available demo deliverers are listed.
              </AssignmentCopy>
              <AssignmentField
                label="Deliverer"
                onChange={(event) => setSelectedDeliverer(event.target.value)}
                select
                value={selectedDeliverer}
              >
                {deliverers
                  .filter((item) => item.status === 'available')
                  .map((deliverer) => (
                    <AssignmentOption key={deliverer.id} value={deliverer.id}>
                      {deliverer.displayName}
                    </AssignmentOption>
                  ))}
              </AssignmentField>
              <AssignmentButton onClick={() => setConfirmOpen(true)}>
                {delivery.delivererId ? 'Reassign delivery' : 'Assign delivery'}
              </AssignmentButton>
            </>
          ) : (
            <AssignmentCopy>
              {order.status === 'pending_review'
                ? 'Confirm the order before assigning a deliverer.'
                : 'This delivery has started or reached a terminal state, so assignment is locked.'}
            </AssignmentCopy>
          )}
        </AssignmentPanel>
      </ContentGrid>

      <AdminConfirmDialog
        confirmLabel={delivery.delivererId ? 'Reassign delivery' : 'Assign delivery'}
        description="The selected deliverer queue and the customer-facing order status will update together."
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAssignment}
        open={confirmOpen}
        title={delivery.delivererId ? 'Reassign this delivery?' : 'Assign this delivery?'}
      />
    </Root>
  );
}
