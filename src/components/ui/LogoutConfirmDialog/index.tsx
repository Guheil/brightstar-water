'use client';

import { LogOut } from 'lucide-react';
import DialogMotionTransition from '@/components/ui/DialogMotionTransition';
import { dialogMotion } from '@/theme/transitions';
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
      slots={{ transition: DialogMotionTransition }}
      transitionDuration={{ enter: dialogMotion.enterDuration, exit: dialogMotion.exitDuration }}
    >
      <LogoutDialogTitle id="logout-confirm-title">
        <WarningMark aria-hidden="true" data-modal-icon>
          <LogOut />
        </WarningMark>
        <TitleText data-modal-title-text>{title}</TitleText>
      </LogoutDialogTitle>
      <LogoutDialogContent data-modal-body>
        <LogoutDialogText id="logout-confirm-description">
          {description}
        </LogoutDialogText>
      </LogoutDialogContent>
      <LogoutDialogActions data-modal-actions>
        <CancelButton autoFocus onClick={onClose}>Cancel</CancelButton>
        <ConfirmButton onClick={onConfirm}>{confirmLabel}</ConfirmButton>
      </LogoutDialogActions>
    </LogoutDialog>
  );
}
