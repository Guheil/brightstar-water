import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const Toolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

export const SearchField = styled(TextField)(({ theme }) => ({
  maxWidth: theme.spacing(50),
  flex: '1 1 auto',
}));

export const NewProductLink = styled(AppLink)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(2),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightSemiBold,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const TableLink = styled(AppLink)(({ theme }) => ({
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'underline',
  textUnderlineOffset: theme.spacing(0.5),
}));

export const InlineActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export const ToggleButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,
}));

export const EmptyResetButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,
}));
