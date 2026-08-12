import type { ReactNode } from 'react';

export interface EmptyStateProps {
  action?: ReactNode;
  className?: string;
  description: string;
  icon?: ReactNode;
  title: string;
}
