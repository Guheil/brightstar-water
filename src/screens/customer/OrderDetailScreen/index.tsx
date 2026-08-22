'use client';

import { useEffect, useState } from 'react';
import { EmptyState, LoadingState, Notice, StatusText } from '@/components';
import { fetchOperationalOrderDetail, requestOrderCancellation } from '@/lib/orders/client';
import { useAppStore } from '@/store';
import { canCancelOrder, formatPhp, getEstimatedScheduleText, getPreferredScheduleText } from '@/utils';
import { getActiveCustomerId } from '../_shared/customer';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONES,
  REFUND_STATUS_LABELS,
} from '../_shared/orderPresentation';
import {
  AddressText,
  BackLink,
  CancelButton,
  CancellationForm,
  ContentGrid,
  DateText,
  DefinitionList,
  DefinitionRow,
  DefinitionTotal,
  DetailPage,
  DismissButton,
  FormActions,
  Header,
  HeadingCopy,
  ItemCopy,
  ItemList,
  ItemRow,
  ItemTotal,
  MainColumn,
  Panel,
  ReasonField,
  Section,
  SectionTitle,
  SideColumn,
  SubmitButton,
  Timeline,
  TimelineCopy,
  TimelineDot,
  TimelineItem,
  TimelineLabel,
  TimelineMeta,
  Title,
} from './elements';
import type { CancellationFormState, OrderDetailScreenProps } from './interface';

