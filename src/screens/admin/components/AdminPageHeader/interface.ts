import type { ReactNode } from 'react';

export interface AdminPageHeaderProps {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  description: string;
  title: string;
}
