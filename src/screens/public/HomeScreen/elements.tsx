import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.default,
  color: theme.vars.palette.text.primary,
}));

export const HeroSection = styled('section')(({ theme }) => ({
  position: 'relative',
  display: 'grid',
  minHeight: '100dvh',
  overflow: 'hidden',
  backgroundColor: theme.vars.palette.primary.main,
}));

export const HeroGrid = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  gridColumn: '1 / -1',
  gridRow: 1,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.46fr) minmax(0, 0.54fr)',
  alignItems: 'stretch',
  width: '100%',
  maxWidth: theme.layout.maxContentWidth,
  minHeight: 'inherit',
  marginInline: 'auto',

  [theme.breakpoints.down('lg')]: {
    gridRow: 1,
    display: 'flex',
    alignItems: 'flex-end',
    maxWidth: 'none',
    minHeight: 'inherit',
  },
}));

export const HeroCopy = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: theme.spacing(2.5),
  maxWidth: theme.spacing(72),
  paddingBlock: theme.spacing(6),
  paddingInlineStart: theme.spacing(12),
  paddingInlineEnd: theme.spacing(4),

  [theme.breakpoints.down('lg')]: {
    maxWidth: theme.spacing(70),
    minHeight: 0,
    paddingBlock: theme.spacing(4),
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(2),
    paddingBlock: theme.spacing(2),
    paddingInline: theme.layout.mobileGutter,
  },
}));

export const HeroTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.display,
  maxWidth: theme.spacing(66),
  margin: 0,
  color: theme.vars.palette.primary.contrastText,
}));

export const HeroDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(52),
  color: theme.vars.palette.primary.contrastText,
}));

export const HeroActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  width: '100%',
  maxWidth: theme.spacing(52),
  paddingTop: theme.spacing(0.5),
}));

export const PrimaryAction = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: theme.spacing(6),
  paddingInline: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.paper,
  color: theme.vars.palette.primary.main,
  borderRadius: theme.radii.control,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  transition: theme.transitions.create('background-color'),

  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  [theme.breakpoints.down('sm')]: {
    width: 'auto',
    paddingInline: theme.spacing(2),
  },
}));

export const DeliveryRuler = styled(AppLink)(({ theme }) => ({
  width: '100%',
  minHeight: theme.spacing(5.5),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  paddingBlock: theme.spacing(0.5),
  color: theme.vars.palette.primary.contrastText,
  textDecoration: 'none',
}));

export const DeliveryRulerLead = styled('span')(({ theme }) => ({
  ...theme.typography.subtitle2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  color: 'inherit',

  '& span': {
    ...theme.typography.caption,
    color: 'inherit',
  },

  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const DeliveryZoneTrack = styled('span')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1.25),
  borderTop: `${theme.spacing(0.125)} solid currentColor`,

  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const DeliveryZone = styled('span')(({ theme }) => ({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(0.5),
  color: 'inherit',

  '&::before': {
    position: 'absolute',
    top: theme.spacing(-1.8125),
    left: 0,
    width: theme.spacing(1),
    height: theme.spacing(1),
    borderRadius: '50%',
    backgroundColor: theme.vars.palette.water.main,
    content: '""',
  },

  '&:first-of-type::before': {
    backgroundColor: theme.vars.palette.gas.main,
  },
}));

export const DeliveryDistance = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  color: 'inherit',
}));

export const DeliveryFee = styled('span')(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: 'inherit',
  fontVariantNumeric: 'tabular-nums',
}));

export const DeliveryRulerCompact = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  display: 'none',
  color: 'inherit',
  fontWeight: theme.typography.fontWeightSemiBold,
  whiteSpace: 'nowrap',

  [theme.breakpoints.down('sm')]: {
    display: 'block',
  },
}));

export const HeroMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  gridColumn: '1 / -1',
  gridRow: 1,
  minHeight: 'inherit',
  overflow: 'hidden',
  backgroundColor: theme.vars.palette.neutral.light,

  '&::after': {
    position: 'absolute',
    inset: 0,
    zIndex: 1,
    backgroundColor: theme.vars.palette.primary.main,
    content: '""',
    opacity: 0.46,
    pointerEvents: 'none',
  },

  [theme.breakpoints.down('lg')]: {
    gridRow: 1,
    minHeight: 'inherit',
  },
}));

