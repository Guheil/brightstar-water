import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { ROLE_DESTINATIONS } from '@/lib/auth/session';
import { profileRequiresOnboarding } from '@/lib/auth/types';

export default async function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  const profile = await getAuthenticatedProfile();

  if (profile?.status === 'active') {
    if (profileRequiresOnboarding(profile)) redirect('/onboarding');
    redirect(ROLE_DESTINATIONS[profile.role]);
  }

  return children;
}
