'use client';

import CustomerFooter from '@/components/layout/CustomerFooter';
import CustomerHeader from '@/components/layout/CustomerHeader';
import { selectCartItemCount, useAppStore } from '@/store';
import { Main } from './elements';
import type { BrandPublicShellProps } from './interface';

export default function BrandPublicShell({
  brand,
  children,
  pathname,
}: BrandPublicShellProps) {
  const cartCount = useAppStore(selectCartItemCount);
  const session = useAppStore((state) => state.auth.session);
  const signOut = useAppStore((state) => state.commands.signOut);
  const canLogout = session?.user.role === 'customer';
  const homeHero = pathname === brand.homeHref;
  const activeHref =
    pathname === brand.shopHref || pathname.startsWith(`${brand.productHrefPrefix}/`)
      ? brand.shopHref
      : brand.navigation.find((item) => pathname === item.href)?.href;

  const footerGroups = [
    {
      title: brand.brandName,
      links: [
        { label: 'Storefront home', href: brand.homeHref },
        { label: 'Shop products', href: brand.shopHref },
        { label: 'Delivery coverage', href: brand.deliveryHref },
      ],
    },
    {
      title: 'Your account',
      links: [
        { label: 'Cart', href: '/customer/cart' },
        { label: 'Order history', href: '/customer/orders' },
        { label: 'Loyalty points', href: '/customer/loyalty' },
      ],
    },
    {
      title: 'Switch storefront',
      links: [
        { label: brand.alternateBrandLabel, href: brand.alternateBrandHref },
        { label: 'Choose a service', href: '/' },
      ],
    },
  ] as const;

  return (
    <>
      <CustomerHeader
        accountHref={canLogout ? '/customer/account' : `/login?next=${encodeURIComponent(pathname)}`}
        accountLabel={canLogout ? 'Account' : 'Sign In'}
        activeHref={activeHref}
        brandName={brand.brandName}
        cartCount={cartCount}
        cartHref="/customer/cart"
        homeHref={brand.homeHref}
        megaMenuGroups={brand.megaMenuGroups}
        navigation={brand.navigation}
        onLogout={canLogout ? signOut : undefined}
        logoSrc={brand.logoSrc}
        searchHref={brand.searchHref}
        showOrderNavigation={canLogout}
        shopHref={brand.shopHref}
        transparentAtTop={homeHero && brand.tone === 'gas'}
      />
      <Main id="main-content" $heroUnderHeader={homeHero}>
        {children}
      </Main>
      <CustomerFooter
        brandName={brand.brandName}
        summary={brand.footerSummary}
        contactLines={[
          'Brgy. San Lorenzo Ruiz, San Pedro, Laguna',
          'Scheduled local delivery within the service area',
        ]}
        groups={footerGroups}
        legalText={`${brand.brandName}. Part of the MRJE and Bright Star delivery platform.`}
      />
    </>
  );
}