export default function OrderDetailScreen({ orderId }: OrderDetailScreenProps) {
  const customerId = useAppStore(getActiveCustomerId);
  const order = useAppStore((state) => state.orders.records.find((item) => item.id === orderId));
  const delivery = useAppStore((state) => state.deliveries.records.find((item) => item.orderId === orderId));
  const payment = useAppStore((state) => state.payments.records.find((item) => item.orderId === orderId));
  const mergeOperationalSnapshot = useAppStore((state) => state.commands.mergeOperationalSnapshot);
  const [detailChecked, setDetailChecked] = useState(Boolean(order));
  const [cancellationForm, setCancellationForm] = useState<CancellationFormState>({
    open: false,
    reason: '',
    error: null,
  });

  useEffect(() => {
    if (order && order.customerId === customerId) { setDetailChecked(true); return; }
    const controller = new AbortController();
    setDetailChecked(false);
    void fetchOperationalOrderDetail(orderId, controller.signal)
      .then((snapshot) => mergeOperationalSnapshot(snapshot))
      .catch(() => undefined)
      .finally(() => { if (!controller.signal.aborted) setDetailChecked(true); });
    return () => controller.abort();
  }, [customerId, mergeOperationalSnapshot, order, orderId]);

  if ((!order || order.customerId !== customerId) && !detailChecked) {
    return <DetailPage><LoadingState label="Loading order" description="Retrieving your latest order details." /></DetailPage>;
  }

  if (!order || order.customerId !== customerId) {
    return (
      <DetailPage>
        <EmptyState
          action={<BackLink href="/customer/orders">Return to my orders</BackLink>}
          description="This order is unavailable or does not belong to the active customer account."
          title="Order not found"
        />
      </DetailPage>
    );
  }

  const submitCancellation = async () => {
    try {
      await requestOrderCancellation(order.id, cancellationForm.reason);
      mergeOperationalSnapshot(await fetchOperationalOrderDetail(order.id));
      setCancellationForm({ open: false, reason: '', error: null });
    } catch (error) {
      setCancellationForm((current) => ({
        ...current,
        error: error instanceof Error ? error.message : 'The cancellation request could not be sent.',
      }));
    }
  };

  return (
    <DetailPage>
      <Header>
        <HeadingCopy>
          <BackLink href="/customer/orders">Back to my orders</BackLink>
          <Title>{order.reference}</Title>
          <DateText>Placed {order.placedAt.slice(0, 10)}</DateText>
        </HeadingCopy>
        <StatusText tone={ORDER_STATUS_TONES[order.status]}>
          {ORDER_STATUS_LABELS[order.status]}
        </StatusText>
      </Header>

      <ContentGrid>
        <MainColumn>
          {order.cancellation ? (
            <Notice
              title={`Cancellation ${order.cancellation.status}`}
              tone={
                order.cancellation.status === 'approved'
                  ? 'success'
                  : order.cancellation.status === 'rejected'
                    ? 'error'
                    : 'warning'
              }
            >
              {order.cancellation.reason}
              {order.cancellation.reviewNote ? ` Review: ${order.cancellation.reviewNote}` : ''}
            </Notice>
          ) : null}

          {order.refund ? (
            <Notice
              title={REFUND_STATUS_LABELS[order.refund.status]}
              tone={order.refund.status === 'refunded' ? 'success' : order.refund.status === 'rejected' ? 'error' : 'info'}
            >
              {formatPhp(order.refund.amountCentavos)} · {order.refund.reason}
            </Notice>
          ) : order.status === 'delivery_failed' && payment && ['verified', 'paid'].includes(payment.status) ? (
            <Notice title="Refund review is available to Admin" tone="warning">
              A failed delivery requires Admin review before refund or inventory changes are processed.
            </Notice>
          ) : null}

          <Section>
            <SectionTitle>Order timeline</SectionTitle>
            <Timeline>
              {order.events.map((event) => (
                <TimelineItem key={event.id}>
                  <TimelineDot aria-hidden="true" />
                  <TimelineCopy>
                    <TimelineLabel>{event.label}</TimelineLabel>
                    <TimelineMeta>{event.occurredAt.replace('T', ' ').slice(0, 16)} · {event.actorRole}</TimelineMeta>
                    {event.description ? <TimelineMeta>{event.description}</TimelineMeta> : null}
                  </TimelineCopy>
                </TimelineItem>
              ))}
            </Timeline>
          </Section>

          <Section>
            <SectionTitle>Products</SectionTitle>
            <ItemList>
              {order.items.map((item) => (
                <ItemRow key={item.productId}>
                  <ItemCopy>{item.name} × {item.quantity}</ItemCopy>
                  <ItemTotal>{formatPhp(item.lineTotalCentavos)}</ItemTotal>
                </ItemRow>
              ))}
            </ItemList>
          </Section>

          {canCancelOrder(order) ? (
            <Section>
              <SectionTitle>Need to cancel?</SectionTitle>
              <AddressText>
                Requests are allowed before the order goes out for delivery and require Admin review.
              </AddressText>
              {!cancellationForm.open ? (
                <CancelButton
                  onClick={() => setCancellationForm((current) => ({ ...current, open: true }))}
                  variant="outlined"
                >
                  Request cancellation
                </CancelButton>
              ) : (
                <CancellationForm
                  onSubmit={(event) => {
                    event.preventDefault();
                    submitCancellation();
                  }}
                >
                  {cancellationForm.error ? <Notice tone="error">{cancellationForm.error}</Notice> : null}
                  <ReasonField
                    autoFocus
                    helperText="Enter at least 4 characters."
                    label="Reason for cancellation"
                    minRows={3}
                    multiline
                    onChange={(event) =>
                      setCancellationForm((current) => ({
                        ...current,
                        reason: event.target.value,
                        error: null,
                      }))
                    }
                    required
                    value={cancellationForm.reason}
                  />
                  <FormActions>
                    <SubmitButton type="submit" variant="contained">Send request</SubmitButton>
                    <DismissButton
                      onClick={() => setCancellationForm({ open: false, reason: '', error: null })}
                      type="button"
                    >
                      Keep order
                    </DismissButton>
                  </FormActions>
                </CancellationForm>
              )}
            </Section>
          ) : null}
        </MainColumn>

        <SideColumn>
          <Panel>
            <SectionTitle>Payment and totals</SectionTitle>
            <DefinitionList>
              <DefinitionRow><dt>Payment</dt><dd>{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'GCash'}</dd></DefinitionRow>
              <DefinitionRow><dt>Payment state</dt><dd>{payment?.status.replaceAll('_', ' ') ?? 'Unavailable'}</dd></DefinitionRow>
              <DefinitionRow><dt>Subtotal</dt><dd>{formatPhp(order.totals.subtotalCentavos)}</dd></DefinitionRow>
              <DefinitionRow><dt>Delivery</dt><dd>{formatPhp(order.totals.deliveryFeeCentavos)}</dd></DefinitionRow>
              <DefinitionTotal><dt>Total</dt><dd>{formatPhp(order.totals.totalCentavos)}</dd></DefinitionTotal>
            </DefinitionList>
          </Panel>

          <Panel>
            <SectionTitle>Delivery</SectionTitle>
            <AddressText>{delivery?.address.addressLine}</AddressText>
            <AddressText>{delivery?.address.municipality}, {delivery?.address.province}</AddressText>
            <AddressText>Estimated: {getEstimatedScheduleText(order.deliverySchedule)}</AddressText>
            <AddressText>Preference: {getPreferredScheduleText(order.deliverySchedule) ?? 'Earliest available'}</AddressText>
            <AddressText>Status: {delivery?.status.replaceAll('_', ' ') ?? 'Unavailable'}</AddressText>
          </Panel>

          <Panel>
            <SectionTitle>Loyalty effect</SectionTitle>
            <AddressText>{order.loyalty.pointsPending} points pending</AddressText>
            <AddressText>{order.loyalty.pointsAwarded} points awarded</AddressText>
            <AddressText>Points settle after successful delivery. Redemption remains disabled.</AddressText>
          </Panel>
        </SideColumn>
      </ContentGrid>
    </DetailPage>
  );
}
