import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3.5),
}));

export const Intro = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(72),
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

export const DayGroup = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
}));

export const DayTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  paddingBlockEnd: theme.spacing(1),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  color: theme.vars.palette.primary.main,
}));

export const HistoryList = styled('ol')({
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const HistoryItem = styled('li')({
  margin: 0,
});

export const HistoryLink = styled(AppLink)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(8rem, 0.6fr) minmax(0, 1.4fr) auto',
  gap: theme.spacing(2),
  alignItems: 'center',
  minHeight: theme.spacing(9),
  paddingBlock: theme.spacing(1.75),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  color: theme.vars.palette.text.primary,
  textDecoration: 'none',
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shorter,
  }),

  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr auto',
    gap: theme.spacing(0.6, 1),
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

export const Primary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const Secondary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const LoadMoreButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  justifySelf: 'start',
  paddingInline: theme.spacing(2.5),
  border: `1px solid ${theme.vars.palette.divider}`,
  color: theme.vars.palette.text.primary,
  backgroundColor: theme.vars.palette.background.paper,
  '&:hover': { backgroundColor: theme.vars.palette.action.hover },
}));
