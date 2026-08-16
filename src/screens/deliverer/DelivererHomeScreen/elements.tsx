import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
}));

export const Hero = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(3.5),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(2.5),
  },
}));

export const HeroGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(3),
  alignItems: 'end',

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));

export const Greeting = styled('h2')(({ theme }) => ({
  ...theme.typography.h1,
  margin: 0,
  color: theme.vars.palette.primary.main,

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.h2,
  },
}));

export const HeroText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(62),
  marginTop: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
}));

export const RemainingNumber = styled('strong')(({ theme }) => ({
  ...theme.typography.display,
  display: 'block',
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));

export const RemainingLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
  textAlign: 'right',

  [theme.breakpoints.down('sm')]: {
    textAlign: 'left',
  },
}));

export const NextSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.25fr) minmax(15rem, 0.75fr)',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.main,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const NextMain = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  padding: theme.spacing(3),

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5),
  },
}));

export const NextSide = styled(Box)(({ theme }) => ({
  display: 'grid',
  alignContent: 'center',
  gap: theme.spacing(1.25),
  padding: theme.spacing(3),
  borderInlineStartWidth: theme.spacing(0.125),
  borderInlineStartStyle: 'solid',
  borderInlineStartColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.neutral.light,

  [theme.breakpoints.down('md')]: {
    borderInlineStartWidth: 0,
    borderTopWidth: theme.spacing(0.125),
    borderTopStyle: 'solid',
    borderTopColor: theme.vars.palette.divider,
  },
}));

export const SectionTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const NextCustomer = styled('h4')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const Meta = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Schedule = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightBold,
}));

export const PrimaryAction = styled(AppLink)(({ theme }) => ({
  ...theme.typography.button,
  minHeight: theme.spacing(6),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(2),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  textDecoration: 'none',
}));

export const Summary = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
}));

export const SummaryItem = styled('div')(({ theme }) => ({
  minWidth: 0,
  padding: theme.spacing(2),
  borderInlineEndWidth: theme.spacing(0.125),
  borderInlineEndStyle: 'solid',
  borderInlineEndColor: theme.vars.palette.divider,

  '&:last-child': {
    borderInlineEndWidth: 0,
  },
}));

export const SummaryValue = styled('strong')(({ theme }) => ({
  ...theme.typography.h3,
  display: 'block',
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));

export const SummaryLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const QueueSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
}));

export const QueueHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

export const QueueLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
}));

export const MiniQueue = styled('ol')(({ theme }) => ({
  margin: 0,
  padding: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  listStyle: 'none',
}));

export const MiniItem = styled('li')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  gap: theme.spacing(1.5),
  alignItems: 'center',
  paddingBlock: theme.spacing(1.75),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'auto minmax(0, 1fr)',
  },
}));

export const Time = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightBold,
}));

export const MiniLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  color: theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',

  [theme.breakpoints.down('sm')]: {
    gridColumn: '2',
  },
}));
