import type { ReactNode } from 'react';

export type AdminNavigationIcon =
  | 'overview'
  | 'orders'
  | 'deliveries'
  | 'inventory'
  | 'products'
  | 'customers'
  | 'accounts'
  | 'history'
  | 'loyalty';

export interface AdminNavigationItem {
  href: string;
  icon: AdminNavigationIcon;
  label: string;
}

export interface AdminShellProps {
  activeHref?: string;
  brandName: string;
  brandSubtitle?: string;
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  headerDescription?: string;
  headerLabel?: string;
  homeHref?: string;
  mainId?: string;
  navigation: readonly AdminNavigationItem[];
  onSignOut?: () => void;
  signOutLabel?: string;
  userName: string;
  userRole?: string;
}
