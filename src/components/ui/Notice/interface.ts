import type { ReactNode } from 'react';

export type NoticeTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export interface NoticeProps {
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
  tone?: NoticeTone;
}
