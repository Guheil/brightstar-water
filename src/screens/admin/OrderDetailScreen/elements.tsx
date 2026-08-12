import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const ContentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(0, 2fr) minmax(${theme.spacing(36)}, 1fr)`,
  gap: theme.spacing(4),
  alignItems: 'start',

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const MainColumn = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

export const SideColumn = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(12),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),

  [theme.breakpoints.down('lg')]: {
    position: 'static',
  },
}));

export const Section = styled('section')(({ theme }) => ({
  borderTopWidth: theme.spacing(0.25),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.main,
  paddingBlockStart: theme.spacing(2),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  marginBlockEnd: theme.spacing(2),
  color: theme.vars.palette.text.primary,
}));

export const DetailList = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(18)}, auto) minmax(0, 1fr)`,
  gap: theme.spacing(1, 2),
  margin: 0,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
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

export const ItemList = styled('ul')(({ theme }) => ({
  margin: 0,
  padding: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  listStyle: 'none',
}));

export const ItemRow = styled('li')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto auto',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'minmax(0, 1fr) auto',
  },
}));

export const ItemName = styled('span')(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const ItemMeta = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Totals = styled(DetailList)(({ theme }) => ({
  marginBlockStart: theme.spacing(2),
  paddingBlockStart: theme.spacing(2),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const TotalValue = styled(DetailValue)(() => ({
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
}));

export const Timeline = styled('ol')(({ theme }) => ({
  margin: 0,
  paddingInlineStart: theme.spacing(3),
}));

export const TimelineItem = styled('li')(({ theme }) => ({
  paddingBlockEnd: theme.spacing(2),
  paddingInlineStart: theme.spacing(1),
  color: theme.vars.palette.text.primary,

  '&::marker': {
    color: theme.vars.palette.water.main,
  },
}));

export const TimelineLabel = styled('div')(({ theme }) => ({
  ...theme.typography.body1,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const TimelineMeta = styled('div')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ActionPanel = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.surface,
  backgroundColor: theme.vars.palette.background.paper,
}));

export const ActionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h6,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const ActionCopy = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  justifyContent: 'flex-start',
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const SecondaryButton = styled(AppLink)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingInline: theme.spacing(2),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  color: theme.vars.palette.text.primary,

  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },
}));

export const DangerButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  justifyContent: 'flex-start',
  color: theme.vars.palette.error.main,

  '&:hover': {
    backgroundColor: theme.vars.palette.error.light,
  },
}));

export const ActionField = styled(TextField)(() => ({}));

export const ActionOption = styled(MenuItem)(() => ({}));

export const InlineLink = styled(AppLink)(({ theme }) => ({
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'underline',
  textUnderlineOffset: theme.spacing(0.5),
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
