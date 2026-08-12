import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { NoticeTone } from './interface';

interface RootProps {
  $tone: NoticeTone;
}

function getToneStyles(theme: Theme, tone: NoticeTone) {
  switch (tone) {
    case 'info':
      return {
        backgroundColor: theme.vars.palette.neutral.light,
        borderColor: theme.vars.palette.water.main,
        iconColor: theme.vars.palette.water.dark,
      };
    case 'success':
      return {
        backgroundColor: theme.vars.palette.success.light,
        borderColor: theme.vars.palette.success.main,
        iconColor: theme.vars.palette.success.dark,
      };
    case 'warning':
      return {
        backgroundColor: theme.vars.palette.warning.light,
        borderColor: theme.vars.palette.warning.main,
        iconColor: theme.vars.palette.warning.dark,
      };
    case 'error':
      return {
        backgroundColor: theme.vars.palette.error.light,
        borderColor: theme.vars.palette.error.main,
        iconColor: theme.vars.palette.error.dark,
      };
    default:
      return {
        backgroundColor: theme.vars.palette.neutral.light,
        borderColor: theme.vars.palette.divider,
        iconColor: theme.vars.palette.text.secondary,
      };
  }
}

export const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<RootProps>(({ theme, $tone }) => {
  const tone = getToneStyles(theme, $tone);

  return {
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'start',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2),
    borderWidth: theme.spacing(0.125),
    borderStyle: 'solid',
    borderColor: tone.borderColor,
    borderRadius: theme.radii.control,
    backgroundColor: tone.backgroundColor,
    color: theme.vars.palette.text.primary,

    [theme.breakpoints.down('sm')]: {
      gridTemplateColumns: 'auto minmax(0, 1fr)',
    },
  };
});

export const IconSlot = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<RootProps>(({ theme, $tone }) => ({
  display: 'inline-flex',
  color: getToneStyles(theme, $tone).iconColor,

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export const Content = styled(Box)(({ theme }) => ({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const Title = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const Message = styled('div')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
}));

export const ActionSlot = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  [theme.breakpoints.down('sm')]: {
    gridColumn: '2',
  },
}));
