import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

export const Section = styled('section')(({ theme }) => ({
  borderTopWidth: theme.spacing(0.25),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.main,
  paddingBlockStart: theme.spacing(2),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  marginBlockEnd: theme.spacing(2),
  color: theme.vars.palette.text.primary,
}));

export const DetailList = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(20)}, auto) minmax(0, 1fr)`,
  gap: theme.spacing(1, 2),
  margin: 0,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const DetailTerm = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const DetailValue = styled('dd')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.primary,
  overflowWrap: 'anywhere',
}));

export const AddressList = styled('ul')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(3),
  margin: 0,
  padding: 0,
  listStyle: 'none',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const AddressItem = styled('li')(({ theme }) => ({
  paddingBlock: theme.spacing(2),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const AddressTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h6,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const AddressText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  marginBlockStart: theme.spacing(0.75),
  color: theme.vars.palette.text.secondary,
}));

export const TableLink = styled(AppLink)(({ theme }) => ({
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'underline',
  textUnderlineOffset: theme.spacing(0.5),
}));

export const EmptyActionLink = styled(AppLink)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: theme.spacing(2),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightSemiBold,
}));
