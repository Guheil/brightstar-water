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
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(8),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(13),
    paddingBottom: theme.spacing(6),
  },
}));

export const HeroContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.78fr) minmax(0, 1.22fr)',
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
  maxWidth: theme.spacing(76),
  margin: 0,
  color: 'inherit',
}));

export const HeroText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(66),
  marginTop: theme.spacing(2),
  color: 'inherit',
  opacity: 0.84,
}));

export const HeroActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(4),
}));

export const PrimaryAction = styled(AppLink)(({ theme }) => ({
  ...theme.typography.button,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: theme.spacing(2.5),
  backgroundColor: theme.vars.palette.gas.main,
  color: theme.vars.palette.gas.contrastText,
  textDecoration: 'none',
  borderRadius: theme.radii.control,
}));

export const SecondaryAction = styled(AppLink)(({ theme }) => ({
  ...theme.typography.button,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: theme.spacing(2.5),
  border: `${theme.spacing(0.125)} solid currentColor`,
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: theme.radii.control,
}));

export const HeroMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '68svh',
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.gas.dark,

  [theme.breakpoints.down('md')]: {
    minHeight: theme.spacing(58),
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(45),
  },
}));

export const HeroImage = styled(Image)({
  objectFit: 'cover',
});

export const ServiceLedger = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(5),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.gas.main}`,
}));

export const LedgerTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: theme.spacing(2, 0, 0),
  color: 'inherit',
}));

export const LedgerList = styled('dl')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.25),
  margin: theme.spacing(2, 0, 0),
}));

export const LedgerRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(2),
  paddingBottom: theme.spacing(1.25),
  borderBottom: `${theme.spacing(0.125)} solid currentColor`,
}));

export const LedgerTerm = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  opacity: 0.72,
}));

export const LedgerValue = styled('dd')(({ theme }) => ({
  ...theme.typography.subtitle2,
  margin: 0,
  textAlign: 'right',
}));

export const ProductsSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
}));

export const ProductsContainer = styled(PageContainer)({});

export const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(3),
  alignItems: 'end',
  marginBottom: theme.spacing(5),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const SectionText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(70),
  marginTop: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
}));

export const ViewAllLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.subtitle2,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  color: theme.vars.palette.gas.dark,
}));

export const ProductGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(4, 3),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ProductItem = styled(AppLink)(({ theme }) => ({
  minWidth: 0,
  display: 'block',
  color: theme.vars.palette.text.primary,
  textDecoration: 'none',

  '&:hover img, &:focus-visible img': {
    transform: 'scale(1.025)',
  },
}));

export const ProductMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '4 / 3',
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.neutral.light,
}));

export const ProductImage = styled(Image)(({ theme }) => ({
  objectFit: 'cover',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.standard,
  }),
}));

export const ProductCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.75),
  paddingTop: theme.spacing(2),
}));

export const ProductName = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: 'inherit',
}));

export const ProductDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ProductPrice = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  marginTop: theme.spacing(0.5),
  color: theme.vars.palette.gas.dark,
  fontVariantNumeric: 'tabular-nums',
}));

export const StorySection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
  backgroundColor: theme.vars.palette.background.paper,
}));

export const StoryContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.15fr) minmax(18rem, 0.85fr)',
  gap: theme.spacing(7),
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const StoryMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(62),
  overflow: 'hidden',
  borderRadius: theme.radii.media,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(42),
  },
}));

export const StoryImage = styled(Image)({
  objectFit: 'cover',
});

export const StoryCopy = styled(Box)({});

export const StoryTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const StoryText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(62),
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

interface FeatureSectionProps {
  $surface?: 'default' | 'paper';
}

export const FeatureSection = styled('section', {
  shouldForwardProp: (prop) => prop !== '$surface',
})<FeatureSectionProps>(({ theme, $surface = 'default' }) => ({
  paddingBlock: theme.spacing(10),
  backgroundColor:
    $surface === 'paper'
      ? theme.vars.palette.background.paper
      : theme.vars.palette.background.default,
}));

interface FeatureContainerProps {
  $reverse?: boolean;
}

export const FeatureContainer = styled(PageContainer, {
  shouldForwardProp: (prop) => prop !== '$reverse',
})<FeatureContainerProps>(({ theme, $reverse }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.92fr) minmax(0, 1.08fr)',
  gridTemplateAreas: $reverse ? '"media copy"' : '"copy media"',
  gap: theme.spacing(7),
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gridTemplateAreas: '"media" "copy"',
    gap: theme.spacing(5),
  },
}));

export const FeatureCopy = styled(Box)({
  gridArea: 'copy',
});

export const FeatureMedia = styled(Box)(({ theme }) => ({
  gridArea: 'media',
  position: 'relative',
  minHeight: theme.spacing(60),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.neutral.light,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(40),
  },
}));

export const FeatureImage = styled(Image)({
  objectFit: 'cover',
});

export const FeatureTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  maxWidth: theme.spacing(70),
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const FeatureText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(68),
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

export const FeatureList = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.gas.main}`,
}));

export const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
  paddingBlock: theme.spacing(2),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const FeatureItemTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const FeatureItemText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(66),
  color: theme.vars.palette.text.secondary,
}));

