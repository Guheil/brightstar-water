import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getAuthenticatedProfile } from '@/lib/auth/server';
import { ROLE_DESTINATIONS } from '@/lib/auth/session';

export default async function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  const profile = await getAuthenticatedProfile();

  if (profile?.status === 'active') {
    redirect(ROLE_DESTINATIONS[profile.role]);
  }

  return children;
}
