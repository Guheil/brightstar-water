import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const LogoutDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: theme.spacing(58),
    margin: theme.spacing(2),
    borderRadius: theme.radii.control,
    boxShadow: theme.shadows[8],
  },
}));

export const LogoutDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(3, 3, 1.5),
  color: theme.vars.palette.primary.main,
}));

export const WarningMark = styled(Box)(({ theme }) => ({
  width: theme.spacing(5),
  height: theme.spacing(5),
  display: 'inline-flex',
  flex: '0 0 auto',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.warning.light,
  color: theme.vars.palette.warning.dark,

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export const TitleText = styled('span')(({ theme }) => ({
  ...theme.typography.h5,
}));

export const LogoutDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(0, 3, 3),
}));

export const LogoutDialogText = styled(DialogContentText)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.secondary,
}));

export const LogoutDialogActions = styled(DialogActions)(({ theme }) => ({
  gap: theme.spacing(1),
  padding: theme.spacing(2, 3, 3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    '& > :not(style) ~ :not(style)': {
      marginInlineStart: 0,
    },
  },
}));

export const CancelButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,
}));

export const ConfirmButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));
