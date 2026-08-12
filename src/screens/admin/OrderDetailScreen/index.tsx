'use client';

import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import type { RefundStatus } from '@/types';
import { canRequestRefund, formatPhp } from '@/utils';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminPageHeader from '../components/AdminPageHeader';
import { ADMIN_ACTOR_ID, formatDateTime, getStatusTone, humanize } from '../utils';
import {
  ActionButton,
  ActionCopy,
  ActionField,
  ActionOption,
  ActionPanel,
  ActionTitle,
  ContentGrid,
  DangerButton,
  DetailList,
  DetailTerm,
  DetailValue,
  EmptyActionLink,
  InlineLink,
  ItemList,
  ItemMeta,
  ItemName,
  ItemRow,
  MainColumn,
  Root,
  SecondaryButton,
  Section,
  SectionTitle,
  SideColumn,
  Timeline,
  TimelineItem,
  TimelineLabel,
  TimelineMeta,
  Totals,
  TotalValue,
} from './elements';
import type { OrderDetailScreenProps } from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

type PendingAction =
  | { kind: 'confirm_order'; title: string; description: string; label: string }
  | { kind: 'prepare_order'; title: string; description: string; label: string }
  | { kind: 'assign'; title: string; description: string; label: string }
  | { kind: 'verify_payment'; title: string; description: string; label: string }
  | { kind: 'approve_cancellation'; title: string; description: string; label: string }
  | { kind: 'reject_cancellation'; title: string; description: string; label: string }
  | {
      kind: 'refund';
      target: RefundStatus;
      title: string;
      description: string;
      label: string;
    };

