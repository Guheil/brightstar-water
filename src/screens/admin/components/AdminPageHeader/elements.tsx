import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled('header')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'end',
  gap: theme.spacing(4),
  marginBlockEnd: theme.spacing(4.5),
  paddingBlockEnd: theme.spacing(3),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
    marginBlockEnd: theme.spacing(3),
    paddingBlockEnd: theme.spacing(2.5),
  },
}));

export const Copy = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: theme.spacing(92),
  flexDirection: 'column',
  gap: theme.spacing(0.75),
}));

export const BackLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  width: 'fit-content',
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',

  '&:hover': {
    textDecoration: 'underline',
    textUnderlineOffset: theme.spacing(0.5),
  },
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const Description = styled('p')(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(78),
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
