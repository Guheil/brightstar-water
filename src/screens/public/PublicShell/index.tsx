'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import CustomerFooter from '@/components/layout/CustomerFooter';
import CustomerHeader from '@/components/layout/CustomerHeader';
import {
  customerMegaMenuGroups,
  customerPrimaryNavigation,
} from '@/config';
import { selectCartItemCount, useAppStore } from '@/store';
import { Main } from './elements';
import type { PublicShellProps } from './interface';

const footerGroups = [
  {
    title: 'Order',
    links: [
      { label: 'All products', href: '/shop' },
      { label: 'LPG products', href: '/shop?category=gas' },
      { label: 'Water products', href: '/shop?category=water' },
    ],
  },
  {
    title: 'Service',
    links: [
      { label: 'Delivery coverage', href: '/about-delivery' },
      { label: 'Track an order', href: '/customer/orders' },
      { label: 'Loyalty points', href: '/customer/loyalty' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Create account', href: '/register' },
      { label: 'Profile', href: '/customer/profile' },
    ],
  },
];

export default function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();
  const homeHero = pathname === '/';
  const cartCount = useAppStore(selectCartItemCount);
  const activeHref =
    pathname === '/shop' || pathname.startsWith('/product/')
      ? '/shop'
      : customerPrimaryNavigation.find((item) => pathname === item.href)?.href;

  useEffect(() => {
    const lenis = new Lenis({
      anchors: true,
      autoRaf: true,
      smoothWheel: true,
      respectReducedMotion: true,
    });

    return () => lenis.destroy();
  }, []);

  return (
    <>
      <CustomerHeader
        accountHref="/customer/account"
        activeHref={activeHref}
        brandName="MRJE Gas + Bright Star Water"
        cartCount={cartCount}
        cartHref="/customer/cart"
        megaMenuGroups={customerMegaMenuGroups}
        navigation={customerPrimaryNavigation}
        searchHref="/shop"
        transparentAtTop={homeHero}
      />
      <Main id="main-content" $heroUnderHeader={homeHero}>
        {children}
      </Main>
      <CustomerFooter
        brandName="MRJE Gas + Bright Star Water"
        summary="LPG and purified water for scheduled delivery within our service area."
        contactLines={[
          'Brgy. San Lorenzo Ruiz, San Pedro, Laguna',
          'Prototype contact: 09XX-XXX-XXXX',
        ]}
        groups={footerGroups}
        legalText="Frontend prototype. All names, contact details, orders, and payment records are fictional."
      />
    </>
  );
}
