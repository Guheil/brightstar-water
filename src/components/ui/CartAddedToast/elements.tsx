import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { styled } from '@mui/material/styles';

export const CartSnackbar = styled(Snackbar)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: theme.radii.control,
    boxShadow: theme.shadows[6],
  },
}));

export const SuccessAlert = styled(Alert)(({ theme }) => ({
  width: '100%',
  alignItems: 'center',
  ...theme.typography.body2,
}));
