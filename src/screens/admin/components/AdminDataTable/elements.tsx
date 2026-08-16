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
  overflow: 'auto',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const DataTable = styled(Table)({
  width: '100%',
});

export const DataTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.vars.palette.primary.main,
}));

export const DataTableBody = styled(TableBody)({});
export const HeadRow = styled(TableRow)({});

export const BodyRow = styled(TableRow)(({ theme }) => ({
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shorter,
  }),

  '&:nth-of-type(even)': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  '&:hover, &:focus-within': {
    backgroundColor: theme.vars.palette.background.paper,
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

export const HeadCell = styled(TableCell)(({ theme }) => ({
  ...theme.typography.body2,
  paddingBlock: theme.spacing(1.75),
  backgroundColor: theme.vars.palette.primary.main,
  borderBottomColor: theme.vars.palette.primary.dark,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightBold,
  whiteSpace: 'nowrap',

  '&:first-of-type': {
    paddingInlineStart: theme.spacing(2.25),
  },

  '&:last-of-type': {
    paddingInlineEnd: theme.spacing(2.25),
  },
}));

export const BodyCell = styled(TableCell)(({ theme }) => ({
  ...theme.typography.body2,
  paddingBlock: theme.spacing(1.75),
  color: theme.vars.palette.text.primary,
  verticalAlign: 'top',
}));

export const MobileList = styled(Box)(({ theme }) => ({
  display: 'none',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

export const MobileRecord = styled('article')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(14)}, auto) minmax(0, 1fr)`,
  gap: theme.spacing(1, 2),
  padding: theme.spacing(2.25),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  '&:last-child': {
    borderBottomWidth: 0,
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: `minmax(${theme.spacing(11)}, auto) minmax(0, 1fr)`,
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
