import { LogOut } from 'lucide-react';
import {
  CancelButton,
  ConfirmButton,
  LogoutDialog,
  LogoutDialogActions,
  LogoutDialogContent,
  LogoutDialogText,
  LogoutDialogTitle,
  TitleText,
  WarningMark,
} from './elements';
import type { LogoutConfirmDialogProps } from './interface';

export default function LogoutConfirmDialog({
  confirmLabel = 'Log out',
  description,
  onClose,
  onConfirm,
  open,
  title,
}: LogoutConfirmDialogProps) {
  return (
    <LogoutDialog
      aria-describedby="logout-confirm-description"
      aria-labelledby="logout-confirm-title"
      onClose={onClose}
      open={open}
    >
      <LogoutDialogTitle id="logout-confirm-title">
        <WarningMark aria-hidden="true">
          <LogOut />
        </WarningMark>
        <TitleText>{title}</TitleText>
      </LogoutDialogTitle>
      <LogoutDialogContent>
        <LogoutDialogText id="logout-confirm-description">
          {description}
        </LogoutDialogText>
      </LogoutDialogContent>
      <LogoutDialogActions>
        <CancelButton autoFocus onClick={onClose}>Cancel</CancelButton>
        <ConfirmButton onClick={onConfirm}>{confirmLabel}</ConfirmButton>
      </LogoutDialogActions>
    </LogoutDialog>
  );
}
