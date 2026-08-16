import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.75),
  },
}));

export const ErrorRegion = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

export const Field = styled(TextField)(() => ({}));
export const PasswordAdornment = styled(InputAdornment)(() => ({}));

export const PasswordToggle = styled(IconButton)(({ theme }) => ({
  width: theme.spacing(5.5),
  height: theme.spacing(5.5),
  color: theme.vars.palette.text.secondary,

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
  },
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6),
  marginTop: theme.spacing(0.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const FormLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginTop: theme.spacing(0.5),

  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
}));

export const TextLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
}));


export const DemoAccess = styled('details')(({ theme }) => ({
  marginTop: theme.spacing(2.5),
  paddingTop: theme.spacing(1.5),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  color: theme.vars.palette.text.secondary,
  opacity: 0.62,
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter,
  }),

  '&[open], &:hover, &:focus-within': {
    opacity: 1,
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

export const DemoAccessSummary = styled('summary')(({ theme }) => ({
  ...theme.typography.body2,
  width: 'fit-content',
  minHeight: theme.spacing(5.5),
  display: 'flex',
  alignItems: 'center',
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
  cursor: 'pointer',
  userSelect: 'none',
}));

export const DemoAccessHint = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(0.25),
  color: theme.vars.palette.text.secondary,
}));

export const DemoAccessList = styled(Box)(({ theme }) => ({
  display: 'grid',
  marginTop: theme.spacing(1.25),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const DemoAccessRow = styled(Box)(({ theme }) => ({
  minWidth: 0,
  minHeight: theme.spacing(6.5),
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const DemoAccountName = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const DemoAccountEmail = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  overflow: 'hidden',
  color: theme.vars.palette.text.secondary,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const DemoUseButton = styled(Button)(({ theme }) => ({
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  paddingInline: theme.spacing(1.5),
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));