export const HeroImage = styled(Image)(({ theme }) => ({
  objectFit: 'cover',
  objectPosition: 'center center',

  [theme.breakpoints.down('lg')]: {
    objectPosition: '62% center',
  },
}));

export const Section = styled('section')(({ theme }) => ({
  maxWidth: theme.layout.maxContentWidth,
  marginInline: 'auto',
  paddingBlock: theme.spacing(11),
  paddingInline: theme.layout.desktopGutter,

  [theme.breakpoints.down('md')]: {
    paddingBlock: theme.spacing(8),
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(7),
    paddingInline: theme.layout.mobileGutter,
  },
}));

export const SectionHeadingRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(5),

  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const SectionIntro = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(63),
  color: theme.vars.palette.text.secondary,
}));

export const TextLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  minHeight: theme.spacing(5.5),
  alignItems: 'center',
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textUnderlineOffset: theme.spacing(0.5),
}));

export const CategoryGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(3),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const CategoryPanel = styled(AppLink, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: 'gas' | 'water' }>(({ theme, tone }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 0.88fr) minmax(0, 1.12fr)',
  minHeight: theme.spacing(38),
  overflow: 'hidden',
  backgroundColor:
    tone === 'gas'
      ? theme.vars.palette.gas.main
      : theme.vars.palette.water.main,
  color:
    tone === 'gas'
      ? theme.vars.palette.gas.contrastText
      : theme.vars.palette.water.contrastText,
  borderRadius: theme.radii.surface,
  textDecoration: 'none',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const CategoryCopy = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: theme.spacing(3),
  padding: theme.spacing(4),
}));

export const CategoryTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h2,
  fontFamily: theme.typography.display.fontFamily,
  margin: 0,
  color: 'inherit',
}));

export const CategoryDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(39),
  color: 'inherit',
}));

export const CategoryCallout = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: 'inherit',
  textDecoration: 'underline',
  textUnderlineOffset: theme.spacing(0.5),
}));

export const CategoryMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(38),
  overflow: 'hidden',

  [theme.breakpoints.down('md')]: {
    minHeight: theme.spacing(32),
  },
}));

export const CategoryImage = styled(Image)({
  objectFit: 'cover',
});

export const ProductsSection = styled('section')(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.paper,
}));

export const ProductsInner = styled(Box)(({ theme }) => ({
  maxWidth: theme.layout.maxContentWidth,
  marginInline: 'auto',
  paddingBlock: theme.spacing(11),
  paddingInline: theme.layout.desktopGutter,

  [theme.breakpoints.down('md')]: {
    paddingBlock: theme.spacing(8),
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(7),
    paddingInline: theme.layout.mobileGutter,
  },
}));

export const ProductLink = styled(AppLink)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  borderRadius: 'inherit',
}));

export const ProductList = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(3),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ProductItem = styled('article')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const ProductMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '1 / 1',
  overflow: 'hidden',
  backgroundColor: theme.vars.palette.background.default,
  borderRadius: theme.radii.media,
}));

export const ProductImage = styled(Image)({
  objectFit: 'cover',
});

export const ProductMeta = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(2),
  alignItems: 'start',
}));

export const ProductName = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const ProductDetail = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ProductPrice = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: 'gas' | 'water' }>(({ theme, tone }) => ({
  ...theme.typography.h6,
  color:
    tone === 'gas'
      ? theme.vars.palette.gas.main
      : theme.vars.palette.water.main,
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
}));

export const DetailsSection = styled('section')(({ theme }) => ({
  backgroundColor: theme.vars.palette.background.default,
}));

export const DetailsInner = styled(ProductsInner)({});

export const DetailList = styled(Box)(({ theme }) => ({
  borderTop: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const DetailRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(11rem, 0.32fr) minmax(0, 0.68fr)',
  gap: theme.spacing(4),
  paddingBlock: theme.spacing(2.5),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.75),
  },
}));

export const DetailTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const DetailText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(78),
  color: theme.vars.palette.text.secondary,
}));

export const DetailLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: theme.spacing(5.5),
  marginTop: theme.spacing(2),
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const ProcessSection = styled('section')(({ theme }) => ({
  backgroundColor: theme.vars.palette.neutral.light,
}));

export const ProcessInner = styled(ProductsInner)({});

export const ProcessGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: theme.spacing(4),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ProcessItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(2),
  borderTop: `${theme.spacing(0.25)} solid ${theme.vars.palette.primary.main}`,
}));

export const ProcessTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const ProcessText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));
