import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/server';
import AdminRouteShell from '@/screens/admin/AdminRouteShell';

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireRole('admin');
  return <AdminRouteShell>{children}</AdminRouteShell>;
}
