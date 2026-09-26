import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const ErrorRegion = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

export const PasswordAdornment = styled(InputAdornment)(() => ({}));

export const PasswordToggle = styled(IconButton)(({ theme }) => ({
  width: theme.spacing(5.5),
  height: theme.spacing(5.5),
  color: theme.vars.palette.text.secondary,

  '& svg': {
    height: theme.spacing(2.25),
    width: theme.spacing(2.25),
  },
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  minHeight: theme.spacing(6),
}));

export const SecurityHint = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));
