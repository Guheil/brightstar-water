import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { StatusTone } from './interface';

interface RootProps {
  $tone: StatusTone;
}

function getToneColor(theme: Theme, tone: StatusTone) {
  switch (tone) {
    case 'info':
    case 'water':
      return theme.vars.palette.water.main;
    case 'gas':
      return theme.vars.palette.gas.main;
    case 'success':
      return theme.vars.palette.success.main;
    case 'warning':
      return theme.vars.palette.warning.dark;
    case 'error':
      return theme.vars.palette.error.main;
    default:
      return theme.vars.palette.text.secondary;
  }
}

export const Root = styled('span', {
  shouldForwardProp: (prop) => prop !== '$tone',
})<RootProps>(({ theme, $tone }) => ({
  ...theme.typography.body2,
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  color: getToneColor(theme, $tone),
  fontWeight: theme.typography.fontWeightMedium,

  '&::before': {
    width: theme.spacing(1),
    height: theme.spacing(1),
    flex: '0 0 auto',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: 'currentColor',
    content: '""',
  },
}));
