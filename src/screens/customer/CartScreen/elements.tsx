import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { AppLink, PageContainer } from '@/components';
import type { CategoryVisualProps } from './interface';

export const CartPage = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(7, 10),
  [theme.breakpoints.down('sm')]: { paddingBlock: theme.spacing(5, 8) },
}));

export const Header = styled('header')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  maxWidth: '48rem',
  marginBottom: theme.spacing(6),
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  margin: 0,
}));

export const Lead = styled('p')(({ theme }) => ({
  ...theme.typography.bodyLarge,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const CartLayout = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(18rem, 0.6fr)',
  gap: theme.spacing(6),
  alignItems: 'start',
  [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
}));

export const CartList = styled('section')(({ theme }) => ({
  display: 'grid',
  borderTop: `1px solid ${theme.vars.palette.divider}`,
}));

export const CartRow = styled('article')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '4.5rem minmax(0, 1fr) auto',
  gap: theme.spacing(2.5),
  alignItems: 'center',
  paddingBlock: theme.spacing(3),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '3.5rem minmax(0, 1fr)',
    alignItems: 'start',
  },
}));

export const CategoryVisual = styled('div', {
  shouldForwardProp: (prop) => prop !== '$category',
})<CategoryVisualProps>(({ theme, $category }) => ({
  width: '100%',
  aspectRatio: '1',
  display: 'grid',
  placeItems: 'center',
  borderRadius: theme.radii.media,
  backgroundColor:
    $category === 'gas'
      ? theme.vars.palette.gas.light
      : theme.vars.palette.water.light,
  color:
    $category === 'gas'
      ? theme.vars.palette.gas.dark
      : theme.vars.palette.water.dark,

  '& svg': { width: 24, height: 24 },
}));

export const ProductInfo = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
  minWidth: 0,
}));

export const ProductName = styled('h2')(({ theme }) => ({
  ...theme.typography.subtitle1,
  margin: 0,
}));

export const ProductMeta = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const LinePrice = styled('strong')(({ theme }) => ({
  ...theme.typography.subtitle1,
  justifySelf: 'end',

  [theme.breakpoints.down('sm')]: {
    gridColumn: '2',
    justifySelf: 'start',
  },
}));

export const RowActions = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
  flexWrap: 'wrap',
}));

export const RemoveButton = styled(Button)(({ theme }) => ({
  minHeight: 44,
  color: theme.vars.palette.error.main,
}));

export const SummaryPanel = styled('aside')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,
  position: 'sticky',
  top: theme.spacing(3),

  [theme.breakpoints.down('md')]: { position: 'static' },
}));

export const SummaryTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h3,
  margin: 0,
}));

export const SummaryList = styled('dl')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  margin: 0,
}));

export const SummaryRow = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  ...theme.typography.body2,

  '& dt': { color: theme.vars.palette.text.secondary },
  '& dd': { margin: 0, fontWeight: theme.typography.fontWeightSemiBold },
}));

export const SummaryTotal = styled(SummaryRow)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.vars.palette.divider}`,
  ...theme.typography.subtitle1,
}));

export const CheckoutLink = styled(AppLink)(({ theme }) => ({
  minHeight: 48,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.25, 2),
  borderRadius: theme.radii.control,
  color: theme.vars.palette.primary.contrastText,
  backgroundColor: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  '&:hover': { backgroundColor: theme.vars.palette.primary.dark },
  '&:focus-visible': { outline: `3px solid ${theme.vars.palette.action.focus}` },
}));

export const ContinueLink = styled(AppLink)(({ theme }) => ({
  color: theme.vars.palette.water.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textAlign: 'center',
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
}));

export const FeeNote = styled('p')(({ theme }) => ({
  ...theme.typography.caption,
  margin: 0,
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.vars.palette.divider}`,
  color: theme.vars.palette.text.secondary,
}));

