'use client';

import { useAppStore } from '@/store';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDateTime, humanize } from '../utils';
import {
  DetailList,
  DetailSection,
  DetailTerm,
  DetailValue,
  Root,
  SectionTitle,
} from './elements';
import type { AccountScreenProps } from './interface';

export default function AccountScreen({ className }: AccountScreenProps) {
  const session = useAppStore((state) => state.auth.session);

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Review the administrator account and current session details."
        title="Admin account"
      />

      <DetailSection>
        <SectionTitle>Current session</SectionTitle>
        <DetailList>
          <DetailTerm>Display name</DetailTerm>
          <DetailValue>{session?.user.displayName ?? 'Administrator'}</DetailValue>
          <DetailTerm>Email</DetailTerm>
          <DetailValue>{session?.user.email ?? 'Not available'}</DetailValue>
          <DetailTerm>Role</DetailTerm>
          <DetailValue>{humanize(session?.user.role ?? 'admin')}</DetailValue>
          <DetailTerm>Signed in</DetailTerm>
          <DetailValue>
            {session?.signedInAt ? formatDateTime(session.signedInAt) : 'Not recorded'}
          </DetailValue>
        </DetailList>
      </DetailSection>
    </Root>
  );
}
