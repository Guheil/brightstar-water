import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import AppLink from '@/components/ui/AppLink';
import PageContainer from '@/components/layout/PageContainer';

export const Root = styled(Box)(({ theme }) => ({
  paddingBlock: theme.spacing(5, 11),
  backgroundColor: theme.vars.palette.background.default,
}));

export const Container = styled(PageContainer)({});

export const BackLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: theme.spacing(5.5),
  marginBottom: theme.spacing(3),
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const DetailGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.12fr) minmax(20rem, 0.88fr)',
  gap: theme.spacing(7),
  alignItems: 'start',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(4),
  },
}));

export const ProductMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '1 / 1',
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.neutral.light,
}));

export const ProductImage = styled(Image)({
  objectFit: 'cover',
});

export const ProductCopy = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(2),
}));

export const Category = styled(Typography, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<{ $tone: 'gas' | 'water' }>(({ theme, $tone }) => ({
  ...theme.typography.subtitle2,
  color:
    $tone === 'gas'
      ? theme.vars.palette.gas.dark
      : theme.vars.palette.water.dark,
  textTransform: 'uppercase',
  letterSpacing: theme.spacing(0.06),
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const Price = styled(Typography)(({ theme }) => ({
  ...theme.typography.h3,
  color: theme.vars.palette.text.primary,
  fontVariantNumeric: 'tabular-nums',
}));

export const Availability = styled(Typography, {
  shouldForwardProp: (prop) => prop !== '$available',
})<{ $available: boolean }>(({ theme, $available }) => ({
  ...theme.typography.body2,
  color: $available
    ? theme.vars.palette.success.dark
    : theme.vars.palette.error.main,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const Description = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(60),
  color: theme.vars.palette.text.secondary,
}));

export const Divider = styled('hr')(({ theme }) => ({
  width: '100%',
  height: theme.spacing(0.125),
  marginBlock: theme.spacing(1),
  border: 0,
  backgroundColor: theme.vars.palette.divider,
}));

export const QuantityLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.vars.palette.text.primary,
}));

export const PurchaseRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  gap: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
}));

export const AddButton = styled(Button)(({ theme }) => ({
  flex: 1,
  minHeight: theme.spacing(6),
}));


export const DeliveryNote = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  width: '100%',
  marginTop: theme.spacing(2),
  paddingBlock: theme.spacing(2),
  borderBlock: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const DeliveryTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.vars.palette.text.primary,
}));

export const DeliveryText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const DeliveryLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const MissingPanel = styled(Box)(({ theme }) => ({
  paddingBlock: theme.spacing(9),
}));
