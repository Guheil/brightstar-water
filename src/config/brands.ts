import type {
  CustomerMegaMenuGroup,
  CustomerNavigationItem,
} from '@/components/layout/CustomerHeader/interface';
import type { ProductCategory } from '@/types';

export type BrandKey = 'mrje' | 'brightstar';

export interface BrandStorefrontConfig {
  alternateBrandHref: string;
  alternateBrandLabel: string;
  brandName: string;
  deliveryHref: string;
  footerSummary: string;
  homeHref: string;
  key: BrandKey;
  logoSrc: string;
  megaMenuGroups: readonly CustomerMegaMenuGroup[];
  navigation: readonly CustomerNavigationItem[];
  productCategory: ProductCategory;
  productHrefPrefix: string;
  searchHref: string;
  shopHref: string;
  shortName: string;
  tone: 'gas' | 'water';
}

const sharedServiceLinks = [
  {
    label: 'My orders',
    description: 'Track current deliveries and review past orders.',
    href: '/customer/orders',
  },
  {
    label: 'Loyalty points',
    description: 'Review your current points and recent activity.',
    href: '/customer/loyalty',
  },
  {
    label: 'Account',
    description: 'Manage your profile and saved delivery information.',
    href: '/customer/account',
  },
] as const;

export const STOREFRONT_BRANDS: Record<BrandKey, BrandStorefrontConfig> = {
  mrje: {
    key: 'mrje',
    brandName: 'MRJE Gas',
    shortName: 'MRJE',
    tone: 'gas',
    logoSrc: '/brand/mrje-gas-logo.png',
    productCategory: 'gas',
    homeHref: '/mrje',
    shopHref: '/mrje/shop',
    searchHref: '/mrje/shop',
    productHrefPrefix: '/mrje/product',
    deliveryHref: '/mrje/delivery',
    alternateBrandHref: '/brightstar',
    alternateBrandLabel: 'Bright Star Water',
    footerSummary:
      'Household LPG refills and compatible accessories prepared for scheduled local delivery.',
    navigation: [
      { label: 'Delivery', href: '/mrje/delivery' },
      { label: 'My orders', href: '/customer/orders' },
      { label: 'Bright Star Water', href: '/brightstar', tone: 'water' },
    ],
    megaMenuGroups: [
      {
        title: 'MRJE Gas',
        links: [
          {
            label: 'Shop LPG',
            description: 'Browse available LPG refills and gas accessories.',
            href: '/mrje/shop',
            tone: 'gas',
          },
          {
            label: 'Delivery coverage',
            description: 'Review service zones and delivery fees before checkout.',
            href: '/mrje/delivery',
          },
        ],
      },
      {
        title: 'Your account',
        links: sharedServiceLinks,
      },
      {
        title: 'Other storefront',
        links: [
          {
            label: 'Bright Star Water',
            description: 'Switch to purified water refills and water supplies.',
            href: '/brightstar',
            tone: 'water',
          },
        ],
      },
    ],
  },
  brightstar: {
    key: 'brightstar',
    brandName: 'Bright Star Water',
    shortName: 'Bright Star',
    tone: 'water',
    logoSrc: '/brand/brightstar-water-logo.png',
    productCategory: 'water',
    homeHref: '/brightstar',
    shopHref: '/brightstar/shop',
    searchHref: '/brightstar/shop',
    productHrefPrefix: '/brightstar/product',
    deliveryHref: '/brightstar/delivery',
    alternateBrandHref: '/mrje',
    alternateBrandLabel: 'MRJE Gas',
    footerSummary:
      'Purified water refills, containers, and household water supplies prepared for scheduled local delivery.',
    navigation: [
      { label: 'Delivery', href: '/brightstar/delivery' },
      { label: 'My orders', href: '/customer/orders' },
      { label: 'MRJE Gas', href: '/mrje', tone: 'gas' },
    ],
    megaMenuGroups: [
      {
        title: 'Bright Star Water',
        links: [
          {
            label: 'Shop water',
            description: 'Browse purified water refills, containers, and accessories.',
            href: '/brightstar/shop',
            tone: 'water',
          },
          {
            label: 'Delivery coverage',
            description: 'Review service zones and delivery fees before checkout.',
            href: '/brightstar/delivery',
          },
        ],
      },
      {
        title: 'Your account',
        links: sharedServiceLinks,
      },
      {
        title: 'Other storefront',
        links: [
          {
            label: 'MRJE Gas',
            description: 'Switch to LPG refills and compatible gas accessories.',
            href: '/mrje',
            tone: 'gas',
          },
        ],
      },
    ],
  },
};

export const SHARED_STOREFRONT_LOGO_SOURCES = [
  STOREFRONT_BRANDS.mrje.logoSrc,
  STOREFRONT_BRANDS.brightstar.logoSrc,
] as const;

export function getBrandFromPathname(pathname: string): BrandStorefrontConfig | null {
  if (pathname === '/mrje' || pathname.startsWith('/mrje/')) {
    return STOREFRONT_BRANDS.mrje;
  }

  if (pathname === '/brightstar' || pathname.startsWith('/brightstar/')) {
    return STOREFRONT_BRANDS.brightstar;
  }

  return null;
}

export function getProductStorefrontPath(
  category: ProductCategory,
  productId: string,
): string {
  const brand = category === 'gas' ? STOREFRONT_BRANDS.mrje : STOREFRONT_BRANDS.brightstar;
  return `${brand.productHrefPrefix}/${encodeURIComponent(productId)}`;
}
