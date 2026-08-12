import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

interface RootProps {
  $compact: boolean;
}

export const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$compact',
})<RootProps>(({ theme, $compact }) => ({
  width: '100%',
  minHeight: $compact ? 'auto' : theme.spacing(22),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1.5),
  padding: $compact ? theme.spacing(2) : theme.spacing(4),
  textAlign: 'center',
}));

export const Progress = styled(CircularProgress)(({ theme }) => ({
  color: theme.vars.palette.water.main,
}));

export const Label = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const Description = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(52),
  color: theme.vars.palette.text.secondary,
}));
