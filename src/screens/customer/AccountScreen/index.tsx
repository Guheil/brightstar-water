'use client';

import { ArrowRight, CircleAlert, MapPin, PackageSearch, UserRound, History, Gift } from 'lucide-react';
import { EmptyState, StatusText } from '@/components';
import { useAppStore } from '@/store';
import { formatPhp } from '@/utils';
import { getActiveCustomerId } from '../_shared/customer';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../_shared/orderPresentation';
import {
  AccountIdentity,
  AccountPage,
  ActionDescription,
  ActionIcon,
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
  const addressesInitialized = useAppStore((state) => state.customers.addressesInitialized);
  const addressesError = useAppStore((state) => state.customers.addressesError);
  const usableAddress = customer?.addresses.find((address) => Number.isFinite(address.distanceKm));
  const defaultAddress = customer?.addresses.find((address) => address.isDefault) ?? usableAddress;
  const needsAddress = addressesInitialized && !addressesError && !usableAddress;
  const accountActions: readonly AccountAction[] = [
    {
      href: '/customer/addresses',
      label: addressesError ? 'Delivery addresses unavailable' : needsAddress ? 'Delivery address needed' : 'Delivery addresses',
      description: addressesError
        ? 'Open saved addresses to retry loading your delivery locations.'
        : needsAddress
          ? 'Add a Home, Work, or other address before checkout.'
          : addressesInitialized
            ? `${defaultAddress?.label ?? 'Saved address'} is ready for checkout.`
            : 'Loading your saved delivery addresses.',
      icon: addressesError || needsAddress ? <CircleAlert /> : <MapPin />,
      warning: Boolean(addressesError) || needsAddress,
    },
    { href: '/customer/profile', label: 'Profile details', description: 'Review your name, email, and contact number.', icon: <UserRound /> },
    { href: '/customer/orders', label: 'Order history', description: 'Follow active deliveries and review previous orders.', icon: <History /> },
    { href: '/customer/loyalty', label: 'Loyalty activity', description: 'See available and pending points, plus earning details.', icon: <Gift /> },
  ];

  if (!customer) {
    return (
      <AccountPage>
        <EmptyState
          description="Refresh the page or sign in again to reload your account."
          title="Customer account unavailable"
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
            Review your next delivery, manage saved details, and keep an eye on loyalty points.
          </Lead>
        </IntroCopy>
        <AccountIdentity>
          <IdentityTerm>Account email</IdentityTerm>
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
              action={<InlineLink href="/">Choose a storefront</InlineLink>}
              description="Your placed orders will appear here."
              icon={<PackageSearch />}
              title="No orders yet"
            />
          )}

          <SectionTitle>Account tasks</SectionTitle>
          <ActionList>
            {accountActions.map((action) => (
              <ActionRow href={action.href} key={action.href}>
                <ActionIcon $warning={action.warning} aria-hidden="true">{action.icon}</ActionIcon>
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
            Approximate value: {formatPhp((loyalty?.pointsAvailable ?? 0) * 100)}. Redemption is not currently available.
          </SupportingText>
          <InlineLink href="/customer/loyalty">Review loyalty details</InlineLink>
        </Section>
      </ContentGrid>
    </AccountPage>
  );
}
