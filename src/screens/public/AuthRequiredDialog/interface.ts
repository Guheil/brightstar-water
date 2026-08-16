export type AuthRequiredDialogPurpose = 'order' | 'protected';

export interface AuthRequiredDialogProps {
  open: boolean;
  nextPath: string;
  onClose: () => void;
  purpose?: AuthRequiredDialogPurpose;
}
