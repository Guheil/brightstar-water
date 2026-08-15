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
  backgroundColor: theme.vars.palette.background.default,

  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(13),
    paddingBottom: theme.spacing(6),
  },
}));

export const HeroContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.16fr) minmax(0, 0.84fr)',
  gap: theme.spacing(7),
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(5),
  },
}));

export const HeroMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '70svh',
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,

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

export const HeroCopy = styled(Box)({});

export const HeroTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.display,
  maxWidth: theme.spacing(76),
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const HeroText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(64),
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
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
  backgroundColor: theme.vars.palette.water.main,
  color: theme.vars.palette.water.contrastText,
  textDecoration: 'none',
  borderRadius: theme.radii.control,
}));

export const SecondaryAction = styled(AppLink)(({ theme }) => ({
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

export const ServiceFacts = styled('dl')(({ theme }) => ({
  margin: theme.spacing(5, 0, 0),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.water.main}`,
}));

export const ServiceFact = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const ServiceFactTerm = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ServiceFactValue = styled('dd')(({ theme }) => ({
  ...theme.typography.subtitle2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const ProductsSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10, 12),
  backgroundColor: theme.vars.palette.background.paper,
}));

export const ProductsContainer = styled(PageContainer)({});

export const SectionHeading = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1fr)',
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

export const SectionText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(70),
  color: theme.vars.palette.text.secondary,
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
  backgroundColor: theme.vars.palette.water.light,
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
  color: theme.vars.palette.water.dark,
  fontVariantNumeric: 'tabular-nums',
}));

export const ShopLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.subtitle1,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: theme.spacing(4),
  color: theme.vars.palette.water.dark,
}));

export const ProcessSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
}));

export const ProcessContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.04fr) minmax(22rem, 0.96fr)',
  gap: theme.spacing(6),
  alignItems: 'stretch',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ProcessMainMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(72),
  height: '100%',
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,

  [theme.breakpoints.down('md')]: {
    height: 'auto',
    minHeight: theme.spacing(56),
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(44),
  },
}));

export const ProcessImage = styled(Image)({
  objectFit: 'cover',
});

export const ProcessCopy = styled(Box)(({ theme }) => ({
  minWidth: 0,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',

  [theme.breakpoints.down('md')]: {
    height: 'auto',
  },
}));

export const ProcessTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const ProcessText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

export const ProcessDetails = styled(Box)(({ theme }) => ({
  display: 'grid',
  marginTop: theme.spacing(3),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.water.main}`,
}));

export const ProcessDetail = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(10rem, 0.38fr) minmax(0, 0.62fr)',
  gap: theme.spacing(2),
  alignItems: 'start',
  paddingBlock: theme.spacing(2),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const ProcessDetailTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const ProcessDetailText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ProcessSecondaryMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(34),
  marginTop: theme.spacing(4),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,

  [theme.breakpoints.down('md')]: {
    minHeight: theme.spacing(36),
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(30),
  },
}));

export const RoutineSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
  backgroundColor: theme.vars.palette.background.paper,
}));

export const RoutineContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(18rem, 0.82fr) minmax(0, 1.18fr)',
  gap: theme.spacing(7),
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const RoutineCopy = styled(Box)({});

export const RoutineTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const RoutineText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(68),
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

export const RoutineMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(60),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(40),
  },
}));

export const RoutineImage = styled(Image)({
  objectFit: 'cover',
});

export const DeliverySection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
}));

export const DeliveryContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.1fr) minmax(18rem, 0.9fr)',
  gap: theme.spacing(7),
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const DeliveryMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(62),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(42),
  },
}));

export const DeliveryImage = styled(Image)({
  objectFit: 'cover',
});

export const DeliveryCopy = styled(Box)({});

export const DeliveryTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const DeliveryText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

