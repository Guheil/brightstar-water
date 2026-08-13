'use client';

import DelivererShell from '@/components/layout/DelivererShell';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import { demoDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  Details,
  Label,
  Name,
  ProfilePanel,
  Root,
  Value,
} from './elements';

export default function ProfileScreen() {
  const profile = useAppStore((state) =>
    state.deliveries.deliverers.find((item) => item.id === demoDelivererId),
  );

  return (
    <DelivererShell
      brandName="MRJE + Bright Star"
      navigation={delivererNavigation}
      activeHref="/deliverer/profile"
      headerTitle="Deliverer profile"
      userName={profile?.displayName}
    >
      <Root>
        <ProfilePanel aria-labelledby="deliverer-profile-title">
          <Name id="deliverer-profile-title">
            {profile?.displayName ?? 'Deliverer'}
          </Name>
          <StatusText tone={profile?.status === 'available' ? 'success' : 'neutral'}>
            {profile?.status.replaceAll('_', ' ') ?? 'unavailable'}
          </StatusText>
          <Details>
            <Label>Email</Label>
            <Value>{profile?.email ?? 'Not available'}</Value>
            <Label>Phone</Label>
            <Value>{profile?.phonePlaceholder ?? 'Not available'}</Value>
            <Label>Service area</Label>
            <Value>Up to 10 km from the San Pedro station</Value>
          </Details>
        </ProfilePanel>
      </Root>
    </DelivererShell>
  );
}
