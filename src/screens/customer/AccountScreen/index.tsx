'use client';

import { ArrowRight, PackageSearch } from 'lucide-react';
import { EmptyState, StatusText } from '@/components';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import { getActiveCustomerId } from '../_shared/customer';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../_shared/orderPresentation';
import {
  AccountIdentity,
  AccountPage,
  ActionDescription,
  ActionLabel,
  ActionList,
  ActionRow,
  ActionText,
  ContentGrid,
  IdentityTerm,
  IdentityValue,
  InlineLink,
  IntroCopy,
  IntroGrid,
  Lead,
  OrderMeta,
  OrderPanel,
  OrderReference,
  OrderTopline,
  PointsValue,
  Section,
  SectionHeader,
  SectionTitle,
  SupportingText,
  Title,
} from './elements';
import type { AccountAction } from './interface';

const ACCOUNT_ACTIONS: readonly AccountAction[] = [
  {
    href: '/customer/profile',
    label: 'Profile and delivery addresses',
    description: 'Review the fictional contact and saved address information.',
  },
  {
    href: '/customer/orders',
    label: 'Order history',
    description: 'Follow active deliveries and review previous orders.',
  },
  {
    href: '/customer/loyalty',
    label: 'Loyalty activity',
    description: 'See provisional points and how the demo calculation works.',
  },
];

export default function AccountScreen() {
  const customerId = useAppStore(getActiveCustomerId);
  const customers = useAppStore((state) => state.customers.records);
  const orders = useAppStore((state) => state.orders.records);
  const accounts = useAppStore((state) => state.loyalty.accounts);
  const customer = customers.find((item) => item.id === customerId);
  const customerOrders = orders
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  const latestOrder = customerOrders[0];
  const loyalty = accounts.find((account) => account.customerId === customerId);

  if (!customer) {
    return (
      <AccountPage>
        <EmptyState
          description="Reset the demo workspace to restore the fictional customer profile."
          title="Demo customer unavailable"
        />
      </AccountPage>
    );
  }

  return (
    <AccountPage>
      <IntroGrid>
        <IntroCopy>
          <Title>Good day, {customer.displayName}.</Title>
          <Lead>
            Review your next delivery, manage saved details, and keep an eye on provisional loyalty points.
          </Lead>
        </IntroCopy>
        <AccountIdentity>
          <IdentityTerm>Demo account</IdentityTerm>
          <IdentityValue>{customer.email}</IdentityValue>
          <IdentityTerm>Contact</IdentityTerm>
          <IdentityValue>{customer.phonePlaceholder}</IdentityValue>
        </AccountIdentity>
      </IntroGrid>

      <ContentGrid>
        <Section>
          <SectionHeader>
            <SectionTitle>Latest order</SectionTitle>
            <InlineLink href="/customer/orders">View all orders</InlineLink>
          </SectionHeader>
          {latestOrder ? (
            <OrderPanel>
              <OrderTopline>
                <OrderReference>{latestOrder.reference}</OrderReference>
                <StatusText tone={ORDER_STATUS_TONES[latestOrder.status]}>
                  {ORDER_STATUS_LABELS[latestOrder.status]}
                </StatusText>
              </OrderTopline>
              <OrderMeta>
                {latestOrder.items.length} {latestOrder.items.length === 1 ? 'product' : 'products'} · {formatPhp(latestOrder.totals.totalCentavos)}
              </OrderMeta>
              <InlineLink href={`/customer/orders/${latestOrder.id}`}>
                Open order details
              </InlineLink>
            </OrderPanel>
          ) : (
            <EmptyState
              action={<InlineLink href="/shop">Browse products</InlineLink>}
              description="Your placed demo orders will appear here."
              icon={<PackageSearch />}
              title="No orders yet"
            />
          )}

          <SectionTitle>Account tasks</SectionTitle>
          <ActionList>
            {ACCOUNT_ACTIONS.map((action) => (
              <ActionRow href={action.href} key={action.href}>
                <ActionText>
                  <ActionLabel>{action.label}</ActionLabel>
                  <ActionDescription>{action.description}</ActionDescription>
                </ActionText>
                <ArrowRight aria-hidden="true" />
              </ActionRow>
            ))}
          </ActionList>
        </Section>

        <Section>
          <SectionTitle>Loyalty snapshot</SectionTitle>
          <PointsValue>{loyalty?.pointsAvailable ?? 0} pts</PointsValue>
          <SupportingText>
            Approximate value: {formatPhp((loyalty?.pointsAvailable ?? 0) * 100)}. Redemption is disabled until the business confirms the final rule.
          </SupportingText>
          <InlineLink href="/customer/loyalty">Review loyalty details</InlineLink>
        </Section>
      </ContentGrid>
    </AccountPage>
  );
}

