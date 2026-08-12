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

export const SearchField = styled(TextField)(({ theme }) => ({
  width: '100%',
  maxWidth: theme.spacing(55),
}));

export const TableLink = styled(AppLink)(({ theme }) => ({
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'underline',
  textUnderlineOffset: theme.spacing(0.5),
}));

export const ResetButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,
}));
