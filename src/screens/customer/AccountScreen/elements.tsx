import { styled } from '@mui/material/styles';
import { AppLink, PageContainer } from '@/components';

export const AccountPage = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(7, 10),

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(5, 8),
  },
}));

export const IntroGrid = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.3fr) minmax(18rem, 0.7fr)',
  gap: theme.spacing(7),
  alignItems: 'end',
  paddingBottom: theme.spacing(6),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
  },
}));

export const IntroCopy = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  maxWidth: '48rem',
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

export const AccountIdentity = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: theme.spacing(1, 2),
  margin: 0,
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,
}));

export const IdentityTerm = styled('dt')(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const IdentityValue = styled('dd')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  fontWeight: theme.typography.fontWeightSemiBold,
  overflowWrap: 'anywhere',
}));

export const ContentGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(17rem, 0.8fr)',
  gap: theme.spacing(7),
  paddingTop: theme.spacing(6),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const Section = styled('section')(({ theme }) => ({
  display: 'grid',
  alignContent: 'start',
  gap: theme.spacing(3),
}));

export const SectionHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h3,
  margin: 0,
}));

export const InlineLink = styled(AppLink)(({ theme }) => ({
  color: theme.vars.palette.water.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',

  '&:hover': { textDecoration: 'underline' },
  '&:focus-visible': { outline: `3px solid ${theme.vars.palette.action.focus}` },
}));

export const OrderPanel = styled('article')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,
}));

export const OrderTopline = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const OrderReference = styled('strong')(({ theme }) => ({
  ...theme.typography.subtitle1,
}));

export const OrderMeta = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const ActionList = styled('div')(({ theme }) => ({
  display: 'grid',
  borderTop: `1px solid ${theme.vars.palette.divider}`,
}));

export const ActionRow = styled(AppLink)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  gap: theme.spacing(2),
  alignItems: 'center',
  minHeight: 64,
  paddingBlock: theme.spacing(2),
  color: theme.vars.palette.text.primary,
  textDecoration: 'none',
  borderBottom: `1px solid ${theme.vars.palette.divider}`,

  '&:hover': { color: theme.vars.palette.water.main },
  '&:focus-visible': { outline: `3px solid ${theme.vars.palette.action.focus}` },
}));


export const ActionIcon = styled('span', { shouldForwardProp: (prop) => prop !== '$warning' })<{ $warning?: boolean }>(({ theme, $warning }) => ({
  width: 36,
  height: 36,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  backgroundColor: $warning ? theme.vars.palette.warning.main : theme.vars.palette.water.main,
  color: $warning ? theme.vars.palette.warning.contrastText : theme.vars.palette.water.contrastText,
  '& svg': { width: 19, height: 19 },
}));
export const ActionText = styled('span')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.25),
}));

export const ActionLabel = styled('strong')(({ theme }) => ({
  ...theme.typography.subtitle2,
}));

export const ActionDescription = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const PointsValue = styled('p')(({ theme }) => ({
  margin: 0,
  fontFamily: theme.typography.display.fontFamily,
  fontSize: theme.typography.h1.fontSize,
  fontWeight: theme.typography.fontWeightSemiBold,
  lineHeight: 1,
  color: theme.vars.palette.gas.main,
}));

export const SupportingText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));
