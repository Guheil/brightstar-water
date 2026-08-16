import { styled } from '@mui/material/styles';

export const Root = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))',
  margin: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const Item = styled('div')(({ theme }) => ({
  minHeight: theme.spacing(9),
  padding: theme.spacing(2, 2.25),
  borderInlineEndWidth: theme.spacing(0.125),
  borderInlineEndStyle: 'solid',
  borderInlineEndColor: theme.vars.palette.divider,

  '&:last-child': {
    borderInlineEndWidth: 0,
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(8),
    padding: theme.spacing(1.75, 1.5),
  },
}));

export const Label = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Value = styled('dd')(({ theme }) => ({
  ...theme.typography.h3,
  margin: 0,
  marginBlockStart: theme.spacing(0.5),
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));