export default function OrderDetailScreen({ orderId }: OrderDetailScreenProps) {
  const order = useAppStore((state) =>
    state.orders.records.find((item) => item.id === orderId),
  );
  const customer = useAppStore((state) =>
    state.customers.records.find((item) => item.id === order?.customerId),
  );
  const payment = useAppStore((state) =>
    state.payments.records.find((item) => item.orderId === orderId),
  );
  const delivery = useAppStore((state) =>
    state.deliveries.records.find((item) => item.orderId === orderId),
  );
  const deliverers = useAppStore((state) => state.deliveries.deliverers);
  const commands = useAppStore((state) => state.commands);
  const [selectedDeliverer, setSelectedDeliverer] = useState('');
  const [demoReference, setDemoReference] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  if (!order) {
    return (
      <EmptyState
        action={<EmptyActionLink href="/admin/orders">Return to orders</EmptyActionLink>}
        description="This fictional order may have been removed when the demo state was reset."
        title="Order not found"
      />
    );
  }

  const reportResult = (
    result: { ok: true } | { ok: false; error: { message: string } },
    successTitle: string,
  ) => {
    setFeedback(
      result.ok
        ? { tone: 'success', title: successTitle, message: 'Shared demo state updated.' }
        : { tone: 'error', title: 'Update failed', message: result.error.message },
    );
  };

  const executePendingAction = () => {
    if (!pendingAction) return;

    switch (pendingAction.kind) {
      case 'confirm_order':
        reportResult(commands.confirmOrder(order.id, ADMIN_ACTOR_ID), 'Order confirmed');
        break;
      case 'prepare_order':
        reportResult(
          commands.markOrderPreparing(order.id, ADMIN_ACTOR_ID),
          'Preparation started',
        );
        break;
      case 'assign': {
        const effectiveDeliverer = selectedDeliverer || delivery?.delivererId;
        if (!effectiveDeliverer) {
          setFeedback({
            tone: 'error',
            title: 'Choose a deliverer',
            message: 'Select an available fictional deliverer before assigning this order.',
          });
          break;
        }
        reportResult(
          commands.assignDelivery(order.id, effectiveDeliverer, ADMIN_ACTOR_ID),
          delivery?.delivererId ? 'Delivery reassigned' : 'Delivery assigned',
        );
        break;
      }
      case 'verify_payment':
        reportResult(
          commands.verifyPayment(order.id, ADMIN_ACTOR_ID, demoReference),
          'Demo payment verified',
        );
        break;
      case 'approve_cancellation':
        reportResult(
          commands.resolveCancellation(
            order.id,
            ADMIN_ACTOR_ID,
            'approve',
            reviewNote,
          ),
          'Cancellation approved',
        );
        break;
      case 'reject_cancellation':
        reportResult(
          commands.resolveCancellation(
            order.id,
            ADMIN_ACTOR_ID,
            'reject',
            reviewNote,
          ),
          'Cancellation rejected',
        );
        break;
      case 'refund':
        reportResult(
          commands.updateRefund(
            order.id,
            ADMIN_ACTOR_ID,
            pendingAction.target,
            reviewNote,
          ),
          `Refund ${humanize(pendingAction.target).toLowerCase()}`,
        );
        break;
    }

    setPendingAction(null);
  };

  const cancellationRequested = order.cancellation?.status === 'requested';
  const canBeginRefund = Boolean(
    payment && canRequestRefund(order, payment.status),
  );
  const canAssignDelivery = Boolean(
    delivery &&
      ['confirmed', 'preparing', 'assigned_for_delivery'].includes(order.status) &&
      ['unassigned', 'assigned', 'accepted'].includes(delivery.status),
  );

  return (
    <Root>
      <AdminPageHeader
        backHref="/admin/orders"
        backLabel="Back to orders"
        description="Review fulfillment, payment, delivery, inventory, loyalty, and exception state in one workspace."
        title={order.reference}
      />

      {feedback ? (
        <Notice title={feedback.title} tone={feedback.tone}>
          {feedback.message}
        </Notice>
      ) : null}

      <Notice title="Prototype workflow" tone="info">
        Every action here updates fictional frontend state only. Final order, cancellation, refund, and payment rules still require stakeholder confirmation.
      </Notice>

      <ContentGrid>
        <MainColumn>
          <Section>
            <SectionTitle>Order and customer</SectionTitle>
            <DetailList>
              <DetailTerm>Status</DetailTerm>
              <DetailValue>
                <StatusText tone={getStatusTone(order.status)}>
                  {humanize(order.status)}
                </StatusText>
              </DetailValue>
              <DetailTerm>Customer</DetailTerm>
              <DetailValue>
                {customer ? (
                  <InlineLink href={`/admin/customers/${customer.id}`}>
                    {customer.displayName}
                  </InlineLink>
                ) : (
                  'Unknown demo customer'
                )}
              </DetailValue>
              <DetailTerm>Contact</DetailTerm>
              <DetailValue>{customer?.phonePlaceholder ?? 'Not available'}</DetailValue>
              <DetailTerm>Placed</DetailTerm>
              <DetailValue>{formatDateTime(order.placedAt)}</DetailValue>
              <DetailTerm>Delivery schedule</DetailTerm>
              <DetailValue>
                {order.deliverySchedule.date} · {order.deliverySchedule.windowLabel}
              </DetailValue>
              <DetailTerm>Customer note</DetailTerm>
              <DetailValue>{order.customerNote ?? 'No customer note.'}</DetailValue>
              <DetailTerm>Inventory state</DetailTerm>
              <DetailValue>{humanize(order.inventoryReservationStatus)}</DetailValue>
            </DetailList>
          </Section>

          <Section>
            <SectionTitle>Products and totals</SectionTitle>
            <ItemList>
              {order.items.map((item) => (
                <ItemRow key={item.productId}>
                  <div>
                    <ItemName>{item.name}</ItemName>
                    <ItemMeta>{item.sku}</ItemMeta>
                  </div>
                  <ItemMeta>× {item.quantity}</ItemMeta>
                  <ItemMeta>{formatPhp(item.lineTotalCentavos)}</ItemMeta>
                </ItemRow>
              ))}
            </ItemList>
            <Totals>
              <DetailTerm>Subtotal</DetailTerm>
              <TotalValue>{formatPhp(order.totals.subtotalCentavos)}</TotalValue>
              <DetailTerm>Delivery fee</DetailTerm>
              <TotalValue>{formatPhp(order.totals.deliveryFeeCentavos)}</TotalValue>
              <DetailTerm>Loyalty discount</DetailTerm>
              <TotalValue>{formatPhp(order.totals.loyaltyDiscountCentavos)}</TotalValue>
              <DetailTerm>Total</DetailTerm>
              <TotalValue>{formatPhp(order.totals.totalCentavos)}</TotalValue>
            </Totals>
          </Section>

          <Section>
            <SectionTitle>Payment and delivery</SectionTitle>
            <DetailList>
              <DetailTerm>Payment method</DetailTerm>
              <DetailValue>{order.paymentMethod.toUpperCase()}</DetailValue>
              <DetailTerm>Payment status</DetailTerm>
              <DetailValue>
                {payment ? (
                  <StatusText tone={getStatusTone(payment.status)}>
                    {humanize(payment.status)}
                  </StatusText>
                ) : (
                  'No payment record'
                )}
              </DetailValue>
              <DetailTerm>Demo reference</DetailTerm>
              <DetailValue>{payment?.demoReference ?? 'Not recorded'}</DetailValue>
              <DetailTerm>Delivery state</DetailTerm>
              <DetailValue>
                {delivery ? (
                  <InlineLink href={`/admin/deliveries/${delivery.id}`}>
                    {humanize(delivery.status)}
                  </InlineLink>
                ) : (
                  'No delivery record'
                )}
              </DetailValue>
              <DetailTerm>Assigned deliverer</DetailTerm>
              <DetailValue>
                {deliverers.find((item) => item.id === delivery?.delivererId)
                  ?.displayName ?? 'Unassigned'}
              </DetailValue>
              <DetailTerm>Loyalty effect</DetailTerm>
              <DetailValue>
                {order.loyalty.pointsAwarded} awarded · {order.loyalty.pointsPending} pending
              </DetailValue>
            </DetailList>
          </Section>

          {order.cancellation ? (
            <Section>
              <SectionTitle>Cancellation record</SectionTitle>
              <DetailList>
                <DetailTerm>Status</DetailTerm>
                <DetailValue>{humanize(order.cancellation.status)}</DetailValue>
                <DetailTerm>Reason</DetailTerm>
                <DetailValue>{order.cancellation.reason}</DetailValue>
                <DetailTerm>Review note</DetailTerm>
                <DetailValue>{order.cancellation.reviewNote ?? 'Not reviewed yet'}</DetailValue>
              </DetailList>
            </Section>
          ) : null}

          {order.refund ? (
            <Section>
              <SectionTitle>Refund record</SectionTitle>
              <DetailList>
                <DetailTerm>Status</DetailTerm>
                <DetailValue>{humanize(order.refund.status)}</DetailValue>
                <DetailTerm>Amount</DetailTerm>
                <DetailValue>{formatPhp(order.refund.amountCentavos)}</DetailValue>
                <DetailTerm>Reason</DetailTerm>
                <DetailValue>{order.refund.reason}</DetailValue>
                <DetailTerm>Resolution note</DetailTerm>
                <DetailValue>{order.refund.resolutionNote ?? 'Not resolved yet'}</DetailValue>
              </DetailList>
            </Section>
          ) : null}

          <Section>
            <SectionTitle>Order timeline</SectionTitle>
            <Timeline>
              {[...order.events].reverse().map((event) => (
                <TimelineItem key={event.id}>
                  <TimelineLabel>{event.label}</TimelineLabel>
                  <TimelineMeta>
                    {formatDateTime(event.occurredAt)} · {humanize(event.actorRole)}
                  </TimelineMeta>
                  {event.description ? <TimelineMeta>{event.description}</TimelineMeta> : null}
                </TimelineItem>
              ))}
            </Timeline>
          </Section>
        </MainColumn>

        <SideColumn>
          {order.status === 'pending_review' ? (
            <ActionPanel>
              <ActionTitle>Review order</ActionTitle>
              <ActionCopy>Confirming allows preparation and delivery assignment.</ActionCopy>
              <ActionButton
                onClick={() =>
                  setPendingAction({
                    kind: 'confirm_order',
                    title: 'Confirm this order?',
                    description:
                      'The order will move to Confirmed and become eligible for preparation and assignment.',
                    label: 'Confirm order',
                  })
                }
              >
                Confirm order
              </ActionButton>
            </ActionPanel>
          ) : null}

          {order.status === 'confirmed' ? (
            <ActionPanel>
              <ActionTitle>Preparation</ActionTitle>
              <ActionCopy>Mark the order as actively being prepared.</ActionCopy>
              <ActionButton
                onClick={() =>
                  setPendingAction({
                    kind: 'prepare_order',
                    title: 'Start order preparation?',
                    description:
                      'Customers will see the shared order state change to Preparing.',
                    label: 'Start preparation',
                  })
                }
              >
                Start preparation
              </ActionButton>
            </ActionPanel>
          ) : null}

          {delivery && canAssignDelivery ? (
            <ActionPanel>
              <ActionTitle>Delivery assignment</ActionTitle>
              <ActionCopy>Only available fictional deliverers can be selected.</ActionCopy>
              <ActionField
                label="Deliverer"
                onChange={(event) => setSelectedDeliverer(event.target.value)}
                select
                value={selectedDeliverer || delivery.delivererId || ''}
              >
                {deliverers
                  .filter((item) => item.status === 'available')
                  .map((deliverer) => (
                    <ActionOption key={deliverer.id} value={deliverer.id}>
                      {deliverer.displayName}
                    </ActionOption>
                  ))}
              </ActionField>
              <ActionButton
                onClick={() =>
                  setPendingAction({
                    kind: 'assign',
                    title: delivery.delivererId
                      ? 'Reassign this delivery?'
                      : 'Assign this delivery?',
                    description:
                      'The selected deliverer queue and the customer order state will update together.',
                    label: delivery.delivererId ? 'Reassign delivery' : 'Assign delivery',
                  })
                }
              >
                {delivery.delivererId ? 'Reassign delivery' : 'Assign delivery'}
              </ActionButton>
            </ActionPanel>
          ) : null}

          {payment?.method === 'gcash' && payment.status === 'awaiting_verification' ? (
            <ActionPanel>
              <ActionTitle>Fictional GCash verification</ActionTitle>
              <ActionCopy>Never enter a real transaction ID or payment credential.</ActionCopy>
              <ActionField
                label="Demo reference (optional)"
                onChange={(event) => setDemoReference(event.target.value)}
                value={demoReference}
              />
              <ActionButton
                onClick={() =>
                  setPendingAction({
                    kind: 'verify_payment',
                    title: 'Verify this fictional payment?',
                    description:
                      'This records a demo verification only. It does not contact GCash or move money.',
                    label: 'Verify demo payment',
                  })
                }
              >
                Verify demo payment
              </ActionButton>
            </ActionPanel>
          ) : null}

          {cancellationRequested ? (
            <ActionPanel>
              <ActionTitle>Cancellation review</ActionTitle>
              <ActionCopy>Approval may release reserved inventory and cancel delivery.</ActionCopy>
              <ActionField
                label="Review note (optional)"
                multiline
                onChange={(event) => setReviewNote(event.target.value)}
                rows={3}
                value={reviewNote}
              />
              <ActionButton
                onClick={() =>
                  setPendingAction({
                    kind: 'approve_cancellation',
                    title: 'Approve cancellation?',
                    description:
                      'The order will be cancelled and reserved stock may return to availability.',
                    label: 'Approve cancellation',
                  })
                }
              >
                Approve cancellation
              </ActionButton>
              <DangerButton
                onClick={() =>
                  setPendingAction({
                    kind: 'reject_cancellation',
                    title: 'Reject cancellation?',
                    description:
                      'The request will be closed as rejected and the order will keep its current workflow state.',
                    label: 'Reject request',
                  })
                }
              >
                Reject request
              </DangerButton>
            </ActionPanel>
          ) : null}

          {canBeginRefund ? (
            <ActionPanel>
              <ActionTitle>Refund workflow</ActionTitle>
              <ActionCopy>Start a fictional refund record for this eligible payment.</ActionCopy>
              <ActionButton
                onClick={() =>
                  setPendingAction({
                    kind: 'refund',
                    target: 'pending',
                    title: 'Start refund review?',
                    description:
                      'A fictional pending refund will be recorded against this order and payment.',
                    label: 'Start refund',
                  })
                }
              >
                Start refund
              </ActionButton>
            </ActionPanel>
          ) : null}

          {order.refund && ['pending', 'processing'].includes(order.refund.status) ? (
            <ActionPanel>
              <ActionTitle>Advance refund</ActionTitle>
              <ActionCopy>Record a note before resolving the fictional refund.</ActionCopy>
              <ActionField
                label="Refund note (optional)"
                multiline
                onChange={(event) => setReviewNote(event.target.value)}
                rows={3}
                value={reviewNote}
              />
              {order.refund.status === 'pending' ? (
                <ActionButton
                  onClick={() =>
                    setPendingAction({
                      kind: 'refund',
                      target: 'processing',
                      title: 'Move refund to processing?',
                      description:
                        'The refund will remain unresolved but move to the next fictional workflow state.',
                      label: 'Mark processing',
                    })
                  }
                >
                  Mark processing
                </ActionButton>
              ) : (
                <ActionButton
                  onClick={() =>
                    setPendingAction({
                      kind: 'refund',
                      target: 'refunded',
                      title: 'Mark refund complete?',
                      description:
                        'The payment will be marked Refunded. This does not move real money.',
                      label: 'Mark refunded',
                    })
                  }
                >
                  Mark refunded
                </ActionButton>
              )}
              <DangerButton
                onClick={() =>
                  setPendingAction({
                    kind: 'refund',
                    target: 'rejected',
                    title: 'Reject this refund?',
                    description:
                      'The refund record will be closed as rejected with the current note.',
                    label: 'Reject refund',
                  })
                }
              >
                Reject refund
              </DangerButton>
            </ActionPanel>
          ) : null}

          {!['pending_review', 'confirmed'].includes(order.status) &&
          !cancellationRequested &&
          !canBeginRefund &&
          !order.refund &&
          !canAssignDelivery ? (
            <ActionPanel>
              <ActionTitle>No Admin action required</ActionTitle>
              <ActionCopy>
                This order is waiting for its next role-specific workflow event or is complete.
              </ActionCopy>
              {delivery ? (
                <SecondaryButton href={`/admin/deliveries/${delivery.id}`}>
                  Review delivery
                </SecondaryButton>
              ) : null}
            </ActionPanel>
          ) : null}
        </SideColumn>
      </ContentGrid>

      <AdminConfirmDialog
        confirmLabel={pendingAction?.label ?? 'Confirm'}
        description={pendingAction?.description ?? ''}
        onClose={() => setPendingAction(null)}
        onConfirm={executePendingAction}
        open={Boolean(pendingAction)}
        title={pendingAction?.title ?? 'Confirm update'}
      />
    </Root>
  );
}
