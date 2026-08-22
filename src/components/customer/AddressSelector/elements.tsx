import Box from '@mui/material/Box';
import Radio, { radioClasses } from '@mui/material/Radio';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const List = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
}));

export const Option = styled('label', {
  shouldForwardProp: (prop) => prop !== '$selected',
})<{ $selected: boolean }>(({ theme, $selected }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: theme.spacing(1.5),
  alignItems: 'start',
  padding: theme.spacing(2.25),
  cursor: 'pointer',
  border: `1px solid ${$selected ? theme.vars.palette.water.main : theme.vars.palette.divider}`,
  borderRadius: theme.radii.control,
  backgroundColor: $selected ? theme.vars.palette.action.focus : theme.vars.palette.background.paper,
  color: theme.vars.palette.text.primary,
  transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),

  '&:hover': {
    borderColor: theme.vars.palette.water.main,
    backgroundColor: $selected ? theme.vars.palette.action.focus : theme.vars.palette.action.hover,
  },

  '&:focus-within': {
    borderColor: theme.vars.palette.water.main,
    boxShadow: `0 0 0 ${theme.spacing(0.375)} ${theme.vars.palette.action.focus}`,
  },
}));

export const ChoiceRadio = styled(Radio)(({ theme }) => ({
  marginTop: theme.spacing(-0.75),
  color: theme.vars.palette.text.secondary,

  [`&.${radioClasses.checked}`]: {
    color: theme.vars.palette.water.main,
  },
}));

export const Copy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
}));

export const Label = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.vars.palette.text.primary,
}));

export const Detail = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Meta = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));
