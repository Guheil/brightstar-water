import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
}));

export const FilterSection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.paper,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const FilterForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(28)}, 1.7fr) repeat(4, minmax(${theme.spacing(17)}, 1fr)) auto`,
  alignItems: 'end',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),

  [theme.breakpoints.down('xl')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    padding: theme.spacing(1.5),
  },
}));

export const SearchField = styled(TextField)(() => ({}));
export const FilterField = styled(TextField)(() => ({}));
export const FilterOption = styled(MenuItem)(() => ({}));

export const FilterActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),

  [theme.breakpoints.down('xl')]: {
    alignSelf: 'stretch',
  },

  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

export const ApplyButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  whiteSpace: 'nowrap',

  [theme.breakpoints.down('sm')]: {
    flex: 1,
  },
}));

export const ClearButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  whiteSpace: 'nowrap',
}));

export const ResultBar = styled(Box)(({ theme }) => ({
  minHeight: theme.spacing(6),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingInline: theme.spacing(2),
  paddingBlock: theme.spacing(1),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    paddingInline: theme.spacing(1.5),
  },
}));

export const ResultText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ActivitySummary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(70),
  color: theme.vars.palette.text.primary,
}));

export const PersonCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.25),
}));

export const PersonName = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const PersonRole = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const TargetCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.25),
}));

export const TargetName = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const TargetType = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const ViewButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  minHeight: theme.spacing(5.5),
  paddingInline: theme.spacing(1.25),
}));

export const LoadMoreWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  paddingTop: theme.spacing(1),
}));

export const LoadMoreButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  minWidth: theme.spacing(20),
}));

export const DetailDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: theme.spacing(70),
    maxWidth: '100%',
    backgroundColor: theme.vars.palette.background.paper,
  },
}));

export const DetailShell = styled(Box)({
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
});

export const DetailHeader = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'start',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const DetailTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.h3,
  color: theme.vars.palette.primary.main,
}));

export const DetailLead = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  marginTop: theme.spacing(0.75),
  color: theme.vars.palette.text.primary,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,
}));

export const DetailBody = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3.5),
  padding: theme.spacing(3),

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const DetailSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
}));

export const DetailSectionTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  color: theme.vars.palette.primary.main,
}));

export const DetailGrid = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(17)}, auto) minmax(0, 1fr)`,
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(1.25),
  margin: 0,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    rowGap: theme.spacing(0.5),
  },
}));

export const DetailTerm = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const DetailValue = styled('dd')(({ theme }) => ({
  ...theme.typography.body2,
  minWidth: 0,
  margin: 0,
  color: theme.vars.palette.text.primary,
  overflowWrap: 'anywhere',
}));

export const ChangeList = styled(Box)(({ theme }) => ({
  display: 'grid',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const ChangeRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(18)}, 0.7fr) minmax(0, 1fr) minmax(0, 1fr)`,
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const ChangeField = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const ChangeValue = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
  overflowWrap: 'anywhere',
}));

export const MutedCopy = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const SecurityDetails = styled('details')(({ theme }) => ({
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  paddingTop: theme.spacing(2),
}));

export const SecuritySummary = styled('summary')(({ theme }) => ({
  ...theme.typography.body2,
  width: 'fit-content',
  cursor: 'pointer',
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,

  '&:focus-visible': {
    outlineWidth: theme.spacing(0.25),
    outlineStyle: 'solid',
    outlineColor: theme.vars.palette.water.main,
    outlineOffset: theme.spacing(0.5),
  },
}));

export const SecurityBody = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(1.5),
}));
