import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  maxWidth: theme.spacing(82),
}));

export const ProfilePanel = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.paper,
  border: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,
}));

export const Name = styled(Typography)(({ theme }) => ({
  ...theme.typography.h4,
  color: theme.vars.palette.primary.main,
}));

export const Details = styled('dl')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(8rem, 0.4fr) minmax(0, 1fr)',
  gap: theme.spacing(1.5, 2),
  margin: 0,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const Label = styled('dt')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const Value = styled('dd')(({ theme }) => ({
  ...theme.typography.body1,
  margin: 0,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const BoundaryList = styled('ul')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  margin: 0,
  paddingInlineStart: theme.spacing(2.5),
  color: theme.vars.palette.text.secondary,
}));
