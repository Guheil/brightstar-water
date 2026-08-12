import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

export const SummaryStrip = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  margin: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
}));

export const SummaryItem = styled('div')(({ theme }) => ({
  minWidth: 0,
  padding: theme.spacing(2),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const SummaryTerm = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const SummaryValue = styled('dd')(({ theme }) => ({
  ...theme.typography.h4,
  margin: 0,
  marginBlockStart: theme.spacing(0.5),
  color: theme.vars.palette.text.primary,
  fontVariantNumeric: 'tabular-nums',
}));

export const AttentionGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(4),

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const Section = styled('section')(({ theme }) => ({
  minWidth: 0,
  borderTopWidth: theme.spacing(0.25),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.main,
  paddingBlockStart: theme.spacing(2),
}));

export const SectionHeading = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const SectionIntro = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  marginBlockStart: theme.spacing(0.5),
  color: theme.vars.palette.text.secondary,
}));

export const ItemList = styled('ul')(({ theme }) => ({
  margin: 0,
  marginBlockStart: theme.spacing(2),
  padding: 0,
  listStyle: 'none',
}));

export const Item = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const ItemCopy = styled(Box)(({ theme }) => ({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
}));

export const ItemTitle = styled('span')(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const ItemMeta = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const SectionLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  display: 'inline-flex',
  marginBlockStart: theme.spacing(2),
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'underline',
  textUnderlineOffset: theme.spacing(0.5),
}));

export const EmptyMessage = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  marginBlockStart: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));
