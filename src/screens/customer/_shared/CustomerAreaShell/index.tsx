'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CustomerFooter, CustomerHeader } from '@/components';
import {
  customerMegaMenuGroups,
  customerPrimaryNavigation,
  SHARED_STOREFRONT_LOGO_SOURCES,
} from '@/config';
import { selectCartItemCount, useAppStore } from '@/store';
import AuthRequiredDialog from '@/screens/public/AuthRequiredDialog';
import { Main, ShellRoot } from './elements';
import type { CustomerAreaShellProps, CustomerCartContextValue } from './interface';

const FOOTER_GROUPS = [
  {
    title: 'Order',
    links: [
      { href: '/', label: 'Browse products' },
      { href: '/customer/cart', label: 'Cart' },
      { href: '/customer/orders', label: 'Track orders' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/customer/account', label: 'Account overview' },
      { href: '/customer/profile', label: 'Profile and addresses' },
      { href: '/customer/loyalty', label: 'Loyalty points' },
    ],
  },
] as const;

export function useCustomerCart(): CustomerCartContextValue {
  const items = useAppStore((state) => state.cart.items);
  const itemCount = useAppStore(selectCartItemCount);
  const lastPlacedOrderId = useAppStore((state) => state.cart.lastPlacedOrderId);
  const commands = useAppStore((state) => state.commands);

  return {
    items,
    itemCount,
    lastPlacedOrderId,
    addItem: (productId, quantity) => {
      commands.addCartItem(productId, quantity);
    },
    updateQuantity: (productId, quantity) => {
      if (quantity < 1) commands.removeCartItem(productId);
      else commands.updateCartItemQuantity(productId, quantity);
    },
    removeItem: commands.removeCartItem,
    clearCart: commands.clearCart,
    setLastPlacedOrderId: commands.setLastPlacedOrderId,
  };
}

export default function CustomerAreaShell({ children }: CustomerAreaShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAppStore((state) => state.auth.session);
  const isCustomer = session?.user.role === 'customer' && Boolean(session.user.customerId);
  const accountRoute = pathname === '/customer/account';
  const itemCount = useAppStore(selectCartItemCount);
  const signOut = useAppStore((state) => state.commands.signOut);
  const activeHref = customerPrimaryNavigation.find((item) =>
    pathname.startsWith(item.href),
  )?.href;

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  useEffect(() => {
    if (!isCustomer && accountRoute) {
      router.replace(`/login?next=${encodeURIComponent('/customer/account')}`);
    }
  }, [accountRoute, isCustomer, router]);

  return (
    <ShellRoot>
      <CustomerHeader
        accountHref={isCustomer ? '/customer/account' : `/login?next=${encodeURIComponent(pathname)}`}
        accountLabel={isCustomer ? 'Account' : 'Sign In'}
        activeHref={activeHref}
        brandName="MRJE Gas + Bright Star Water"
        cartCount={itemCount}
        cartHref="/customer/cart"
        megaMenuGroups={customerMegaMenuGroups}
        navigation={customerPrimaryNavigation}
        onLogout={isCustomer ? handleLogout : undefined}
        shopHref="/"
        logoSources={SHARED_STOREFRONT_LOGO_SOURCES}
      />
      <Main id="main-content">{isCustomer ? children : null}</Main>
      <AuthRequiredDialog
        nextPath={pathname}
        onClose={() => router.push('/')}
        open={!isCustomer && !accountRoute}
        purpose="protected"
      />
      <CustomerFooter
        brandName="MRJE Gas + Bright Star Water"
        contactLines={[
          'Brgy. San Lorenzo Ruiz, San Pedro, Laguna',
          'Open daily for local delivery orders',
        ]}
        groups={FOOTER_GROUPS}
        legalText="MRJE Gas + Bright Star Water. All rights reserved."
        summary="Household LPG and purified water prepared for clear, local delivery."
      />
    </ShellRoot>
  );
}

export type { CartLine, CustomerCartContextValue } from './interface';
