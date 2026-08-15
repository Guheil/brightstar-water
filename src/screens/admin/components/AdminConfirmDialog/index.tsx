import {
  CancelButton,
  ConfirmButton,
  ConfirmDialog,
  ConfirmDialogActions,
  ConfirmDialogContent,
  ConfirmDialogText,
  ConfirmDialogTitle,
} from './elements';
import type { AdminConfirmDialogProps } from './interface';

export default function AdminConfirmDialog({
  confirmLabel,
  confirmTone = 'danger',
  description,
  onClose,
  onConfirm,
  open,
  title,
}: AdminConfirmDialogProps) {
  return (
    <ConfirmDialog aria-describedby="admin-confirm-description" onClose={onClose} open={open}>
      <ConfirmDialogTitle>{title}</ConfirmDialogTitle>
      <ConfirmDialogContent>
        <ConfirmDialogText id="admin-confirm-description">
          {description}
        </ConfirmDialogText>
      </ConfirmDialogContent>
      <ConfirmDialogActions>
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <ConfirmButton $tone={confirmTone} onClick={onConfirm}>
          {confirmLabel}
        </ConfirmButton>
      </ConfirmDialogActions>
    </ConfirmDialog>
  );
}
