import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const Intro = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(72),
  color: theme.vars.palette.text.secondary,
}));

export const HistoryList = styled('ol')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  margin: 0,
  padding: 0,
  listStyle: 'none',
}));

export const HistoryItem = styled('li')({
  margin: 0,
});

export const HistoryLink = styled(AppLink)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(8rem, 0.7fr) minmax(0, 1.4fr) minmax(8rem, 0.6fr)',
  gap: theme.spacing(2),
  alignItems: 'center',
  minHeight: theme.spacing(9),
  padding: theme.spacing(2),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  color: theme.vars.palette.text.primary,
  textDecoration: 'none',

  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(0.5),
  },
}));

export const Primary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const Secondary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));
