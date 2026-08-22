import type { SnackbarProps } from '@mui/material/Snackbar';
import { CartSnackbar, SuccessAlert } from './elements';
import type { CartAddedToastProps } from './interface';

export default function CartAddedToast({
  message,
  onClose,
  open,
}: CartAddedToastProps) {
  const handleClose: NonNullable<SnackbarProps['onClose']> = (_event, reason) => {
    if (reason === 'clickaway') return;
    onClose();
  };

  return (
    <CartSnackbar
      anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      autoHideDuration={3200}
      onClose={handleClose}
      open={open}
    >
      <SuccessAlert
        onClose={onClose}
        role="status"
        severity="success"
        variant="filled"
      >
        {message}
      </SuccessAlert>
    </CartSnackbar>
  );
}
