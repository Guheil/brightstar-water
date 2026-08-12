'use client';

import DelivererShell from '@/components/layout/DelivererShell';
import Notice from '@/components/ui/Notice';
import StatusText from '@/components/ui/StatusText';
import { useAppStore } from '@/store';
import { demoDelivererId, delivererNavigation } from '../_shared/delivererNavigation';
import {
  BoundaryList,
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
        <Notice tone="info" title="Demo identity only">
          This profile uses reserved example.test contact details and cannot be
          used to contact a real person.
        </Notice>
        <ProfilePanel aria-labelledby="deliverer-profile-title">
          <Name id="deliverer-profile-title">
            {profile?.displayName ?? 'Demo deliverer'}
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
        <ProfilePanel aria-labelledby="deliverer-boundaries-title">
          <Name id="deliverer-boundaries-title">Prototype boundaries</Name>
          <BoundaryList>
            <li>No driver-side GPS, route optimization, or background tracking.</li>
            <li>Only assigned order statuses are updated in memory.</li>
            <li>Refund and stock decisions remain with the Admin workflow.</li>
          </BoundaryList>
        </ProfilePanel>
      </Root>
    </DelivererShell>
  );
}
