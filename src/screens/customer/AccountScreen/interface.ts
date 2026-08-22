import type { ReactNode } from 'react';

export interface AccountAction {
  href: string;
  label: string;
  description: string;
  icon?: ReactNode;
  warning?: boolean;
}
