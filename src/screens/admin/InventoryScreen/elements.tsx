import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h4,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const SectionCopy = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(72),
  margin: 0,
  marginBlockStart: theme.spacing(0.5),
  color: theme.vars.palette.text.secondary,
}));

export const AdjustButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const AdjustmentForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));

export const FormField = styled(TextField)(() => ({}));
export const FormOption = styled(MenuItem)(() => ({}));

export const HistorySection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(2.5),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const HistoryList = styled('ol')(({ theme }) => ({
  margin: 0,
  marginBlockStart: theme.spacing(2),
  padding: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  listStyle: 'none',
}));

export const HistoryItem = styled('li')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(24)}, 1fr) minmax(${theme.spacing(16)}, auto) minmax(0, 2fr) auto`,
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const HistoryText = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
}));

export const HistoryMeta = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));
