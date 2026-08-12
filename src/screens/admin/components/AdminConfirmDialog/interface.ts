export interface AdminConfirmDialogProps {
  confirmLabel: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}
