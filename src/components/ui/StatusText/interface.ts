import type { ReactNode } from 'react';

export type StatusTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'gas'
  | 'water';

export interface StatusTextProps {
  children: ReactNode;
  className?: string;
  tone?: StatusTone;
}
