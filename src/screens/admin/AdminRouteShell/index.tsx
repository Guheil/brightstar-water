'use client';

import { UserRound } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import { signOutCurrentUser } from '@/lib/auth/client';
import { useAppStore } from '@/store';
import { AccountLink } from './elements';
import type { AdminRouteShellProps } from './interface';

const navigation = [
  { label: 'Overview', href: '/admin/overview', icon: 'overview' as const },
  { label: 'Orders', href: '/admin/orders', icon: 'orders' as const },
  { label: 'Deliveries', href: '/admin/deliveries', icon: 'deliveries' as const },
  { label: 'Inventory', href: '/admin/inventory', icon: 'inventory' as const },
  { label: 'Products', href: '/admin/products', icon: 'products' as const },
  { label: 'Accounts', href: '/admin/accounts', icon: 'accounts' as const },
  { label: 'Activity History', href: '/admin/activity-history', icon: 'history' as const },
  { label: 'Loyalty', href: '/admin/loyalty', icon: 'loyalty' as const },
];

const sectionDescriptions: Readonly<Record<string, string>> = {
  overview: 'Route the work that needs attention across both storefronts.',
  orders: 'Review incoming orders and move them through fulfillment.',
  deliveries: 'Assign drivers, monitor progress, and resolve delivery issues.',
  inventory: 'Monitor available, reserved, and low-stock quantities.',
  products: 'Control the MRJE Gas and Bright Star Water product catalog.',
  accounts: 'Manage Customer, Deliverer, and Administrator accounts from one directory.',
  'activity-history': 'Review important system actions and trace what changed, who did it, and whether it succeeded.',
  loyalty: 'Track balances, activity, and administrative adjustments.',
  account: 'Review the current administrator session and account details.',
};

export default function AdminRouteShell({ children }: AdminRouteShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAppStore((state) => state.auth.session);
  const clearAuthSession = useAppStore((state) => state.commands.signOut);
  const section = pathname.split('/')[2] || 'overview';
  const activeHref = navigation.find((item) => pathname.startsWith(item.href))?.href;

  const handleSignOut = async () => {
    await signOutCurrentUser();
    clearAuthSession();
    router.replace('/login');
    router.refresh();
  };

  return (
    <AdminShell
      activeHref={activeHref}
      brandName="MRJE + Bright Star"
      brandSubtitle="Operations workspace"
      headerActions={
        <AccountLink
          aria-current={pathname === '/admin/account' ? 'page' : undefined}
          href="/admin/account"
        >
          <UserRound aria-hidden="true" />
          Account
        </AccountLink>
      }
      headerDescription={sectionDescriptions[section] ?? 'Manage day-to-day store operations.'}
      headerLabel="Operations workspace"
      navigation={navigation}
      onSignOut={handleSignOut}
      userName={session?.user.displayName ?? 'Administrator'}
      userRole="Administrator"
    >
      {children}
    </AdminShell>
  );
}
