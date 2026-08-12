import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(22rem, 0.86fr) minmax(0, 1.14fr)',
  minHeight: '100dvh',
  backgroundColor: theme.vars.palette.background.default,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
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

export const FormPane = styled('main')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  padding: theme.spacing(4),

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

export const BrandLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignSelf: 'flex-start',
  minHeight: theme.spacing(5.5),
  alignItems: 'center',
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightBold,
}));

export const FormRegion = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: theme.spacing(58),
  marginBlock: 'auto',
  marginInline: 'auto',
  paddingBlock: theme.spacing(6),
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const Description = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  marginBlock: theme.spacing(1.5, 3),
  color: theme.vars.palette.text.secondary,
}));

export const MediaPane = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(70),
  overflow: 'hidden',
  backgroundColor: theme.vars.palette.neutral.light,

  [theme.breakpoints.down('md')]: {
    order: -1,
    minHeight: theme.spacing(30),
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(22),
  },
}));

export const MediaImage = styled(Image)({
  objectFit: 'cover',
});

export const MediaCaption = styled(Box)(({ theme }) => ({
  position: 'absolute',
  insetInline: theme.spacing(4),
  insetBlockEnd: theme.spacing(4),
  maxWidth: theme.spacing(58),
  padding: theme.spacing(3),
  borderRadius: theme.radii.surface,
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('sm')]: {
    insetInline: theme.spacing(2),
    insetBlockEnd: theme.spacing(2),
    padding: theme.spacing(2),
  },
}));

export const MediaTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.h4,
  color: 'inherit',
}));

export const MediaText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(0.75),
  color: 'inherit',
  opacity: 0.84,
}));
