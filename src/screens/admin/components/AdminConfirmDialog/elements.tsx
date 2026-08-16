import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';

export const ConfirmDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.radii.control,
    boxShadow: theme.shadows[8],
  },
}));

export const ConfirmDialogTitle = styled(DialogTitle)(({ theme }) => ({
  ...theme.typography.h5,
  paddingTop: theme.spacing(3),
  color: theme.vars.palette.primary.main,
}));

export const ConfirmDialogContent = styled(DialogContent)(() => ({}));

export const ConfirmDialogText = styled(DialogContentText)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.secondary,
}));

export const ConfirmDialogActions = styled(DialogActions)(({ theme }) => ({
  gap: theme.spacing(1),
  padding: theme.spacing(2, 3, 3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const CancelButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,
}));

export const ConfirmButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<{ $tone: 'danger' | 'primary' }>(({ theme, $tone }) => ({
  minHeight: theme.spacing(5.5),
  backgroundColor: $tone === 'danger' ? theme.vars.palette.error.main : theme.vars.palette.primary.main,
  color: $tone === 'danger' ? theme.vars.palette.error.contrastText : theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: $tone === 'danger' ? theme.vars.palette.error.dark : theme.vars.palette.primary.dark,
  },
}));
