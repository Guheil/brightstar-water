'use client';

import { useEffect, useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { adminAssignDelivery, fetchOperationalDeliveryDetail } from '@/lib/orders/client';
import { useAppStore } from '@/store';
import { formatPhp, getEstimatedScheduleText, getPreferredScheduleText } from '@/utils';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDateTime, getStatusTone, humanize } from '../utils';
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
  const mergeOperationalSnapshot = useAppStore((state) => state.commands.mergeOperationalSnapshot);
  const [selectedDeliverer, setSelectedDeliverer] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [checkedDeliveryId, setCheckedDeliveryId] = useState<string | null>(null);
  const detailChecked = Boolean(delivery && order) || checkedDeliveryId === deliveryId;

  useEffect(() => {
    if (delivery && order) return;
    const controller = new AbortController();
    void fetchOperationalDeliveryDetail(deliveryId, controller.signal)
      .then((snapshot) => mergeOperationalSnapshot(snapshot))
      .catch(() => undefined)
      .finally(() => { if (!controller.signal.aborted) setCheckedDeliveryId(deliveryId); });
    return () => controller.abort();
  }, [delivery, deliveryId, mergeOperationalSnapshot, order]);

  if ((!delivery || !order) && !detailChecked) return <LoadingState label="Loading delivery" description="Retrieving the latest delivery state." />;

  if (!delivery || !order) {
    return (
      <EmptyState
        action={
          <EmptyActionLink href="/admin/deliveries">Return to deliveries</EmptyActionLink>
        }
        description="The requested delivery could not be found."
        title="Delivery not found"
      />
    );
  }

  const canAssign =
    ['confirmed', 'preparing', 'assigned_for_delivery'].includes(order.status) &&
    ['unassigned', 'assigned', 'accepted'].includes(delivery.status);
  const currentDeliverer = deliverers.find((item) => item.id === delivery.delivererId);

  const confirmAssignment = async () => {
    if (!selectedDeliverer) {
      setFeedback({ tone: 'error', title: 'Choose a deliverer', message: 'Select an available deliverer before continuing.' });
      setConfirmOpen(false);
      return;
    }
    try {
      await adminAssignDelivery(order.id, selectedDeliverer);
      mergeOperationalSnapshot(await fetchOperationalDeliveryDetail(delivery.id));
      setFeedback({
        tone: 'success',
        title: delivery.delivererId ? 'Delivery reassigned' : 'Delivery assigned',
        message: 'The deliverer queue and customer-facing order state are synchronized.',
      });
    } catch (error) {
      setFeedback({ tone: 'error', title: 'Assignment failed', message: error instanceof Error ? error.message : 'The delivery could not be assigned.' });
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <Root>
      <AdminPageHeader
        backHref="/admin/deliveries"
        backLabel="Back to deliveries"
        description="Review the customer, schedule, payment, and fulfillment details for this delivery."
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
              <DetailTerm>Estimated arrival</DetailTerm>
              <DetailValue>{getEstimatedScheduleText(delivery.schedule)}</DetailValue>
              <DetailTerm>Customer preference</DetailTerm>
              <DetailValue>{getPreferredScheduleText(delivery.schedule) ?? 'Earliest available'}</DetailValue>
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
              <DetailTerm>Contact</DetailTerm>
              <DetailValue>{delivery.address.phonePlaceholder}</DetailValue>
              <DetailTerm>Address</DetailTerm>
              <DetailValue>
                {delivery.address.addressLine}, {delivery.address.area},{' '}
                {delivery.address.municipality}, {delivery.address.province}
              </DetailValue>
              <DetailTerm>Distance</DetailTerm>
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
                Assignment is available before delivery begins. Choose an available deliverer.
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
        onConfirm={() => void confirmAssignment()}
        open={confirmOpen}
        title={delivery.delivererId ? 'Reassign this delivery?' : 'Assign this delivery?'}
      />
    </Root>
  );
}
