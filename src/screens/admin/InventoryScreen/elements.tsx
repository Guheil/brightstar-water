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

export const AdjustmentSection = styled('section')(({ theme }) => ({
  borderTopWidth: theme.spacing(0.25),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.main,
  paddingBlockStart: theme.spacing(2),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const SectionCopy = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  marginBlockStart: theme.spacing(0.5),
  color: theme.vars.palette.text.secondary,
}));

export const AdjustmentForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(26)}, 2fr) minmax(${theme.spacing(18)}, 1fr) minmax(${theme.spacing(16)}, 1fr) minmax(${theme.spacing(30)}, 2fr) auto`,
  alignItems: 'start',
  gap: theme.spacing(1.5),
  marginBlockStart: theme.spacing(2),

  [theme.breakpoints.down('xl')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const FormField = styled(TextField)(() => ({}));

export const FormOption = styled(MenuItem)(() => ({}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const HistorySection = styled('section')(({ theme }) => ({
  borderTopWidth: theme.spacing(0.25),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.main,
  paddingBlockStart: theme.spacing(2),
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
