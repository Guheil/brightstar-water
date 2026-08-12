'use client';

import { useState } from 'react';
import Notice from '@/components/ui/Notice';
import { useAppStore } from '@/store';
import AdminConfirmDialog from '../components/AdminConfirmDialog';
import AdminPageHeader from '../components/AdminPageHeader';
import { formatDateTime, humanize } from '../utils';
import {
  DetailList,
  DetailSection,
  DetailTerm,
  DetailValue,
  ResetButton,
  Root,
  SectionTitle,
} from './elements';
import type { AccountScreenProps } from './interface';

export default function AccountScreen({ className }: AccountScreenProps) {
  const session = useAppStore((state) => state.auth.session);
  const prototypeNotice = useAppStore((state) => state.auth.prototypeNotice);
  const resetDemoState = useAppStore((state) => state.commands.resetDemoState);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const confirmReset = () => {
    resetDemoState();
    setConfirmOpen(false);
    setResetComplete(true);
  };

  return (
    <Root className={className}>
      <AdminPageHeader
        description="Review the simulated Admin session and reset all fictional browser state when preparing a new demonstration."
        title="Admin account"
      />

      <Notice title="Simulated authentication" tone="warning">
        {prototypeNotice}
      </Notice>
      {resetComplete ? (
        <Notice title="Demo state restored" tone="success">
          All orders, inventory, deliveries, customers, payments, products, and loyalty records returned to the original fictional fixtures.
        </Notice>
      ) : null}

      <DetailSection>
        <SectionTitle>Current session</SectionTitle>
        <DetailList>
          <DetailTerm>Display name</DetailTerm>
          <DetailValue>{session?.user.displayName ?? 'Admin Demo'}</DetailValue>
          <DetailTerm>Email</DetailTerm>
          <DetailValue>{session?.user.email ?? 'admin.demo@example.test'}</DetailValue>
          <DetailTerm>Role</DetailTerm>
          <DetailValue>{humanize(session?.user.role ?? 'admin')}</DetailValue>
          <DetailTerm>Session type</DetailTerm>
          <DetailValue>Frontend prototype only</DetailValue>
          <DetailTerm>Signed in</DetailTerm>
          <DetailValue>
            {session?.signedInAt ? formatDateTime(session.signedInAt) : 'Demo session not recorded'}
          </DetailValue>
        </DetailList>
      </DetailSection>

      <DetailSection>
        <SectionTitle>Reset demonstration</SectionTitle>
        <DetailValue>
          Resetting discards all session changes, including orders, assignments, stock adjustments, loyalty changes, payment states, and product edits.
        </DetailValue>
        <ResetButton onClick={() => setConfirmOpen(true)}>Reset all demo state</ResetButton>
      </DetailSection>

      <AdminConfirmDialog
        confirmLabel="Reset demo state"
        description="This discards every frontend-only change made during the current demonstration and restores the original fictional fixtures."
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmReset}
        open={confirmOpen}
        title="Reset all fictional data?"
      />
    </Root>
  );
}
