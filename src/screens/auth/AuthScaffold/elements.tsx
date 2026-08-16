import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100dvh',
  overflow: 'hidden',
  backgroundColor: theme.vars.palette.background.paper,
}));

export const ContentFrame = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100dvh',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto minmax(0, 22vh) minmax(0, 1fr)',
  },
}));

export const SkipLink = styled('a')(({ theme }) => ({
  position: 'fixed',
  insetBlockStart: theme.spacing(1),
  insetInlineStart: theme.spacing(1),
  zIndex: theme.zIndex.tooltip,
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.background.paper,
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  transform: 'translateY(-160%)',

  '&:focus': {
    transform: 'translateY(0)',
  },
}));

export const MobileHeader = styled(Box)(({ theme }) => ({
  display: 'none',
  width: '100%',
  backgroundColor: theme.vars.palette.background.paper,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

export const MobileHeaderInner = styled(Box)(({ theme }) => ({
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: theme.layout.maxContentWidth,
  minHeight: theme.spacing(8),
  display: 'flex',
  alignItems: 'center',
  marginInline: 'auto',
  paddingInline: theme.layout.tabletGutter,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(7.5),
    paddingInline: theme.layout.mobileGutter,
  },
}));

export const MediaPane = styled('aside')(({ theme }) => ({
  position: 'relative',
  minWidth: 0,
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
  backgroundColor: theme.vars.palette.primary.main,

  [theme.breakpoints.down('md')]: {
    minHeight: 0,
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: 0,
  },
}));

export const MediaGrid = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'minmax(0, 1.08fr) minmax(0, 0.92fr)',
  },
}));

export const MediaCell = styled(Box)({
  position: 'relative',
  minWidth: 0,
  overflow: 'hidden',
});

export const MediaImage = styled(Image)(({ theme }) => ({
  objectFit: 'cover',

  [theme.breakpoints.down('sm')]: {
    objectPosition: 'center',
  },
}));

export const MediaBrandRail = styled(Box)(({ theme }) => ({
  position: 'absolute',
  insetInlineEnd: 0,
  insetBlockEnd: 0,
  width: '100%',
  maxWidth: theme.layout.maxContentWidth / 2,

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const MediaBrand = styled(Box)(({ theme }) => ({
  width: '78%',
  padding: theme.spacing(4),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('lg')]: {
    width: '82%',
    padding: theme.spacing(3.5),
  },
}));

export const MediaBrandTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.h3,
  maxWidth: theme.spacing(60),
  color: 'inherit',
}));

export const MediaBrandText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(62),
  marginTop: theme.spacing(1),
  color: 'inherit',
  opacity: 0.82,
}));

export const FormPane = styled('main')(({ theme }) => ({
  minWidth: 0,
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
  backgroundColor: theme.vars.palette.background.paper,
  borderInlineStartWidth: theme.spacing(0.125),
  borderInlineStartStyle: 'solid',
  borderInlineStartColor: theme.vars.palette.divider,

  [theme.breakpoints.down('md')]: {
    borderInlineStartWidth: 0,
  },
}));

export const FormPaneInner = styled(Box)(({ theme }) => ({
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: theme.layout.maxContentWidth / 2,
  height: '100%',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  marginInlineEnd: 'auto',
  padding: theme.spacing(4, 5),

  [theme.breakpoints.down('lg')]: {
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('md')]: {
    maxWidth: theme.layout.maxContentWidth,
    height: '100%',
    minHeight: 0,
    marginInline: 'auto',
    padding: theme.spacing(1, 0, 5),
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0, 0, 4),
    paddingInline: theme.layout.mobileGutter,
  },
}));

export const BrandLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignSelf: 'flex-start',
  minHeight: theme.spacing(5.5),
  alignItems: 'center',
  gap: theme.spacing(1.25),
  color: theme.vars.palette.primary.main,
  textDecoration: 'none',
}));

export const DesktopBrandLink = styled(BrandLink)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const BrandName = styled('span')(({ theme }) => ({
  ...theme.typography.subtitle1,
  fontWeight: theme.typography.fontWeightBold,
}));

export const BrandLockup = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  flexWrap: 'wrap',

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
  },
}));

export const BrandLogoFrame = styled('span')(({ theme }) => ({
  position: 'relative',
  display: 'block',
  width: theme.spacing(18),
  height: theme.spacing(5.75),
  backgroundColor: 'transparent',

  [theme.breakpoints.down('sm')]: {
    width: theme.spacing(14),
    height: theme.spacing(4.5),
  },
}));

export const BrandLogoImage = styled(Image)({
  backgroundColor: 'transparent',
  objectFit: 'contain',
  objectPosition: 'left center',
});

export const FormRegion = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: theme.spacing(58),
  marginBlock: 'auto',
  marginInline: 'auto',
  paddingBlock: theme.spacing(6),
  overflowY: 'auto',
  overscrollBehavior: 'contain',

  [theme.breakpoints.down('md')]: {
    maxWidth: theme.spacing(64),
    height: '100%',
    marginBlock: 0,
    paddingBlock: theme.spacing(4, 1),
  },

  [theme.breakpoints.down('sm')]: {
    maxWidth: 'none',
    paddingBlock: theme.spacing(4, 0),
  },
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.h3,
  },
}));

export const Description = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(56),
  marginBlock: theme.spacing(1.5, 4),
  color: theme.vars.palette.text.secondary,

  [theme.breakpoints.down('sm')]: {
    marginBlockEnd: theme.spacing(3),
  },
}));
