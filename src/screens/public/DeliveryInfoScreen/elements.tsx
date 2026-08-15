import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import AppLink from '@/components/ui/AppLink';
import PageContainer from '@/components/layout/PageContainer';

export const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.default,
}));

export const Hero = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(8, 10),
  backgroundColor: theme.vars.palette.background.default,

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(6, 8),
  },
}));

export const HeroContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.82fr) minmax(0, 1.18fr)',
  gap: theme.spacing(7),
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(5),
  },
}));

export const HeroCopy = styled(Box)({});

export const HeroTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.display,
  maxWidth: theme.spacing(74),
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const HeroText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(70),
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

export const HeroFacts = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(2),
  margin: theme.spacing(5, 0, 0),
  paddingTop: theme.spacing(2),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.primary.main}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1.5),
  },
}));

export const HeroFact = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
}));

export const HeroFactLabel = styled('dt')(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const HeroFactValue = styled('dd')(({ theme }) => ({
  ...theme.typography.h6,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const HeroMedia = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$split',
})<{ $split: boolean }>(({ theme, $split }) => ({
  display: 'grid',
  gridTemplateColumns: $split ? 'minmax(0, 1.18fr) minmax(0, 0.82fr)' : '1fr',
  gap: theme.spacing(2),
  minHeight: theme.spacing(62),

  [theme.breakpoints.down('sm')]: {
    minHeight: 'auto',
    gridTemplateColumns: $split ? '1fr 0.72fr' : '1fr',
  },
}));

export const HeroMediaPrimary = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(62),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.neutral.light,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(42),
  },
}));

export const HeroMediaSecondary = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(48),
  alignSelf: 'end',
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(30),
  },
}));

export const HeroImage = styled(Image)({
  objectFit: 'cover',
});

export const Container = styled(PageContainer)({});

export const CoverageSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(9),

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(7),
  },
}));

export const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.82fr) minmax(18rem, 0.58fr)',
  gap: theme.spacing(6),
  alignItems: 'end',
  marginBottom: theme.spacing(5),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
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
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.primary.main}`,
}));

export const ZoneRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(9rem, 0.38fr) minmax(10rem, 0.42fr) auto',
  gap: theme.spacing(3),
  alignItems: 'center',
  minHeight: theme.spacing(8),
  paddingBlock: theme.spacing(2),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr auto',
    gap: theme.spacing(0.5, 2),
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

  [theme.breakpoints.down('sm')]: {
    gridColumn: '1 / -1',
    gridRow: 2,
  },
}));

export const ZoneFee = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
  textAlign: 'right',
}));

export const CoverageNote = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(92),
  marginTop: theme.spacing(4),
  color: theme.vars.palette.text.secondary,
}));

export const CoverageNoteStrong = styled('strong')(({ theme }) => ({
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const JourneySection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
  backgroundColor: theme.vars.palette.background.paper,

  '& > div': {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.08fr) minmax(18rem, 0.92fr)',
    gap: theme.spacing(7),
    alignItems: 'center',
  },

  [theme.breakpoints.down('md')]: {
    '& > div': {
      gridTemplateColumns: '1fr',
    },
  },
}));

export const JourneyMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(62),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.neutral.light,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(42),
  },
}));

export const JourneyImage = styled(Image)({
  objectFit: 'cover',
});

export const JourneyCopy = styled(Box)({});

export const JourneyTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const JourneyText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

export const JourneySteps = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.5),
  marginTop: theme.spacing(4),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.water.main}`,
}));

export const JourneyStep = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
  paddingTop: theme.spacing(2.5),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  paddingBottom: theme.spacing(2.5),
}));

export const JourneyStepTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const JourneyStepCopy = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const PaymentSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  [`& ${SectionTitle}`]: {
    color: 'inherit',
  },

  [`& ${SectionIntro}`]: {
    color: 'inherit',
    opacity: 0.78,
  },
}));

export const PaymentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(6),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(4),
  },
}));

export const PaymentItem = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2.5),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.gas.main}`,
}));

export const PaymentTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h4,
  margin: 0,
  color: 'inherit',
}));

export const PaymentText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(60),
  marginTop: theme.spacing(1),
  color: 'inherit',
  opacity: 0.78,
}));

export const PaymentNote = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(92),
  marginTop: theme.spacing(5),
  paddingTop: theme.spacing(3),
  borderTop: `${theme.spacing(0.125)} solid currentColor`,
  color: 'inherit',
  opacity: 0.8,
}));

export const AssuranceGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(5),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
  },
}));

export const AssuranceItem = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.water.main}`,
}));

export const AssuranceTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const AssuranceText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
}));

export const CtaSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
  backgroundColor: theme.vars.palette.background.paper,
}));

export const CtaCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(4),
  alignItems: 'center',
  paddingBlock: theme.spacing(4),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.primary.main}`,
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const CtaTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  maxWidth: theme.spacing(72),
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const CtaActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
}));

export const CtaPrimary = styled(AppLink)(({ theme }) => ({
  ...theme.typography.button,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: theme.spacing(2.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  textDecoration: 'none',
  borderRadius: theme.radii.control,
}));

export const CtaSecondary = styled(AppLink)(({ theme }) => ({
  ...theme.typography.button,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: theme.spacing(2.5),
  border: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  color: theme.vars.palette.primary.main,
  textDecoration: 'none',
  borderRadius: theme.radii.control,
}));
