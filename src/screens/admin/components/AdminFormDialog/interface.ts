import type { ReactNode } from 'react';

export interface AdminFormDialogProps {
  children: ReactNode;
  description: string;
  formId: string;
  onClose: () => void;
  open: boolean;
  submitDisabled?: boolean;
  submitLabel: string;
  submitTone?: 'primary' | 'danger';
  title: string;
}
