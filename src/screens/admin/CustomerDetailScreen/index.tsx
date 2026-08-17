'use client';

import EmptyState from '@/components/ui/EmptyState';
import StatusText from '@/components/ui/StatusText';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDateTime, getStatusTone, humanize } from '../utils';
import {
  DetailList,
  DetailTerm,
  DetailValue,
  EmptyActionLink,
  Root,
  Section,
  SectionTitle,
} from './elements';
import type { CustomerDetailScreenProps } from './interface';

export default function CustomerDetailScreen({ customer }: CustomerDetailScreenProps) {
  if (!customer) {
    return (
      <EmptyState
        action={<EmptyActionLink href="/admin/customers">Return to customers</EmptyActionLink>}
        description="The requested customer could not be found."
        title="Customer not found"
      />
    );
  }

  return (
    <Root>
      <AdminPageHeader
        backHref="/admin/customers"
        backLabel="Back to customers"
        description="Review the customer's account and contact information."
        title={customer.full_name}
      />

      <Section>
        <SectionTitle>Account details</SectionTitle>
        <DetailList>
          <DetailTerm>Email</DetailTerm>
          <DetailValue>{customer.email}</DetailValue>
          <DetailTerm>Contact number</DetailTerm>
          <DetailValue>{customer.phone}</DetailValue>
          <DetailTerm>Role</DetailTerm>
          <DetailValue>{humanize(customer.role)}</DetailValue>
          <DetailTerm>Account state</DetailTerm>
          <DetailValue>
            <StatusText tone={getStatusTone(customer.status)}>{humanize(customer.status)}</StatusText>
          </DetailValue>
        </DetailList>
      </Section>

      <Section>
        <SectionTitle>Account record</SectionTitle>
        <DetailList>
          <DetailTerm>Created</DetailTerm>
          <DetailValue>{formatDateTime(customer.created_at)}</DetailValue>
          <DetailTerm>Last updated</DetailTerm>
          <DetailValue>{formatDateTime(customer.updated_at)}</DetailValue>
          <DetailTerm>Customer ID</DetailTerm>
          <DetailValue>{customer.id}</DetailValue>
        </DetailList>
      </Section>
    </Root>
  );
}
