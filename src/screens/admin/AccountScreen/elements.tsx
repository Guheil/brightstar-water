import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: theme.spacing(108),
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

export const DetailSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(2.5),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const SecuritySection = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(24)}, ${theme.spacing(32)}) minmax(0, 1fr)`,
  gap: theme.spacing(4),
  paddingBlock: theme.spacing(3.5),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2.5),
  },
}));

export const SectionCopy = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.75),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h4,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const SectionDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const DetailList = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(20)}, auto) minmax(0, 1fr)`,
  gap: theme.spacing(1.25, 2),
  margin: 0,
  marginBlockStart: theme.spacing(2),

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

export const SecurityForm = styled('form')(({ theme }) => ({
  display: 'grid',
  maxWidth: theme.spacing(68),
  gap: theme.spacing(2),
}));

export const FormField = styled(TextField)(() => ({}));

export const FormActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),

  [theme.breakpoints.down('sm')]: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),

  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));
