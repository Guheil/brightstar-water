import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(5),
}));

export const Stage = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.25fr) minmax(16rem, 0.75fr)',
  gap: theme.spacing(6),
  alignItems: 'end',
  paddingBlockEnd: theme.spacing(4),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
  },
}));

export const StageGrid = styled(Box)({
  display: 'contents',
});

export const StageCopy = styled(Box)({});

export const StageTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  maxWidth: theme.spacing(72),
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const StageDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(70),
  marginTop: theme.spacing(1.5),
  color: theme.vars.palette.text.secondary,
}));

export const StageFocus = styled(Box)(({ theme }) => ({
  display: 'grid',
  justifyItems: 'end',
  textAlign: 'right',

  [theme.breakpoints.down('md')]: {
    justifyItems: 'start',
    textAlign: 'left',
  },
}));

export const StageFocusValue = styled('strong')(({ theme }) => ({
  ...theme.typography.display,
  display: 'block',
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));

export const StageFocusCaption = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(38),
  marginTop: theme.spacing(0.5),
  color: theme.vars.palette.text.secondary,
}));

export const StageFocusGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(3),
  width: '100%',
  maxWidth: theme.spacing(44),
  marginTop: theme.spacing(2.5),
}));

export const StageFocusItem = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.25),
  paddingTop: theme.spacing(1.25),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,

  '& strong': {
    ...theme.typography.h4,
    color: theme.vars.palette.text.primary,
    fontVariantNumeric: 'tabular-nums',
  },
}));

export const StageFocusLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const CommandBar = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export const CommandLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.button,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingInline: theme.spacing(1.5),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.background.paper,
  color: theme.vars.palette.text.primary,
  textDecoration: 'none',
  transition: theme.transitions.create(['background-color', 'border-color'], {
    duration: theme.transitions.duration.shorter,
  }),

  '&:hover, &:focus-visible': {
    borderColor: theme.vars.palette.primary.main,
    backgroundColor: theme.vars.palette.neutral.light,
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

export const CommandIcon = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.vars.palette.primary.main,

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
  },
}));

export const CommandText = styled('span')({
  color: 'inherit',
});

export const SummaryStrip = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  margin: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
}));

export const SummaryItem = styled('div')(({ theme }) => ({
  minWidth: 0,
  minHeight: theme.spacing(10),
  padding: theme.spacing(2.25),
  borderInlineEndWidth: theme.spacing(0.125),
  borderInlineEndStyle: 'solid',
  borderInlineEndColor: theme.vars.palette.divider,

  '&:last-child': {
    borderInlineEndWidth: 0,
  },
}));

export const SummaryTerm = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(24),
  color: theme.vars.palette.text.secondary,
}));

export const SummaryValue = styled('dd')(({ theme }) => ({
  ...theme.typography.h3,
  margin: 0,
  marginBlockStart: theme.spacing(0.5),
  color: theme.vars.palette.text.primary,
  fontVariantNumeric: 'tabular-nums',
}));

export const AttentionGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.28fr) minmax(20rem, 0.72fr)',
  gap: theme.spacing(6),
  alignItems: 'start',

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(5),
  },
}));

export const SideStack = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(5),
}));

export const Section = styled('section')(({ theme }) => ({
  minWidth: 0,
  paddingBlock: theme.spacing(2),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const PrimarySection = styled(Section)({});

export const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(2),
  alignItems: 'start',
  paddingBottom: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const SectionHeading = styled('h2')(({ theme }) => ({
  ...theme.typography.h4,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const SectionIntro = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  marginBlockStart: theme.spacing(0.5),
  color: theme.vars.palette.text.secondary,
}));

export const ItemList = styled('ul')(({ theme }) => ({
  margin: 0,
  padding: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  listStyle: 'none',
}));

export const Item = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(2),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shorter,
  }),

  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

export const ItemCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.35),
}));

export const ItemTitle = styled('span')(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const ItemMeta = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const SectionLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',

  '&:hover': {
    textDecoration: 'underline',
    textUnderlineOffset: theme.spacing(0.5),
  },
}));

export const EmptyMessage = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  paddingBlock: theme.spacing(2),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  color: theme.vars.palette.text.secondary,
}));
