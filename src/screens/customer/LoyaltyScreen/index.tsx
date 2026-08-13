'use client';

import { useMemo } from 'react';
import { EmptyState } from '@/components';
import { useAppStore } from '@/store';
import { calculateLoyaltyPesoValue, formatPhp } from '@/utils';
import { getActiveCustomerId } from '../_shared/customer';
import {
  ActivityCopy,
  ActivityDate,
  ActivityDescription,
  ActivityList,
  ActivityPoints,
  ActivityRow,
  BalanceEquivalent,
  BalanceLabel,
  BalancePanel,
  BalanceValue,
  ContentGrid,
  Hero,
  HeroCopy,
  Lead,
  LoyaltyPage,
  PendingPointsValue,
  RuleList,
  RulePanel,
  RuleRow,
  Section,
  SectionTitle,
  SupportingText,
  Title,
} from './elements';
import type { LoyaltyRuleRow } from './interface';

const RULES: readonly LoyaltyRuleRow[] = [
  { term: 'Qualification', value: 'At least ₱500 merchandise subtotal' },
  { term: 'Earning', value: '1 point for each complete ₱100 of qualifying subtotal' },
  { term: 'Value', value: '1 point displays as ₱1' },
  { term: 'Settlement', value: 'After a successful delivery' },
  { term: 'Bonus', value: 'Not currently available' },
  { term: 'Redemption', value: 'Not currently available' },
];

export default function LoyaltyScreen() {
  const customerId = useAppStore(getActiveCustomerId);
  const account = useAppStore((state) =>
    state.loyalty.accounts.find((item) => item.customerId === customerId),
  );
  const allActivity = useAppStore((state) => state.loyalty.activity);
  const allOrders = useAppStore((state) => state.orders.records);
  const activity = useMemo(
    () =>
      allActivity
        .filter((item) => item.customerId === customerId)
        .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allActivity, customerId],
  );
  const orders = useMemo(
    () => allOrders.filter((item) => item.customerId === customerId),
    [allOrders, customerId],
  );
  const pendingPoints = orders.reduce((total, order) => total + order.loyalty.pointsPending, 0);
  const points = account?.pointsAvailable ?? 0;

  return (
    <LoyaltyPage>
      <Hero>
        <HeroCopy>
          <Title>Loyalty points</Title>
          <Lead>
            Understand what has settled, what remains pending, and how points are earned.
          </Lead>
        </HeroCopy>
        <BalancePanel>
          <BalanceLabel>Available balance</BalanceLabel>
          <BalanceValue>{points} points</BalanceValue>
          <BalanceEquivalent>Displayed value: {formatPhp(calculateLoyaltyPesoValue(points))}</BalanceEquivalent>
        </BalancePanel>
      </Hero>

      <ContentGrid>
        <Section>
          <SectionTitle>Recent activity</SectionTitle>
          {activity.length ? (
            <ActivityList>
              {activity.map((item) => (
                <ActivityRow key={item.id}>
                  <ActivityCopy>
                    <ActivityDescription>{item.description}</ActivityDescription>
                    <ActivityDate>{item.createdAt.slice(0, 10)} · {item.type.replaceAll('_', ' ')}</ActivityDate>
                  </ActivityCopy>
                  <ActivityPoints>
                    {item.type === 'manual_debit' ? '−' : '+'}{item.points}
                  </ActivityPoints>
                </ActivityRow>
              ))}
            </ActivityList>
          ) : (
            <EmptyState
              description="Points activity appears after delivery or an account adjustment."
              title="No loyalty activity yet"
            />
          )}

          <SectionTitle>Qualification snapshot</SectionTitle>
          <PendingPointsValue>{pendingPoints} points pending</PendingPointsValue>
          <SupportingText>
            {pendingPoints} points are pending across current orders and settle after successful delivery.
          </SupportingText>
        </Section>

        <Section>
          <RulePanel>
            <SectionTitle>How points are earned</SectionTitle>
            <RuleList>
              {RULES.map((rule) => (
                <RuleRow key={rule.term}><dt>{rule.term}</dt><dd>{rule.value}</dd></RuleRow>
              ))}
            </RuleList>
          </RulePanel>
        </Section>
      </ContentGrid>
    </LoyaltyPage>
  );
}
