import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const CartDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: theme.spacing(56),
    margin: theme.spacing(2),
    borderRadius: theme.radii.control,
    boxShadow: theme.shadows[8],
    willChange: 'transform',
  },
  '& .MuiDialog-container[data-dialog-motion-state="exited"] .MuiDialog-paper': {
    visibility: 'hidden',
  },
  '& .MuiDialog-container[data-dialog-motion-state="entering"] .MuiDialog-paper, & .MuiDialog-container[data-dialog-motion-state="exiting"] .MuiDialog-paper': {
    overflow: 'hidden',
  },
}));

export const CartDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(3, 3, 1.5),
  color: theme.vars.palette.primary.main,
}));

export const CartMark = styled(Box)(({ theme }) => ({
  width: theme.spacing(5),
  height: theme.spacing(5),
  display: 'inline-flex',
  flex: '0 0 auto',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.water.main,
  color: theme.vars.palette.water.contrastText,
  willChange: 'transform, opacity',

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export const TitleText = styled('span')(({ theme }) => ({
  ...theme.typography.h5,
}));

export const CartDialogContent = styled(DialogContent)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.5),
  padding: theme.spacing(0, 3, 3),
  willChange: 'opacity',
}));

export const CartDialogText = styled(DialogContentText)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.secondary,
}));

export const CartSummary = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.25),
  padding: theme.spacing(2),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.background.default,
}));

export const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1.2fr)',
  alignItems: 'center',
  gap: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const SummaryLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const SummaryValue = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
  minWidth: 0,
  fontWeight: theme.typography.fontWeightSemiBold,
  overflowWrap: 'anywhere',
  textAlign: 'right',

  [theme.breakpoints.down('sm')]: {
    textAlign: 'left',
  },
}));

export const QuantitySlot = styled(Box)(({ theme }) => ({
  display: 'flex',
  minWidth: 0,
  justifyContent: 'flex-end',

  [theme.breakpoints.down('sm')]: {
    justifyContent: 'flex-start',
  },
}));

export const CartDialogActions = styled(DialogActions)(({ theme }) => ({
  gap: theme.spacing(1),
  padding: theme.spacing(2, 3, 3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  willChange: 'opacity',

  [theme.breakpoints.down('sm')]: {
    alignItems: 'stretch',
    flexDirection: 'column-reverse',

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
