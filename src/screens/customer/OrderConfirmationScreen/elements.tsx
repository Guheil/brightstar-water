import { styled } from '@mui/material/styles';
import { AppLink, PageContainer } from '@/components';

export const ConfirmationPage = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  placeItems: 'center',
  paddingBlock: theme.spacing(8, 11),
  [theme.breakpoints.down('sm')]: { paddingBlock: theme.spacing(6, 9) },
}));

export const ConfirmationPanel = styled('section')(({ theme }) => ({
  width: '100%',
  maxWidth: '48rem',
  display: 'grid',
  gap: theme.spacing(4),
  padding: theme.spacing(5),
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderTop: `4px solid ${theme.vars.palette.success.main}`,
  borderRadius: theme.radii.surface,

  [theme.breakpoints.down('sm')]: { padding: theme.spacing(3, 2) },
}));

export const IconMark = styled('div')(({ theme }) => ({
  width: 52,
  height: 52,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '50%',
  backgroundColor: theme.vars.palette.success.light,
  color: theme.vars.palette.success.dark,
}));

export const HeadingGroup = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
}));

export const Title = styled('h1')(({ theme }) => ({ ...theme.typography.h1, margin: 0 }));
export const Lead = styled('p')(({ theme }) => ({
  ...theme.typography.bodyLarge,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const ReferencePanel = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(2),
  margin: 0,
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.neutral.main,
  borderRadius: theme.radii.control,

  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
}));

export const ReferenceItem = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
  '& dt': { ...theme.typography.caption, color: theme.vars.palette.text.secondary },
  '& dd': { ...theme.typography.subtitle1, margin: 0 },
}));

export const NextSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({ ...theme.typography.h3, margin: 0 }));

export const NextList = styled('ol')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  margin: 0,
  paddingLeft: theme.spacing(3),
  color: theme.vars.palette.text.secondary,
}));

export const Actions = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const PrimaryLink = styled(AppLink)(({ theme }) => ({
  minHeight: 46,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.25, 2),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  '&:hover': { backgroundColor: theme.vars.palette.primary.dark },
}));

export const SecondaryLink = styled(AppLink)(({ theme }) => ({
  minHeight: 46,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1.25, 2),
  color: theme.vars.palette.water.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
}));

