import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { ROLE_DESTINATIONS } from '@/lib/auth/session';
import { profileRequiresOnboarding } from '@/lib/auth/types';
import OnboardingScreen from '@/screens/auth/OnboardingScreen';

export const metadata: Metadata = {
  title: 'Finish account setup',
  description: 'Secure your account and complete the information required before continuing.',
};

export default async function OnboardingPage() {
  const profile = await getAuthenticatedProfile();

  if (!profile || profile.status !== 'active') redirect('/login');
  if (!profileRequiresOnboarding(profile)) redirect(ROLE_DESTINATIONS[profile.role]);

  return <OnboardingScreen profile={profile} />;
}