export const FeatureLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.subtitle1,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: theme.spacing(3),
  color: theme.vars.palette.gas.dark,
}));

interface InfoSectionProps {
  $light?: boolean;
}

export const InfoSection = styled('section', {
  shouldForwardProp: (prop) => prop !== '$light',
})<InfoSectionProps>(({ theme, $light }) => ({
  paddingBlock: theme.spacing(10),
  backgroundColor: $light
    ? theme.vars.palette.background.paper
    : theme.vars.palette.primary.main,
  color: $light
    ? theme.vars.palette.text.primary
    : theme.vars.palette.primary.contrastText,
}));

export const InfoContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.78fr) minmax(0, 1.22fr)',
  gap: theme.spacing(8),
  alignItems: 'start',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(5),
  },
}));

export const InfoTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: 'inherit',
}));

export const InfoText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(66),
  marginTop: theme.spacing(2),
  color: 'inherit',
  opacity: 0.78,
}));

export const InfoGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
}));

export const InfoItem = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(11rem, 0.42fr) minmax(0, 0.58fr)',
  gap: theme.spacing(3),
  paddingTop: theme.spacing(2),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.gas.main}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1),
  },
}));

export const InfoItemTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: 'inherit',
}));

export const InfoItemText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: 'inherit',
  opacity: 0.78,
}));

export const ClosingSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(12, 14),
  backgroundColor: theme.vars.palette.primary.main,
}));

export const ClosingStage = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(20rem, 0.92fr) minmax(0, 1.08fr)',
  alignItems: 'stretch',
  minHeight: theme.spacing(72),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.gas.main,
  boxShadow: theme.shadows[16],

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    minHeight: 'auto',
  },
}));

export const ClosingPanel = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'grid',
  alignContent: 'center',
  padding: theme.spacing(5),
  backgroundColor: theme.vars.palette.gas.main,
  color: theme.vars.palette.gas.contrastText,

  [theme.breakpoints.down('md')]: {
    order: 2,
    padding: theme.spacing(4),
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3.5, 3),
  },
}));

export const ClosingTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h1,
  maxWidth: theme.spacing(58),
  margin: 0,
  color: 'inherit',

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.h2,
  },
}));

export const ClosingText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(58),
  marginTop: theme.spacing(2.25),
  color: 'inherit',
  opacity: 0.88,
}));

export const ClosingPrimaryArrow = styled('span')(({ theme }) => ({
  ...theme.typography.h4,
  width: theme.spacing(5.5),
  height: theme.spacing(5.5),
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.gas.dark,
  color: theme.vars.palette.gas.contrastText,
  lineHeight: 1,
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.standard,
  }),
}));

export const ClosingPrimary = styled(AppLink)(({ theme }) => ({
  width: '100%',
  minHeight: theme.spacing(8),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4.5),
  padding: theme.spacing(1, 1, 1, 2.5),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.background.paper,
  color: theme.vars.palette.primary.main,
  textDecoration: 'none',
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.standard,
  }),

  '&:hover': {
    transform: `translateY(${theme.spacing(-0.5)})`,
    boxShadow: theme.shadows[8],
  },

  '&:hover [data-closing-arrow], &:focus-visible [data-closing-arrow]': {
    transform: `translate(${theme.spacing(0.5)}, ${theme.spacing(-0.5)})`,
  },

  '&:focus-visible': {
    outline: `${theme.spacing(0.25)} solid ${theme.vars.palette.gas.light}`,
    outlineOffset: theme.spacing(0.5),
  },
}));

export const ClosingPrimaryLabel = styled('span')(({ theme }) => ({
  ...theme.typography.subtitle1,
  textAlign: 'left',
}));

export const ClosingSubRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5, 3),
  marginTop: theme.spacing(2.5),
}));

export const ClosingSecondary = styled(AppLink)(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.vars.palette.gas.contrastText,
  textDecoration: 'none',
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.short,
  }),

  '&:hover, &:focus-visible': {
    opacity: 0.72,
  },
}));

export const ClosingNote = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(34),
  color: theme.vars.palette.gas.contrastText,
  opacity: 0.72,
}));

export const ClosingFacts = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(5),
  paddingTop: theme.spacing(3),
  borderTop: `${theme.spacing(0.125)} solid ${theme.vars.palette.gas.light}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2.25),
  },
}));

export const ClosingFact = styled(Box)(({ theme }) => ({
  display: 'grid',
  alignContent: 'start',
  gap: theme.spacing(0.75),
}));

export const ClosingFactLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.gas.contrastText,
  opacity: 0.68,
}));

export const ClosingFactValue = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.vars.palette.gas.contrastText,
}));

export const ClosingMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(72),
  overflow: 'hidden',
  clipPath: 'polygon(8% 0, 100% 0, 100% 100%, 0 100%)',
  backgroundColor: theme.vars.palette.gas.light,

  [theme.breakpoints.down('md')]: {
    order: 1,
    minHeight: theme.spacing(56),
    clipPath: 'none',
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(42),
  },
}));

export const ClosingImage = styled(Image)({
  objectFit: 'cover',
  objectPosition: 'center',
});

