import type { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/server';

export default async function DelivererLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await requireRole('deliverer');
  return children;
}
