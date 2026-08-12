import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: theme.spacing(100),
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const ProductForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(2),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const Field = styled(TextField)(() => ({}));

export const FullField = styled(Field)({
  gridColumn: '1 / -1',
});

export const Option = styled(MenuItem)(() => ({}));

export const FeaturedControl = styled(FormControlLabel)({
  gridColumn: '1 / -1',
});

export const FeaturedCheckbox = styled(Checkbox)(() => ({}));

export const FormActions = styled(Box)(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  paddingBlockStart: theme.spacing(1),
}));

export const SaveButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const CancelLink = styled(AppLink)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: theme.spacing(2),
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightMedium,
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
