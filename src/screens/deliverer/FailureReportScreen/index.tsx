'use client';

import { useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import DelivererShell from '@/components/layout/DelivererShell';
import Notice from '@/components/ui/Notice';
import { selectDeliveryById, selectOrderById, useAppStore } from '@/store';
import type { DeliveryFailureReason } from '@/types';
import { demoDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  Actions,
  CancelLink,
  FailureForm,
  Intro,
  Legend,
  NoteField,
  ReasonGroup,
  ReasonOption,
  Result,
  Root,
  SubmitButton,
} from './elements';
import type { FailureReportScreenProps } from './interface';

const REASONS: Array<{ value: DeliveryFailureReason; label: string }> = [
  { value: 'customer_unavailable', label: 'Customer was unavailable' },
  { value: 'incorrect_address', label: 'Address could not be confirmed' },
  { value: 'customer_requested_reschedule', label: 'Customer requested a reschedule' },
  { value: 'payment_issue', label: 'Cash collection or payment issue' },
  { value: 'other', label: 'Another reason' },
];

export default function FailureReportScreen({
  deliveryId,
}: FailureReportScreenProps) {
  const delivery = useAppStore(selectDeliveryById(deliveryId));
  const order = useAppStore(selectOrderById(delivery?.orderId ?? ''));
  const failDelivery = useAppStore((state) => state.commands.failDelivery);
  const [reason, setReason] = useState<DeliveryFailureReason>('customer_unavailable');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');

  const detailHref = `/deliverer/deliveries/${deliveryId}`;

  if (!delivery || !order) {
    return (
      <DelivererShell
        brandName="MRJE + Bright Star"
        navigation={delivererNavigation}
        headerTitle="Report unavailable"
      >
        <Notice tone="error" title="Delivery not found">
          This assignment is no longer available.
        </Notice>
      </DelivererShell>
    );
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = failDelivery(
      delivery.id,
      demoDelivererId,
      reason,
      note.trim() || undefined,
    );
    setMessage(
      result.ok
        ? 'Failure recorded. Admin can now review the order.'
        : result.error.message,
    );
  };

  return (
    <DelivererShell
      brandName="MRJE + Bright Star"
      navigation={delivererNavigation}
      activeHref="/deliverer/deliveries"
      headerTitle={`Report issue · ${order.reference}`}
      headerMeta={delivery.schedule.windowLabel}
    >
      <Root>
        <Notice tone="warning" title="This action updates the delivery">
          Reporting a failure marks this delivery as failed. It does
          not issue a refund or restore stock automatically.
        </Notice>
        <Intro>
          Choose the clearest operational reason. Add a short note only when it
          helps Admin decide what should happen next.
        </Intro>
        <FailureForm onSubmit={submit}>
          <FormControl component="fieldset">
            <Legend>Reason for failure</Legend>
            <ReasonGroup
              name="failure-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as DeliveryFailureReason)
              }
            >
              {REASONS.map((option) => (
                <ReasonOption
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </ReasonGroup>
          </FormControl>
          <NoteField
            label="Operational note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            multiline
            minRows={4}
            slotProps={{ htmlInput: { maxLength: 240 } }}
            helperText={`${note.length}/240 characters`}
          />
          <Actions>
            <SubmitButton type="submit" variant="contained" color="error">
              Confirm failed delivery
            </SubmitButton>
            <CancelLink href={detailHref}>Return to delivery</CancelLink>
          </Actions>
          {message ? <Result role="status">{message}</Result> : null}
        </FailureForm>
      </Root>
    </DelivererShell>
  );
}
