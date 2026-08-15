export interface AdminConfirmDialogProps {
  confirmLabel: string;
  confirmTone?: 'danger' | 'primary';
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}
