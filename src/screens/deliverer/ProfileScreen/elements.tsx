import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
  maxWidth: theme.spacing(96),
}));

export const ProfileHero = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(3),
  alignItems: 'end',
  paddingBlockEnd: theme.spacing(3),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const Name = styled('h2')(({ theme }) => ({
  ...theme.typography.h1,
  margin: 0,
  color: theme.vars.palette.primary.main,

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.h2,
  },
}));

export const Role = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  marginTop: theme.spacing(0.5),
  color: theme.vars.palette.text.secondary,
}));

export const Summary = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  margin: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));

export const SummaryItem = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderInlineEndWidth: theme.spacing(0.125),
  borderInlineEndStyle: 'solid',
  borderInlineEndColor: theme.vars.palette.divider,

  '&:last-child': {
    borderInlineEndWidth: 0,
  },
}));

export const SummaryValue = styled('dd')(({ theme }) => ({
  ...theme.typography.h4,
  margin: 0,
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));

export const SummaryLabel = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ProfilePanel = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.5),
  paddingBlock: theme.spacing(2.5),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const SectionTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const Details = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(18)}, auto) minmax(0, 1fr)`,
  gap: theme.spacing(1.5, 2),
  margin: 0,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const Label = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Value = styled('dd')(({ theme }) => ({
  ...theme.typography.body1,
  margin: 0,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const SignOutButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6),
  justifySelf: 'start',
  color: theme.vars.palette.error.main,
}));
