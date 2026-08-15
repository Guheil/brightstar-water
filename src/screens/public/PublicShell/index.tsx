'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import CustomerFooter from '@/components/layout/CustomerFooter';
import CustomerHeader from '@/components/layout/CustomerHeader';
import {
  customerMegaMenuGroups,
  customerPrimaryNavigation,
  getBrandFromPathname,
  SHARED_STOREFRONT_LOGO_SOURCES,
} from '@/config';
import { selectCartItemCount, useAppStore } from '@/store';
import BrandPublicShell from '@/screens/public/BrandPublicShell';
import { Main } from './elements';
import type { PublicShellProps } from './interface';

const footerGroups = [
  {
    title: 'Storefronts',
    links: [
      { label: 'MRJE Gas', href: '/mrje' },
      { label: 'Bright Star Water', href: '/brightstar' },
      { label: 'Choose a service', href: '/' },
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

const gatewayNavigation = [
  { label: 'MRJE Gas', href: '/mrje', tone: 'gas' as const },
  { label: 'Bright Star Water', href: '/brightstar', tone: 'water' as const },
  { label: 'My orders', href: '/customer/orders' },
];

const gatewayMenuGroups = [
  {
    title: 'Choose a storefront',
    links: [
      {
        label: 'MRJE Gas',
        description: 'LPG refills and compatible gas accessories.',
        href: '/mrje',
        tone: 'gas' as const,
      },
      {
        label: 'Bright Star Water',
        description: 'Purified water refills, containers, and water supplies.',
        href: '/brightstar',
        tone: 'water' as const,
      },
    ],
  },
  {
    title: 'Your account',
    links: [
      {
        label: 'Cart',
        description: 'One cart shared across both storefronts.',
        href: '/customer/cart',
      },
      {
        label: 'Order history',
        description: 'Review orders from either storefront.',
        href: '/customer/orders',
      },
    ],
  },
  {
    title: 'Platform',
    links: [
      {
        label: 'Delivery coverage',
        description: 'Review the shared local service area and fee zones.',
        href: '/about-delivery',
      },
      {
        label: 'Loyalty points',
        description: 'Review points earned from eligible orders.',
        href: '/customer/loyalty',
      },
    ],
  },
] as const;

export default function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();
  const brand = getBrandFromPathname(pathname);
  const gateway = pathname === '/';
  const cartCount = useAppStore(selectCartItemCount);

  useEffect(() => {
    const lenis = new Lenis({
      anchors: true,
      autoRaf: true,
      smoothWheel: true,
      respectReducedMotion: true,
    });

    return () => lenis.destroy();
  }, []);

  if (brand) {
    return (
      <BrandPublicShell brand={brand} pathname={pathname}>
        {children}
      </BrandPublicShell>
    );
  }

  const activeHref =
    pathname === '/shop' || pathname.startsWith('/product/')
      ? '/shop'
      : customerPrimaryNavigation.find((item) => pathname === item.href)?.href;

  return (
    <>
      <CustomerHeader
        accountHref="/customer/account"
        activeHref={activeHref}
        brandName="MRJE Gas and Bright Star Water"
        cartCount={cartCount}
        cartHref="/customer/cart"
        megaMenuGroups={gateway ? gatewayMenuGroups : customerMegaMenuGroups}
        navigation={gateway ? gatewayNavigation : customerPrimaryNavigation}
        searchHref={gateway ? undefined : '/shop'}
        shopHref={gateway ? '/' : '/shop'}
        transparentAtTop={gateway}
        logoSources={SHARED_STOREFRONT_LOGO_SOURCES}
      />
      <Main id="main-content" $heroUnderHeader={gateway}>
        {children}
      </Main>
      <CustomerFooter
        brandName="MRJE Gas + Bright Star Water"
        summary="Two dedicated storefronts connected by one account, cart, ordering, and local delivery platform."
        contactLines={[
          'Brgy. San Lorenzo Ruiz, San Pedro, Laguna',
          'Open daily for local delivery orders',
        ]}
        groups={footerGroups}
        legalText="MRJE Gas + Bright Star Water. All rights reserved."
      />
    </>
  );
}
