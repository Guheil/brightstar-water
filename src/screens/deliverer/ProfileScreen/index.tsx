'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DelivererShell from '@/components/layout/DelivererShell';
import LogoutConfirmDialog from '@/components/ui/LogoutConfirmDialog';
import { signOutCurrentUser } from '@/lib/auth/client';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import { getActiveDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  Details,
  Label,
  Name,
  ProfileHero,
  ProfilePanel,
  Role,
  Root,
  SectionTitle,
  SignOutButton,
  Summary,
  SummaryItem,
  SummaryLabel,
  SummaryValue,
  Value,
} from './elements';

export default function ProfileScreen() {
  const currentDelivererId = useAppStore(getActiveDelivererId);
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const profile = useAppStore((state) =>
    state.deliveries.deliverers.find((item) => item.id === currentDelivererId),
  );
  const deliveries = useAppStore((state) => state.deliveries.records);
  const clearAuthSession = useAppStore((state) => state.commands.signOut);
  const ownDeliveries = deliveries.filter((delivery) => delivery.delivererId === currentDelivererId);
  const completed = ownDeliveries.filter((delivery) => delivery.status === 'delivered').length;
  const active = ownDeliveries.filter((delivery) => ['assigned', 'accepted', 'out_for_delivery'].includes(delivery.status)).length;
  const failed = ownDeliveries.filter((delivery) => delivery.status === 'failed').length;

  const handleSignOut = async () => {
    setLogoutOpen(false);
    await signOutCurrentUser();
    clearAuthSession();
    router.replace('/login');
    router.refresh();
  };

  return (
    <>
      <DelivererShell
      brandName="MRJE + Bright Star"
      navigation={delivererNavigation}
      activeHref="/deliverer/profile"
      headerTitle="Deliverer profile"
      userName={profile?.displayName}
    >
      <Root>
        <ProfileHero>
          <div>
            <Name>{profile?.displayName ?? 'Deliverer'}</Name>
            <Role>Field delivery account</Role>
          </div>
          <StatusText tone={profile?.status === 'available' ? 'success' : 'neutral'}>
            {profile?.status.replaceAll('_', ' ') ?? 'unavailable'}
          </StatusText>
        </ProfileHero>

        <Summary aria-label="Deliverer performance summary">
          <SummaryItem>
            <SummaryLabel>Active</SummaryLabel>
            <SummaryValue>{active}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Completed</SummaryLabel>
            <SummaryValue>{completed}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Needs review</SummaryLabel>
            <SummaryValue>{failed}</SummaryValue>
          </SummaryItem>
        </Summary>

        <ProfilePanel aria-labelledby="deliverer-profile-title">
          <SectionTitle id="deliverer-profile-title">Account and service details</SectionTitle>
          <Details>
            <Label>Email</Label>
            <Value>{profile?.email ?? 'Not available'}</Value>
            <Label>Phone</Label>
            <Value>{profile?.phonePlaceholder ?? 'Not available'}</Value>
            <Label>Service area</Label>
            <Value>Up to 10 km from the San Pedro station</Value>
          </Details>
          <SignOutButton onClick={() => setLogoutOpen(true)}>Log out</SignOutButton>
        </ProfilePanel>
      </Root>
    </DelivererShell>
      <LogoutConfirmDialog
        description="You’ll need to sign in again to view or update assigned deliveries."
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleSignOut}
        open={logoutOpen}
        title="Log out of Deliverer?"
      />
    </>
  );
}
