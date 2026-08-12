import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const DetailGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.25fr) minmax(17rem, 0.75fr)',
  gap: theme.spacing(4),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const Column = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const Section = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  paddingBottom: theme.spacing(3),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  color: theme.vars.palette.primary.main,
}));

export const Strong = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const Text = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Items = styled('ul')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  margin: 0,
  padding: 0,
  listStyle: 'none',
}));

export const Item = styled('li')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

export const ActionPanel = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: theme.spacing(1.5),
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.paper,
  border: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,

  [theme.breakpoints.down('md')]: {
    position: 'static',
  },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6),
}));

export const FailureLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  minHeight: theme.spacing(6),
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(2),
  border: `${theme.spacing(0.125)} solid ${theme.vars.palette.error.main}`,
  borderRadius: theme.radii.control,
  color: theme.vars.palette.error.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
}));

export const Result = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));
