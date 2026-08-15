import {
  CancelButton,
  FormDialog,
  FormDialogActions,
  FormDialogContent,
  FormDialogDescription,
  FormDialogTitle,
  SubmitButton,
} from './elements';
import type { AdminFormDialogProps } from './interface';

export default function AdminFormDialog({
  children,
  description,
  formId,
  onClose,
  open,
  submitDisabled = false,
  submitLabel,
  title,
}: AdminFormDialogProps) {
  return (
    <FormDialog
      aria-describedby={`${formId}-description`}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
    >
      <FormDialogTitle>{title}</FormDialogTitle>
      <FormDialogContent>
        <FormDialogDescription id={`${formId}-description`}>
          {description}
        </FormDialogDescription>
        {children}
      </FormDialogContent>
      <FormDialogActions>
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <SubmitButton disabled={submitDisabled} form={formId} type="submit">
          {submitLabel}
        </SubmitButton>
      </FormDialogActions>
    </FormDialog>
  );
}
