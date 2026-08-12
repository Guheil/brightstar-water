import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { AppLink, PageContainer } from '@/components';
import type { FilterVisualProps } from './interface';

export const OrdersPage = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(7, 10),
  [theme.breakpoints.down('sm')]: { paddingBlock: theme.spacing(5, 8) },
}));

export const Header = styled('header')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(4),
  alignItems: 'end',
  marginBottom: theme.spacing(5),
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
}));

export const HeaderCopy = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  maxWidth: '48rem',
}));

export const Title = styled('h1')(({ theme }) => ({ ...theme.typography.h1, margin: 0 }));
export const Lead = styled('p')(({ theme }) => ({
  ...theme.typography.bodyLarge,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const ShopLink = styled(AppLink)(({ theme }) => ({
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1, 2),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  '&:hover': { backgroundColor: theme.vars.palette.primary.dark },
}));

export const FilterBar = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(4),
  overflowX: 'auto',
  paddingBottom: theme.spacing(0.5),
}));

export const FilterButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== '$active',
})<FilterVisualProps>(({ theme, $active }) => ({
  minHeight: 44,
  flex: '0 0 auto',
  color: $active
    ? theme.vars.palette.primary.contrastText
    : theme.vars.palette.text.primary,
  backgroundColor: $active
    ? theme.vars.palette.primary.main
    : theme.vars.palette.background.paper,
  border: `1px solid ${
    $active ? theme.vars.palette.primary.main : theme.vars.palette.divider
  }`,
  '&:hover': {
    backgroundColor: $active
      ? theme.vars.palette.primary.dark
      : theme.vars.palette.action.hover,
  },
}));

export const OrderList = styled('div')(({ theme }) => ({
  display: 'grid',
  borderTop: `1px solid ${theme.vars.palette.divider}`,
}));

export const OrderRow = styled('article')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(10rem, 0.8fr) minmax(12rem, 1.3fr) auto auto',
  gap: theme.spacing(3),
  alignItems: 'center',
  paddingBlock: theme.spacing(3),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: theme.spacing(2),
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ReferenceGroup = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
}));

export const Reference = styled('strong')(({ theme }) => ({ ...theme.typography.subtitle1 }));
export const DateText = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const ItemSummary = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,

  [theme.breakpoints.down('md')]: { gridColumn: '1 / -1' },
  [theme.breakpoints.down('sm')]: { gridColumn: 'auto' },
}));

export const Total = styled('strong')(({ theme }) => ({ ...theme.typography.subtitle1 }));

export const DetailLink = styled(AppLink)(({ theme }) => ({
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.vars.palette.water.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
}));

