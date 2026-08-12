import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  maxWidth: theme.spacing(82),
}));

export const Intro = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  color: theme.vars.palette.text.secondary,
}));

export const FailureForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.paper,
  border: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,
}));

export const Legend = styled('legend')(({ theme }) => ({
  ...theme.typography.h5,
  marginBottom: theme.spacing(1.5),
  padding: 0,
  color: theme.vars.palette.primary.main,
}));

export const ReasonGroup = styled(RadioGroup)(({ theme }) => ({
  gap: theme.spacing(0.5),
}));

export const ReasonOption = styled(FormControlLabel)(({ theme }) => ({
  minHeight: theme.spacing(6),
  marginInline: 0,
  paddingInline: theme.spacing(1),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const NoteField = styled(TextField)({
  width: '100%',
});

export const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6),
}));

export const CancelLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  minHeight: theme.spacing(6),
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(2),
  border: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.control,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
}));

export const Result = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));
