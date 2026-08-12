import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';
import PageContainer from '@/components/layout/PageContainer';

export const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.default,
}));

export const Hero = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(9, 8),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(7),
  },
}));

export const HeroContainer = styled(PageContainer)({});

export const HeroTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  maxWidth: theme.spacing(70),
  margin: 0,
  color: 'inherit',
}));

export const HeroText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(72),
  marginTop: theme.spacing(2),
  color: 'inherit',
  opacity: 0.86,
}));

export const Section = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(9),

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(7),
  },
}));

export const AlternateSection = styled(Section)(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.paper,
}));

export const Container = styled(PageContainer)({});

export const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.55fr) minmax(18rem, 0.45fr)',
  gap: theme.spacing(4),
  alignItems: 'end',
  marginBottom: theme.spacing(5),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const SectionIntro = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.secondary,
}));

export const ZoneList = styled(Box)(({ theme }) => ({
  borderTop: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const ZoneRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(9rem, 0.38fr) minmax(10rem, 0.4fr) auto',
  gap: theme.spacing(3),
  alignItems: 'center',
  paddingBlock: theme.spacing(2.5),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const ZoneTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const ZoneBoundary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.secondary,
}));

export const ZoneFee = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',

  [theme.breakpoints.up('sm')]: {
    textAlign: 'right',
  },
}));

export const Explanation = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(4),
  marginTop: theme.spacing(5),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
  },
}));

export const Step = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.water.main}`,
}));

export const StepTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const StepText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(0.75),
  color: theme.vars.palette.text.secondary,
}));

export const PaymentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(4),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const PaymentItem = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.gas.main}`,
}));

export const PaymentTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h4,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const PaymentText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  marginTop: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
}));

export const Callout = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(3),
  marginTop: theme.spacing(6),
  paddingBlock: theme.spacing(3),
  borderBlock: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
}));

export const CalloutText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(70),
  color: theme.vars.palette.text.primary,
}));

export const ShopLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: theme.spacing(6),
  paddingInline: theme.spacing(3),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightSemiBold,
}));
