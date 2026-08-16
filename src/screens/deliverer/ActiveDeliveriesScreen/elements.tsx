import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

interface ToneProps {
  $tone: 'gas' | 'water' | 'mixed';
}

export const Root = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3.5),
}));

export const IntroGrid = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(3),
  alignItems: 'end',
  paddingBottom: theme.spacing(2.5),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const IntroTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const Intro = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(72),
  marginTop: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
}));

export const Collection = styled(Box)(({ theme }) => ({
  textAlign: 'right',

  [theme.breakpoints.down('sm')]: {
    textAlign: 'left',
  },
}));

export const CollectionValue = styled('strong')(({ theme }) => ({
  ...theme.typography.h3,
  display: 'block',
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));

export const CollectionLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Queue = styled('ol')(({ theme }) => ({
  margin: 0,
  padding: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  listStyle: 'none',
}));

export const QueueItem = styled('li')({
  margin: 0,
});

export const DeliveryLink = styled(AppLink, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<ToneProps>(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(8rem, 0.58fr) minmax(0, 1.42fr) minmax(9rem, 0.7fr) auto',
  alignItems: 'center',
  gap: theme.spacing(2.5),
  minHeight: theme.spacing(11),
  paddingBlock: theme.spacing(2),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  color: theme.vars.palette.text.primary,
  textDecoration: 'none',
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shorter,
  }),

  '&:hover, &:focus-visible': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: theme.spacing(1.2, 1.5),
    minHeight: 0,
    paddingBlock: theme.spacing(2.25),
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

export const TimeBlock = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    gridColumn: '1',
  },
}));

export const Time = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightBold,
  fontVariantNumeric: 'tabular-nums',
}));

export const Primary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const Secondary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Address = styled(Box)(({ theme }) => ({
  minWidth: 0,

  [theme.breakpoints.down('sm')]: {
    gridColumn: '1 / -1',
  },
}));

export const Payment = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),

  [theme.breakpoints.down('sm')]: {
    gridColumn: '1',
  },
}));

export const Arrow = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  color: theme.vars.palette.text.secondary,

  [theme.breakpoints.down('sm')]: {
    gridColumn: '2',
    gridRow: '1',
  },
}));
