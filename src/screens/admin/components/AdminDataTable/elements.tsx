import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';

export const DesktopTableContainer = styled(TableContainer)(({ theme }) => ({
  width: '100%',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const DataTable = styled(Table)({
  width: '100%',
});

export const DataTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.vars.palette.neutral.light,
}));

export const DataTableBody = styled(TableBody)({});

export const HeadRow = styled(TableRow)({});

export const BodyRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  '&:focus-within': {
    backgroundColor: theme.vars.palette.neutral.light,
  },
}));

export const HeadCell = styled(TableCell)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightBold,
  whiteSpace: 'nowrap',
}));

export const BodyCell = styled(TableCell)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
  verticalAlign: 'top',
}));

export const MobileList = styled(Box)(({ theme }) => ({
  display: 'none',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,

  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

export const MobileRecord = styled('article')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(14)}, auto) minmax(0, 1fr)`,
  gap: theme.spacing(1, 2),
  paddingBlock: theme.spacing(2),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: `minmax(${theme.spacing(12)}, auto) minmax(0, 1fr)`,
  },
}));

export const MobileLabel = styled('div')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const MobileValue = styled('div')(({ theme }) => ({
  ...theme.typography.body2,
  minWidth: 0,
  color: theme.vars.palette.text.primary,
  overflowWrap: 'anywhere',
}));
