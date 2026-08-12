'use client';

import { useState } from 'react';
import Notice from '@/components/ui/Notice';
import { LOYALTY_CONFIG } from '@/config';
import { useAppStore } from '@/store';
import type { Customer } from '@/types';
import { formatPhp } from '@/utils';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminDataTable from '../components/AdminDataTable';
import type { AdminDataColumn } from '../components/AdminDataTable/interface';
import AdminPageHeader from '../components/AdminPageHeader';
import { ADMIN_ACTOR_ID, formatDateTime, humanize } from '../utils';
import {
  ActivityItem,
  ActivityList,
  ActivityMeta,
  ActivityText,
  AdjustmentForm,
  AdjustmentSection,
  CustomerLink,
  FormField,
  FormOption,
  Root,
  SectionCopy,
  SectionTitle,
  SubmitButton,
} from './elements';
import type { LoyaltyScreenProps } from './interface';

type Feedback = { tone: 'success' | 'error'; title: string; message: string };

export default function LoyaltyScreen({ className }: LoyaltyScreenProps) {
  const customers = useAppStore((state) => state.customers.records);
  const accounts = useAppStore((state) => state.loyalty.accounts);
  const activity = useAppStore((state) => state.loyalty.activity);
  const adjustLoyalty = useAppStore((state) => state.commands.adjustLoyalty);
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? '');
  const [pointsDelta, setPointsDelta] = useState('');
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const columns: readonly AdminDataColumn<Customer>[] = [
    {
      key: 'customer',
      label: 'Customer',
      render: (customer) => (
        <CustomerLink href={`/admin/customers/${customer.id}`}>
          {customer.displayName}
        </CustomerLink>
      ),
    },
    {
      key: 'points',
      label: 'Points',
      align: 'right',
      render: (customer) =>
        accounts.find((account) => account.customerId === customer.id)?.pointsAvailable ?? 0,
    },
    {
      key: 'peso_value',
      label: 'Prototype peso value',
      align: 'right',
      render: (customer) => {
        const points =
          accounts.find((account) => account.customerId === customer.id)?.pointsAvailable ?? 0;
        return formatPhp(points * LOYALTY_CONFIG.pesoValuePerPointCentavos);
      },
    },
    {
      key: 'last_activity',
      label: 'Last activity',
      render: (customer) => {
        const latest = activity
          .filter((item) => item.customerId === customer.id)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        return latest ? formatDateTime(latest.createdAt) : 'No activity';
      },
    },
  ];

  const reviewAdjustment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  const confirmAdjustment = () => {
    const result = adjustLoyalty({
      customerId,
      pointsDelta: Number(pointsDelta),
      reason,
      actorId: ADMIN_ACTOR_ID,
    });
    setFeedback(
      result.ok
        ? {
            tone: 'success',
            title: 'Loyalty balance updated',
            message: 'The fictional customer balance and loyalty history changed together.',
          }
        : { tone: 'error', title: 'Adjustment failed', message: result.error.message },
    );
    if (result.ok) {
      setPointsDelta('');
      setReason('');
    }
    setConfirmOpen(false);
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Review balances and record controlled, reasoned adjustments in the fictional loyalty history."
        title="Loyalty"
      />

      {feedback ? (
        <Notice title={feedback.title} tone={feedback.tone}>
          {feedback.message}
        </Notice>
      ) : null}

      <Notice title="Rule pending confirmation" tone="warning">
        {LOYALTY_CONFIG.notice} Manual adjustments are for demonstration and would require audited permissions in production.
      </Notice>

      <AdjustmentSection>
        <SectionTitle>Record a points adjustment</SectionTitle>
        <SectionCopy>Use a positive number to add points or a negative number to deduct them.</SectionCopy>
        <AdjustmentForm onSubmit={reviewAdjustment}>
          <FormField
            label="Customer"
            onChange={(event) => setCustomerId(event.target.value)}
            required
            select
            value={customerId}
          >
            {customers.map((customer) => (
              <FormOption key={customer.id} value={customer.id}>
                {customer.displayName}
              </FormOption>
            ))}
          </FormField>
          <FormField
            label="Points change"
            onChange={(event) => setPointsDelta(event.target.value)}
            required
            slotProps={{ htmlInput: { step: 1 } }}
            type="number"
            value={pointsDelta}
          />
          <FormField
            label="Reason"
            onChange={(event) => setReason(event.target.value)}
            required
            value={reason}
          />
          <SubmitButton type="submit">Review adjustment</SubmitButton>
        </AdjustmentForm>
      </AdjustmentSection>

      <section aria-labelledby="loyalty-balances-title">
        <SectionTitle id="loyalty-balances-title">Customer balances</SectionTitle>
        <AdminDataTable
          ariaLabel="Customer loyalty balances"
          columns={columns}
          getRowKey={(customer) => customer.id}
          rows={customers}
        />
      </section>

      <section aria-labelledby="loyalty-history-title">
        <SectionTitle id="loyalty-history-title">Recent loyalty activity</SectionTitle>
        <ActivityList>
          {activity.slice(0, 10).map((item) => {
            const customer = customers.find((candidate) => candidate.id === item.customerId);
            return (
              <ActivityItem key={item.id}>
                <ActivityText>{customer?.displayName ?? item.customerId}</ActivityText>
                <ActivityText>{item.description}</ActivityText>
                <ActivityMeta>
                  {item.type === 'manual_debit' ? '−' : '+'}
                  {item.points} · {humanize(item.type)}
                </ActivityMeta>
                <ActivityMeta>{formatDateTime(item.createdAt)}</ActivityMeta>
              </ActivityItem>
            );
          })}
        </ActivityList>
      </section>

      <AdminConfirmDialog
        confirmLabel="Apply points adjustment"
        description="The fictional customer balance will change and a reasoned loyalty activity record will be added."
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAdjustment}
        open={confirmOpen}
        title="Apply this loyalty adjustment?"
      />
    </Root>
  );
}
