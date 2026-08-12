import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const FilterBar = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(30)}, 2fr) repeat(4, minmax(${theme.spacing(18)}, 1fr))`,
  alignItems: 'end',
  gap: theme.spacing(1.5),

  [theme.breakpoints.down('xl')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const FilterField = styled(TextField)(() => ({}));

export const FilterOption = styled(MenuItem)(() => ({}));

export const ResetButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,
}));

export const TableLink = styled(AppLink)(({ theme }) => ({
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'underline',
  textUnderlineOffset: theme.spacing(0.5),
}));

export const ResultFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

export const ResultCount = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const ResultPagination = styled(Pagination)(() => ({}));
