import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const Intro = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(70),
  color: theme.vars.palette.text.secondary,
}));

export const Queue = styled('ol')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  margin: 0,
  padding: 0,
  listStyle: 'none',
}));

export const QueueItem = styled('li')({
  margin: 0,
});

export const DeliveryLink = styled(AppLink)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(8rem, 0.7fr) minmax(0, 1.5fr) minmax(8rem, 0.7fr) auto',
  alignItems: 'center',
  gap: theme.spacing(2),
  minHeight: theme.spacing(10),
  padding: theme.spacing(2),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  color: theme.vars.palette.text.primary,
  textDecoration: 'none',
  transition: theme.transitions.create('background-color'),

  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr auto',
    alignItems: 'start',
  },
}));

export const Time = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));

export const Primary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const Secondary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Address = styled(Box)(({ theme }) => ({
  minWidth: 0,

  [theme.breakpoints.down('sm')]: {
    gridColumn: '1 / -1',
  },
}));

export const Payment = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),

  [theme.breakpoints.down('sm')]: {
    gridColumn: '1',
  },
}));

export const Arrow = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  color: theme.vars.palette.water.main,
}));
