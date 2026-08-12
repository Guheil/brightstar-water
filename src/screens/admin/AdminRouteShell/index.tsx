'use client';

import { UserRound } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import { useAppStore } from '@/store';
import { AccountLink } from './elements';
import type { AdminRouteShellProps } from './interface';

const navigation = [
  { label: 'Overview', href: '/admin/overview', icon: 'overview' as const },
  { label: 'Orders', href: '/admin/orders', icon: 'orders' as const },
  { label: 'Deliveries', href: '/admin/deliveries', icon: 'deliveries' as const },
  { label: 'Inventory', href: '/admin/inventory', icon: 'inventory' as const },
  { label: 'Products', href: '/admin/products', icon: 'products' as const },
  { label: 'Customers', href: '/admin/customers', icon: 'customers' as const },
  { label: 'Loyalty', href: '/admin/loyalty', icon: 'loyalty' as const },
];

const sectionLabels: Readonly<Record<string, string>> = {
  overview: 'Operational overview',
  orders: 'Order operations',
  deliveries: 'Delivery coordination',
  inventory: 'Inventory control',
  products: 'Product catalog',
  customers: 'Customer records',
  loyalty: 'Loyalty records',
  account: 'Admin account',
};

export default function AdminRouteShell({ children }: AdminRouteShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAppStore((state) => state.auth.session);
  const signOut = useAppStore((state) => state.commands.signOut);
  const section = pathname.split('/')[2] || 'overview';
  const activeHref = navigation.find((item) => pathname.startsWith(item.href))?.href;

  const handleSignOut = () => {
    signOut();
    router.push('/login');
  };

  return (
    <AdminShell
      activeHref={activeHref}
      brandName="MRJE + Bright Star"
      brandSubtitle="Frontend operations prototype"
      headerActions={
        <AccountLink
          aria-current={pathname === '/admin/account' ? 'page' : undefined}
          href="/admin/account"
        >
          <UserRound aria-hidden="true" />
          Account
        </AccountLink>
      }
      headerLabel={sectionLabels[section] ?? 'Admin workspace'}
      navigation={navigation}
      onSignOut={handleSignOut}
      userName={session?.user.displayName ?? 'Admin Demo'}
      userRole="Administrator · Prototype"
    >
      {children}
    </AdminShell>
  );
}
