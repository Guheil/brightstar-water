import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3.5),
}));

export const CreateButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
}));

export const RoleSwitcher = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch',
  overflowX: 'auto',
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const RoleSwitchButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== '$active',
})<{ $active: boolean }>(({ theme, $active }) => ({
  minHeight: theme.spacing(5.5),
  flexShrink: 0,
  paddingInline: theme.spacing(2),
  borderRadius: 0,
  borderBottomWidth: theme.spacing(0.25),
  borderBottomStyle: 'solid',
  borderBottomColor: $active ? theme.vars.palette.primary.main : theme.vars.palette.divider,
  backgroundColor: $active ? theme.vars.palette.action.selected : theme.vars.palette.background.paper,
  color: $active ? theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
  fontWeight: $active ? theme.typography.fontWeightSemiBold : theme.typography.fontWeightMedium,

  '&:hover': {
    backgroundColor: theme.vars.palette.action.hover,
    color: theme.vars.palette.text.primary,
  },
}));

export const ToolbarForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(150px, 190px) minmax(180px, 220px) auto',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingBlock: theme.spacing(2),
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

export const TableLink = styled(AppLink)(({ theme }) => ({
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'underline',
  textUnderlineOffset: theme.spacing(0.5),
}));

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));

export const FormField = styled(TextField)(() => ({}));
export const FormOption = styled(MenuItem)(() => ({}));

export const DeleteSummary = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
  paddingBlock: theme.spacing(1.75),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const DeleteAccountName = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  fontWeight: theme.typography.fontWeightSemiBold,
  color: theme.vars.palette.text.primary,
}));

export const DeleteAccountMeta = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
  overflowWrap: 'anywhere',
}));

export const DeleteWarning = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.error.main,
}));

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
