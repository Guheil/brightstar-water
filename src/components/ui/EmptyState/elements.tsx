import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: theme.spacing(22),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(4),
  textAlign: 'center',
}));

export const IconSlot = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.vars.palette.text.secondary,

  '& svg': {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
}));

export const Title = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  color: theme.vars.palette.text.primary,
}));

export const Description = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(55),
  color: theme.vars.palette.text.secondary,
}));

export const ActionSlot = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: theme.spacing(1),
}));
