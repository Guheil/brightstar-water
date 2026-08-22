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
import type { AccountDetailScreenProps } from './interface';


export default function AccountDetailScreen({ account }: AccountDetailScreenProps) {
  if (!account) {
    return (
      <EmptyState
        action={<EmptyActionLink href="/admin/accounts">Return to accounts</EmptyActionLink>}
        description="The requested account could not be found."
        title="Account not found"
      />
    );
  }

  const setup =
    account.onboarding_stage === 'password_required'
      ? 'Password required'
      : account.onboarding_stage === 'profile_required'
        ? 'Details required'
        : 'Ready';

  return (
    <Root>
      <AdminPageHeader
        backHref={`/admin/accounts?role=${account.role}`}
        backLabel="Back to accounts"
        description={`Review this ${humanize(account.role)} account and its current access state.`}
        title={account.full_name}
      />

      <Section>
        <SectionTitle>Account details</SectionTitle>
        <DetailList>
          <DetailTerm>Email</DetailTerm>
          <DetailValue>{account.email}</DetailValue>
          <DetailTerm>Contact number</DetailTerm>
          <DetailValue>{account.phone || 'Not set'}</DetailValue>
          <DetailTerm>Role</DetailTerm>
          <DetailValue>{humanize(account.role)}</DetailValue>
          <DetailTerm>Account state</DetailTerm>
          <DetailValue>
            <StatusText tone={getStatusTone(account.status)}>{humanize(account.status)}</StatusText>
          </DetailValue>
          <DetailTerm>First-login setup</DetailTerm>
          <DetailValue>
            <StatusText tone={account.onboarding_stage === 'complete' ? 'success' : 'warning'}>
              {setup}
            </StatusText>
          </DetailValue>
        </DetailList>
      </Section>

      <Section>
        <SectionTitle>Account record</SectionTitle>
        <DetailList>
          <DetailTerm>Account origin</DetailTerm>
          <DetailValue>
            {account.account_origin === 'admin_managed' ? 'Created by an Administrator' : 'Self-registered'}
          </DetailValue>
          <DetailTerm>Created</DetailTerm>
          <DetailValue>{formatDateTime(account.created_at)}</DetailValue>
          <DetailTerm>Last updated</DetailTerm>
          <DetailValue>{formatDateTime(account.updated_at)}</DetailValue>
          <DetailTerm>Account ID</DetailTerm>
          <DetailValue>{account.id}</DetailValue>
        </DetailList>
      </Section>
    </Root>
  );
}
