import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
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
  justifyContent: 'flex-end',
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
