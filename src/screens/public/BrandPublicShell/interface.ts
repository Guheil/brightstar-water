import type { ReactNode } from 'react';
import type { BrandStorefrontConfig } from '@/config/brands';

export interface BrandPublicShellProps {
  brand: BrandStorefrontConfig;
  children: ReactNode;
  pathname: string;
}
