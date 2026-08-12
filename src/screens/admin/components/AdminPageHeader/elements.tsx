import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled('header')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(3),
  marginBlockEnd: theme.spacing(4),

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    marginBlockEnd: theme.spacing(3),
  },
}));

export const Copy = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: theme.spacing(82),
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export const BackLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  width: 'fit-content',
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightMedium,
  textDecoration: 'underline',
  textUnderlineOffset: theme.spacing(0.5),
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.h3,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const Description = styled('p')(({ theme }) => ({
  ...theme.typography.body1,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),

  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'flex-start',
  },
}));
