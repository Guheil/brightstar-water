import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: theme.spacing(90),
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const DetailSection = styled('section')(({ theme }) => ({
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

export const ResetButton = styled(Button)(({ theme }) => ({
  width: 'fit-content',
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.error.main,

  '&:hover': {
    backgroundColor: theme.vars.palette.error.light,
  },
}));
