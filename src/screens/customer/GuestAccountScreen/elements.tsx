import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import { PageContainer } from '@/components';

export const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.default,
  color: theme.vars.palette.text.primary,
}));

export const Hero = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(7, 9),

  [theme.breakpoints.down('md')]: {
    paddingBlock: theme.spacing(5, 7),
  },
}));

export const HeroContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.92fr) minmax(0, 1.08fr)',
  gap: theme.spacing(8),
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(5),
  },
}));

export const HeroCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.5),
  maxWidth: theme.spacing(76),
}));

export const HeroTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.display,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const HeroText = styled('p')(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(68),
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const MediaStage = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(66),

  [theme.breakpoints.down('md')]: {
    minHeight: theme.spacing(54),
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(42),
  },
}));

export const MainMedia = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: theme.spacing(0, 7, 6, 0),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,

  [theme.breakpoints.down('sm')]: {
    inset: theme.spacing(0, 3, 5, 0),
  },
}));

export const SecondaryMedia = styled(Box)(({ theme }) => ({
  position: 'absolute',
  right: 0,
  bottom: 0,
  width: '44%',
  height: '43%',
  overflow: 'hidden',
  border: `${theme.spacing(0.75)} solid ${theme.vars.palette.background.default}`,
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.gas.light,

  [theme.breakpoints.down('sm')]: {
    width: '48%',
    height: '39%',
  },
}));

export const ServiceImage = styled(Image)({
  objectFit: 'cover',
});

export const BenefitsSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(9),
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(7),
  },
}));

export const BenefitsContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.72fr) minmax(0, 1.28fr)',
  gap: theme.spacing(8),
  alignItems: 'start',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(4),
  },
}));

export const SectionIntro = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  maxWidth: theme.spacing(62),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const SectionText = styled('p')(({ theme }) => ({
  ...theme.typography.body1,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const BenefitList = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  borderTop: `1px solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const BenefitItem = styled('article')(({ theme }) => ({
  minHeight: theme.spacing(18),
  display: 'grid',
  alignContent: 'start',
  gap: theme.spacing(1),
  padding: theme.spacing(3, 3, 3, 0),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,

  '&:nth-of-type(odd)': {
    paddingInlineEnd: theme.spacing(4),
    borderInlineEnd: `1px solid ${theme.vars.palette.divider}`,
  },

  '&:nth-of-type(even)': {
    paddingInlineStart: theme.spacing(4),
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: 'auto',
    padding: theme.spacing(2.5, 0),
    borderInlineEnd: '0 !important',
  },
}));

export const BenefitTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const BenefitDescription = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const JourneySection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(9),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(7),
  },
}));

export const JourneyContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(6),
}));

export const JourneyIntro = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1.2fr)',
  gap: theme.spacing(6),
  alignItems: 'end',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));

export const JourneyTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: 'inherit',
}));

export const JourneyText = styled('p')(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(72),
  margin: 0,
  color: 'inherit',
  opacity: 0.8,
}));

export const JourneyList = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  borderTop: `1px solid ${theme.vars.palette.primary.contrastText}`,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const JourneyItem = styled('article')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  padding: theme.spacing(3, 3, 3, 0),
  borderBottom: `1px solid ${theme.vars.palette.primary.contrastText}`,
  borderColor: theme.vars.palette.divider,

  [theme.breakpoints.up('sm')]: {
    '&:not(:last-of-type)': {
      borderInlineEnd: `1px solid ${theme.vars.palette.divider}`,
    },
  },

  [theme.breakpoints.down('sm')]: {
    paddingInline: 0,
  },
}));

export const JourneyStepTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: 'inherit',
}));

export const JourneyStepText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: 'inherit',
  opacity: 0.76,
}));

export const ConnectedSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(9),

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(7),
  },
}));

export const ConnectedContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(20rem, 0.82fr)',
  gap: theme.spacing(8),
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(5),
  },
}));

export const ConnectedCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  maxWidth: theme.spacing(70),
}));

export const StorefrontList = styled('div')(({ theme }) => ({
  display: 'grid',
  marginTop: theme.spacing(2),
  borderTop: `1px solid ${theme.vars.palette.divider}`,
}));

export const StorefrontRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(9rem, 0.4fr) minmax(0, 0.6fr)',
  gap: theme.spacing(3),
  paddingBlock: theme.spacing(2.5),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const StorefrontName = styled('strong')(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.vars.palette.text.primary,
}));

export const StorefrontDescription = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ConnectedMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(54),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(38),
  },
}));

export const ClosingSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(9, 10),
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(7, 8),
  },
}));

export const ClosingContainer = styled(PageContainer)({
  display: 'grid',
});

export const ClosingCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  maxWidth: theme.spacing(72),
}));

export const ClosingTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const ClosingText = styled('p')(({ theme }) => ({
  ...theme.typography.body1,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));
