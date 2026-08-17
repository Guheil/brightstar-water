import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3.5),
}));

export const CreateButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
}));

export const ToolbarForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(150px, 190px) minmax(150px, 190px) auto',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingBlock: theme.spacing(2),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr 1fr',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const SearchField = styled(TextField)(() => ({}));
export const FilterField = styled(TextField)(() => ({}));
export const FilterOption = styled(MenuItem)(() => ({}));

export const SearchButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
}));

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));

export const FormField = styled(TextField)(() => ({}));
export const FormOption = styled(MenuItem)(() => ({}));

export const Pagination = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),

  [theme.breakpoints.down('sm')]: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
}));

export const PaginationText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const PaginationActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
}));

export const PaginationButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
}));
