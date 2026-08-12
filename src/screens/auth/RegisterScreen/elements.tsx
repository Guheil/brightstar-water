import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6),
  marginTop: theme.spacing(0.5),
}));

export const FooterText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

export const TextLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const SuccessRegion = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));
