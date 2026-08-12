'use client';

import PublicShell from '@/screens/public/PublicShell';

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PublicShell>{children}</PublicShell>;
}
