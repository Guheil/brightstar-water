import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const ErrorRegion = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6),
  marginTop: theme.spacing(0.5),
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

export const DemoSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  paddingTop: theme.spacing(3),
  borderTop: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const DemoTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const DemoIntro = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(0.5),
  color: theme.vars.palette.text.secondary,
}));

export const CredentialList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderTop: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const CredentialRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(6rem, 0.32fr) minmax(0, 0.68fr)',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.25),
  },
}));

export const CredentialRole = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.vars.palette.text.primary,
}));

export const CredentialEmail = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  minWidth: 0,
  overflowWrap: 'anywhere',
  color: theme.vars.palette.text.secondary,
}));

export const PasswordHint = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(1.5),
  color: theme.vars.palette.text.secondary,
}));
