import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const MapFrame = styled(Box)(({ theme }) => ({
  overflow: 'hidden',
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.neutral.light,
}));

export const MapCanvas = styled(Box)(({ theme }) => ({
  width: '100%',
  height: theme.spacing(48),

  [theme.breakpoints.down('sm')]: {
    height: theme.spacing(38),
  },
}));

export const MapHelp = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1.5, 2),
  color: theme.vars.palette.text.secondary,
  backgroundColor: theme.vars.palette.background.paper,
}));