export const DeliveryList = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  marginTop: theme.spacing(4),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.water.main}`,
}));

export const DeliveryPoint = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(10rem, 0.42fr) minmax(0, 0.58fr)',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(2),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const DeliveryPointTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const DeliveryPointText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const DeliveryLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.subtitle1,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: theme.spacing(3),
  color: theme.vars.palette.water.dark,
}));

export const InfoSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  [`& ${ProductsContainer}`]: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.78fr) minmax(0, 1.22fr)',
    gap: theme.spacing(8),
    alignItems: 'start',
  },

  [theme.breakpoints.down('md')]: {
    [`& ${ProductsContainer}`]: {
      gridTemplateColumns: '1fr',
      gap: theme.spacing(5),
    },
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
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.water.main}`,

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

export const AccountSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
  backgroundColor: theme.vars.palette.background.paper,
}));

export const AccountContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(18rem, 0.88fr) minmax(0, 1.12fr)',
  gap: theme.spacing(7),
  alignItems: 'center',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const AccountCopy = styled(Box)({});

export const AccountTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const AccountText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

export const AccountMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(60),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(40),
  },
}));

export const AccountImage = styled(Image)({
  objectFit: 'cover',
});

export const LoyaltySection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(10),
}));

export const LoyaltyContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.72fr) minmax(0, 1.28fr)',
  gap: theme.spacing(8),
  alignItems: 'start',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(5),
  },
}));

export const LoyaltyTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const LoyaltyText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));

export const LoyaltyGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(4),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
  },
}));

export const LoyaltyItem = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.water.main}`,
}));

export const LoyaltyItemTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const LoyaltyItemText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
}));

export const ClosingSection = styled('section')(({ theme }) => ({
  paddingBlock: theme.spacing(12, 14),
  backgroundColor: theme.vars.palette.water.dark,
}));

export const ClosingStage = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
  alignItems: 'center',
  minHeight: theme.spacing(78),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    minHeight: 'auto',
  },
}));

export const ClosingMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  gridColumn: '1 / 10',
  gridRow: '1',
  minHeight: theme.spacing(78),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.light,
  boxShadow: theme.shadows[8],

  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    border: `${theme.spacing(0.125)} solid ${theme.vars.palette.water.light}`,
    borderRadius: 'inherit',
    pointerEvents: 'none',
  },

  [theme.breakpoints.down('md')]: {
    gridColumn: '1',
    minHeight: theme.spacing(58),
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(44),
  },
}));

export const ClosingImage = styled(Image)({
  objectFit: 'cover',
  objectPosition: 'center',
});

export const ClosingPanel = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  gridColumn: '7 / -1',
  gridRow: '1',
  alignSelf: 'center',
  marginBlock: theme.spacing(6),
  padding: theme.spacing(5),
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.water.main,
  color: theme.vars.palette.water.contrastText,
  boxShadow: theme.shadows[16],

  [theme.breakpoints.down('md')]: {
    gridColumn: '1',
    gridRow: '2',
    width: 'auto',
    margin: theme.spacing(-8, 3, 0, 6),
  },

  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(-5, 1.5, 0),
    padding: theme.spacing(3.5, 3),
  },
}));

export const ClosingTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h1,
  maxWidth: theme.spacing(60),
  margin: 0,
  color: 'inherit',

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.h2,
  },
}));

export const ClosingText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(62),
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
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
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
    outline: `${theme.spacing(0.25)} solid ${theme.vars.palette.water.light}`,
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
  color: theme.vars.palette.water.contrastText,
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
  maxWidth: theme.spacing(32),
  color: theme.vars.palette.water.contrastText,
  opacity: 0.7,
}));

export const ClosingFacts = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(3),
  marginTop: theme.spacing(5),
  paddingTop: theme.spacing(3),
  borderTop: `${theme.spacing(0.125)} solid ${theme.vars.palette.water.light}`,

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
  color: theme.vars.palette.water.contrastText,
  opacity: 0.68,
}));

export const ClosingFactValue = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.vars.palette.water.contrastText,
}));

