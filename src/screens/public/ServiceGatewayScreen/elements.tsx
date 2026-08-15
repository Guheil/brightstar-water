import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import AppLink from '@/components/ui/AppLink';
import PageContainer from '@/components/layout/PageContainer';

export const Root = styled(Box)(({ theme }) => ({
  minHeight: '100svh',
  backgroundColor: theme.vars.palette.primary.main,
}));

export const IntroBand = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(18),
  paddingBottom: theme.spacing(6),
  color: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(15),
    paddingBottom: theme.spacing(4),
  },
}));

export const IntroContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(18rem, 0.55fr)',
  gap: theme.spacing(5),
  alignItems: 'end',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.display,
  maxWidth: theme.spacing(82),
  margin: 0,
  color: 'inherit',
}));

export const IntroText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(58),
  margin: 0,
  color: 'inherit',
  opacity: 0.82,
}));

export const ChoiceBand = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(4),
  backgroundColor: theme.vars.palette.primary.main,
}));

export const ChoiceGrid = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ChoiceLink = styled(AppLink, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<{ $tone: 'gas' | 'water' }>(({ theme }) => ({
  position: 'relative',
  minWidth: 0,
  minHeight: theme.spacing(62),
  display: 'grid',
  alignContent: 'end',
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  color: theme.vars.palette.primary.contrastText,
  textDecoration: 'none',
  isolation: 'isolate',

  '&:hover img, &:focus-visible img': {
    transform: 'scale(1.035)',
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(48),
  },
}));

export const ChoiceImage = styled(Image)(({ theme }) => ({
  objectFit: 'cover',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.complex,
    easing: theme.transitions.easing.easeOut,
  }),
}));

export const ChoiceOverlay = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<{ $tone: 'gas' | 'water' }>(({ theme, $tone }) => ({
  position: 'absolute',
  inset: 0,
  zIndex: 1,
  backgroundColor:
    $tone === 'gas' ? theme.vars.palette.gas.dark : theme.vars.palette.water.dark,
  opacity: 0.68,
}));

export const ChoiceContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  display: 'grid',
  alignContent: 'end',
  minHeight: '100%',
  padding: theme.spacing(6),

  '&::after': {
    position: 'absolute',
    top: theme.spacing(5),
    right: theme.spacing(5),
    width: theme.spacing(8),
    height: theme.spacing(8),
    border: `${theme.spacing(0.25)} solid currentColor`,
    borderRadius: '50%',
    content: '"→"',
    display: 'grid',
    placeItems: 'center',
    fontSize: theme.typography.h3.fontSize,
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 3),

    '&::after': {
      top: theme.spacing(3),
      right: theme.spacing(3),
      width: theme.spacing(6),
      height: theme.spacing(6),
    },
  },
}));

export const ChoiceName = styled('h2')(({ theme }) => ({
  ...theme.typography.h1,
  maxWidth: theme.spacing(54),
  margin: 0,
  color: 'inherit',
}));

export const ChoiceDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(58),
  marginTop: theme.spacing(1.5),
  color: 'inherit',
  opacity: 0.9,
}));

export const ChoiceAction = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle1,
  marginTop: theme.spacing(3),
  color: 'inherit',
}));
