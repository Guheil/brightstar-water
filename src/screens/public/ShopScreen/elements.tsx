import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import AppLink from '@/components/ui/AppLink';
import PageContainer from '@/components/layout/PageContainer';

export const Root = styled(Box)(({ theme }) => ({
  minHeight: theme.spacing(75),
  paddingBlock: theme.spacing(8, 12),
  backgroundColor: theme.vars.palette.background.default,

  [theme.breakpoints.down('md')]: {
    paddingBlock: theme.spacing(6, 9),
  },
}));

export const Container = styled(PageContainer)({});

export const Intro = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(18rem, 0.45fr)',
  gap: theme.spacing(4),
  alignItems: 'end',
  marginBottom: theme.spacing(5),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const Introduction = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(72),
  marginTop: theme.spacing(1.5),
  color: theme.vars.palette.text.secondary,
}));

export const CoverageLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifySelf: 'end',
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,

  [theme.breakpoints.down('md')]: {
    justifySelf: 'start',
  },
}));


export const StoreVisual = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  minHeight: theme.spacing(42),
  marginBottom: theme.spacing(5),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.neutral.light,

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(30),
  },
}));

export const StoreVisualImage = styled(Image)({
  objectFit: 'cover',
});

export const ToolBar = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(14rem, 1fr) minmax(12rem, 0.34fr)',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const SearchField = styled(TextField)({});
export const SearchAdornment = styled(InputAdornment)({});
export const ClearSearchButton = styled(IconButton)(({ theme }) => ({
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
}));
export const SortControl = styled(FormControl)({});
export const SortLabel = styled(InputLabel)({});
export const SortSelect = styled(Select)({});
export const SortOption = styled(MenuItem)({});

export const CategoryControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  overflowX: 'auto',
  paddingBlock: theme.spacing(1),
  marginBottom: theme.spacing(4),
  scrollbarWidth: 'thin',
}));

export const CategoryButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== '$selected' && prop !== '$tone',
})<{ $selected: boolean; $tone: 'neutral' | 'gas' | 'water' }>(
  ({ theme, $selected, $tone }) => {
    const selectedColor =
      $tone === 'gas'
        ? theme.vars.palette.gas.main
        : $tone === 'water'
          ? theme.vars.palette.water.main
          : theme.vars.palette.primary.main;

    return {
      flexShrink: 0,
      minHeight: theme.spacing(5.5),
      paddingInline: theme.spacing(2),
      borderColor: $selected ? selectedColor : theme.vars.palette.divider,
      backgroundColor: $selected
        ? selectedColor
        : theme.vars.palette.background.paper,
      color: $selected
        ? theme.vars.palette.primary.contrastText
        : theme.vars.palette.text.primary,

      '&:hover': {
        borderColor: selectedColor,
        backgroundColor: $selected ? selectedColor : theme.vars.palette.action.hover,
      },
    };
  },
);

export const ResultsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  minHeight: theme.spacing(5),
  marginBottom: theme.spacing(3),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const ResultsCount = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
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

export const ProductArticle = styled('article')(({ theme }) => ({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

export const ProductLink = styled(AppLink)(({ theme }) => ({
  display: 'block',
  minHeight: theme.spacing(5.5),
}));

export const ProductMedia = styled(Box)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '1 / 1',
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.neutral.light,
}));

export const ProductImage = styled(Image)(({ theme }) => ({
  objectFit: 'cover',
  transition: theme.transitions.create('transform'),

  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

export const ProductContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: theme.spacing(23),
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export const CategoryLine = styled(Typography, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<{ $tone: 'gas' | 'water' }>(({ theme, $tone }) => ({
  ...theme.typography.caption,
  color:
    $tone === 'gas'
      ? theme.vars.palette.gas.dark
      : theme.vars.palette.water.dark,
  fontWeight: theme.typography.fontWeightSemiBold,
  textTransform: 'uppercase',
  letterSpacing: theme.spacing(0.06),
}));

export const ProductName = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const ProductDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ProductPrice = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  marginTop: 'auto',
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));

export const ProductAvailability = styled(Typography, {
  shouldForwardProp: (prop) => prop !== '$available',
})<{ $available: boolean }>(({ theme, $available }) => ({
  ...theme.typography.caption,
  color: $available
    ? theme.vars.palette.success.dark
    : theme.vars.palette.error.main,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const AddButton = styled(Button)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));


export const EmptyPanel = styled(Box)(({ theme }) => ({
  paddingBlock: theme.spacing(6),
  borderBlock: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const ResetButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));
