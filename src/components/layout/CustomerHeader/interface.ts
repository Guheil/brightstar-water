export interface CustomerNavigationItem {
  description?: string;
  href: string;
  label: string;
  tone?: 'neutral' | 'gas' | 'water';
}

export interface CustomerMegaMenuGroup {
  links: readonly CustomerNavigationItem[];
  title: string;
}

export type CustomerMegaMenuPhase = 'closed' | 'opening' | 'open' | 'closing';

export interface CustomerHeaderProps {
  accountHref: string;
  accountLabel?: string;
  activeHref?: string;
  brandName: string;
  cartCount?: number;
  cartHref: string;
  className?: string;
  condensed?: boolean;
  homeHref?: string;
  logoSrc?: string;
  logoSources?: readonly string[];
  mainId?: string;
  megaMenuGroups: readonly CustomerMegaMenuGroup[];
  navigation: readonly CustomerNavigationItem[];
  onLogout?: () => void;
  searchHref?: string;
  showOrderNavigation?: boolean;
  shopHref?: string;
  transparentAtTop?: boolean;
  wordmark?: string;
}
