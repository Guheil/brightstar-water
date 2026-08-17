import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/server';
import CustomerAreaShell from '@/screens/customer/_shared/CustomerAreaShell';

export default async function CustomerLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireRole('customer');
  return <CustomerAreaShell>{children}</CustomerAreaShell>;
}
