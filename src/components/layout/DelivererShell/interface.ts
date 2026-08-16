import type { ReactNode } from 'react';

export type DelivererNavigationIcon = 'home' | 'active' | 'history' | 'profile';

export interface DelivererNavigationItem {
  href: string;
  icon: DelivererNavigationIcon;
  label: string;
}

export interface DelivererShellProps {
  activeHref?: string;
  brandName: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
  headerMeta?: string;
  headerTitle: string;
  homeHref?: string;
  mainId?: string;
  navigation: readonly DelivererNavigationItem[];
  userName?: string;
}
