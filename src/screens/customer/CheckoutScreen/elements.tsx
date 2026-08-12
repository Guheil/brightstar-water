import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { AppLink, PageContainer } from '@/components';
import type { ChoiceVisualProps, StepVisualProps } from './interface';

export const CheckoutPage = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(7, 10),
  [theme.breakpoints.down('sm')]: { paddingBlock: theme.spacing(5, 8) },
}));

export const Header = styled('header')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  maxWidth: '48rem',
  marginBottom: theme.spacing(5),
}));

export const BackLink = styled(AppLink)(({ theme }) => ({
  width: 'fit-content',
  color: theme.vars.palette.water.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
}));

export const Title = styled('h1')(({ theme }) => ({ ...theme.typography.h1, margin: 0 }));

export const Lead = styled('p')(({ theme }) => ({
  ...theme.typography.bodyLarge,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const StepList = styled('ol')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(1),
  margin: theme.spacing(0, 0, 5),
  padding: 0,
  listStyle: 'none',

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const Step = styled('li', {
  shouldForwardProp: (prop) => prop !== '$active' && prop !== '$complete',
})<StepVisualProps>(({ theme, $active, $complete }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center',
  minHeight: 44,
  padding: theme.spacing(1, 1.5),
  borderBottom: `3px solid ${
    $active
      ? theme.vars.palette.primary.main
      : $complete
        ? theme.vars.palette.success.main
        : theme.vars.palette.divider
  }`,
  color: $active
    ? theme.vars.palette.text.primary
    : theme.vars.palette.text.secondary,
  fontWeight: $active
    ? theme.typography.fontWeightSemiBold
    : theme.typography.fontWeightRegular,
}));

export const StepNumber = styled('span')(({ theme }) => ({
  width: 24,
  height: 24,
  display: 'grid',
  placeItems: 'center',
  flex: '0 0 auto',
  borderRadius: '50%',
  backgroundColor: theme.vars.palette.neutral.main,
  ...theme.typography.caption,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const CheckoutLayout = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.35fr) minmax(18rem, 0.65fr)',
  gap: theme.spacing(6),
  alignItems: 'start',
  [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
}));

export const StagePanel = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  padding: theme.spacing(4),
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,
  [theme.breakpoints.down('sm')]: { padding: theme.spacing(3, 2) },
}));

export const StageTitle = styled('h2')(({ theme }) => ({ ...theme.typography.h3, margin: 0 }));

export const StageDescription = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const ChoiceList = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
}));

export const ChoiceCard = styled('label', {
  shouldForwardProp: (prop) => prop !== '$selected',
})<ChoiceVisualProps>(({ theme, $selected }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  gap: theme.spacing(1.5),
  alignItems: 'start',
  padding: theme.spacing(2),
  border: `1px solid ${
    $selected ? theme.vars.palette.water.main : theme.vars.palette.divider
  }`,
  borderRadius: theme.radii.control,
  backgroundColor: $selected
    ? theme.vars.palette.action.selected
    : theme.vars.palette.background.paper,
  cursor: 'pointer',
}));

export const ChoiceRadio = styled(Radio)(({ theme }) => ({
  marginTop: theme.spacing(-0.75),
  marginLeft: theme.spacing(-0.75),
  color: theme.vars.palette.text.secondary,
}));

export const ChoiceCopy = styled('span')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
}));

export const ChoiceTitle = styled('strong')(({ theme }) => ({
  ...theme.typography.subtitle1,
}));

export const ChoiceDescription = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const NoteField = styled(TextField)({});

export const DemoPaymentPanel = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: theme.spacing(2),
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.vars.palette.neutral.main,
  borderRadius: theme.radii.control,
  color: theme.vars.palette.text.secondary,

  '& svg': { color: theme.vars.palette.water.main },
}));

export const ReviewList = styled('div')(({ theme }) => ({
  display: 'grid',
  borderTop: `1px solid ${theme.vars.palette.divider}`,
}));

export const ReviewItem = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
  ...theme.typography.body2,
}));

export const ReviewLabel = styled('span')(({ theme }) => ({ color: theme.vars.palette.text.secondary }));
export const ReviewValue = styled('strong')({ textAlign: 'right' });

export const Actions = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const SecondaryButton = styled(Button)(({ theme }) => ({
  minHeight: 44,
  color: theme.vars.palette.text.primary,
}));

export const PrimaryButton = styled(Button)(({ theme }) => ({
  minWidth: 152,
  minHeight: 44,
  color: theme.vars.palette.primary.contrastText,
  backgroundColor: theme.vars.palette.primary.main,
  '&:hover': { backgroundColor: theme.vars.palette.primary.dark },
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

export const SummaryTitle = styled('h2')(({ theme }) => ({ ...theme.typography.h4, margin: 0 }));

export const SummaryList = styled('dl')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.25),
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

export const FinePrint = styled('p')(({ theme }) => ({
  ...theme.typography.caption,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

