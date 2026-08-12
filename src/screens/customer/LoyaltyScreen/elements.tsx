import { styled } from '@mui/material/styles';
import { PageContainer } from '@/components';

export const LoyaltyPage = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(7, 10),
  [theme.breakpoints.down('sm')]: { paddingBlock: theme.spacing(5, 8) },
}));

export const Hero = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.1fr) minmax(18rem, 0.9fr)',
  gap: theme.spacing(6),
  alignItems: 'end',
  paddingBottom: theme.spacing(6),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
}));

export const HeroCopy = styled('div')(({ theme }) => ({
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

export const BalancePanel = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  padding: theme.spacing(4),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  borderRadius: theme.radii.surface,
}));

export const BalanceLabel = styled('span')(({ theme }) => ({
  ...theme.typography.subtitle2,
  opacity: 0.8,
}));

export const BalanceValue = styled('strong')(({ theme }) => ({
  fontFamily: theme.typography.display.fontFamily,
  fontSize: theme.typography.h1.fontSize,
  lineHeight: 1,
}));

export const BalanceEquivalent = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  opacity: 0.8,
}));

export const ContentGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(18rem, 0.8fr)',
  gap: theme.spacing(7),
  paddingTop: theme.spacing(6),
  [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
}));

export const Section = styled('section')(({ theme }) => ({
  display: 'grid',
  alignContent: 'start',
  gap: theme.spacing(3),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({ ...theme.typography.h3, margin: 0 }));

export const ActivityList = styled('div')(({ theme }) => ({
  display: 'grid',
  borderTop: `1px solid ${theme.vars.palette.divider}`,
}));

export const ActivityRow = styled('article')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(2.5),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
}));

export const ActivityCopy = styled('div')(({ theme }) => ({ display: 'grid', gap: theme.spacing(0.5) }));
export const ActivityDescription = styled('strong')(({ theme }) => ({ ...theme.typography.subtitle2 }));
export const ActivityDate = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const ActivityPoints = styled('strong')(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.vars.palette.success.main,
}));

export const RulePanel = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.5),
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,
}));

export const RuleList = styled('dl')(({ theme }) => ({ display: 'grid', gap: theme.spacing(1.5), margin: 0 }));

export const RuleRow = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(7rem, 0.7fr) minmax(0, 1.3fr)',
  gap: theme.spacing(2),
  ...theme.typography.body2,
  '& dt': { color: theme.vars.palette.text.secondary },
  '& dd': { margin: 0, fontWeight: theme.typography.fontWeightSemiBold },
}));

export const PendingPointsValue = styled('strong')(({ theme }) => ({
  fontFamily: theme.typography.display.fontFamily,
  fontSize: theme.typography.h2.fontSize,
  lineHeight: 1,
  color: theme.vars.palette.gas.main,
}));

export const SupportingText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));
