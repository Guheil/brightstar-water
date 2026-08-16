import Box from '@mui/material/Box';
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
  height: theme.spacing(32),

  [theme.breakpoints.down('sm')]: { height: theme.spacing(26) },
}));
