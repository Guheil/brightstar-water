import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const AuthDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: theme.spacing(62),
    borderRadius: theme.radii.surface,
  },
}));

export const Title = styled(DialogTitle)(({ theme }) => ({
  ...theme.typography.h4,
  padding: theme.spacing(3, 3, 1),
  color: theme.vars.palette.text.primary,
}));

export const Content = styled(DialogContent)(({ theme }) => ({
  ...theme.typography.body1,
  padding: theme.spacing(1, 3, 2),
  color: theme.vars.palette.text.secondary,
}));

export const Actions = styled(DialogActions)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 3, 3),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const PrimaryLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.button,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(2),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  textDecoration: 'none',
}));

export const SecondaryLink = styled(PrimaryLink)(({ theme }) => ({
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,
  color: theme.vars.palette.text.primary,
}));

export const Note = styled(Box)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
}));
