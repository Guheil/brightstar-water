import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const FormRoot = styled('form')(({ theme }) => ({ display: 'grid', gap: theme.spacing(4) }));
export const Section = styled(Box)(({ theme }) => ({ display: 'grid', gap: theme.spacing(2) }));
export const SectionTitle = styled(Typography)(({ theme }) => ({ ...theme.typography.h3 }));
export const SectionCopy = styled(Typography)(({ theme }) => ({ ...theme.typography.body2, color: theme.vars.palette.text.secondary }));
export const TypeChoices = styled(Box)(({ theme }) => ({ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: theme.spacing(1), [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' } }));
export const TypeButton = styled(Button, { shouldForwardProp: (prop) => prop !== '$selected' })<{ $selected: boolean }>(({ theme, $selected }) => ({
  minHeight: 48,
  justifyContent: 'flex-start',
  borderRadius: theme.radii.control,
  borderColor: $selected ? theme.vars.palette.water.main : theme.vars.palette.divider,
  backgroundColor: $selected ? theme.vars.palette.action.focus : theme.vars.palette.background.paper,
  color: theme.vars.palette.text.primary,
  boxShadow: 'none',

  '&:hover': {
    borderColor: theme.vars.palette.water.main,
    backgroundColor: $selected ? theme.vars.palette.action.focus : theme.vars.palette.action.hover,
  },

  '&:focus-visible': {
    outline: `3px solid ${theme.vars.palette.action.focus}`,
    outlineOffset: theme.spacing(0.25),
  },
}));
export const FieldGrid = styled(Box)(({ theme }) => ({ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: theme.spacing(2), [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' } }));
export const FullField = styled(TextField)({ gridColumn: '1 / -1' });
export const Field = styled(TextField)({});
export const SelectControl = styled(FormControl)({ minWidth: 0 });
export const StyledSelect = styled(Select)({});
export const Actions = styled(Box)(({ theme }) => ({ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing(1.5), flexWrap: 'wrap', paddingTop: theme.spacing(1) }));
export const SecondaryButton = styled(Button)(({ theme }) => ({ minHeight: 44, borderRadius: theme.radii.control }));
export const PrimaryButton = styled(Button)(({ theme }) => ({ minHeight: 44, borderRadius: theme.radii.control }));
export const DefaultChoice = styled(FormControlLabel)(({ theme }) => ({ margin: 0, color: theme.vars.palette.text.primary }));
export { Checkbox, InputLabel, MenuItem };
