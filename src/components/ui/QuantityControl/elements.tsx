import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'inline-grid',
  gridTemplateColumns: 'auto minmax(3ch, auto) auto',
  alignItems: 'center',
  overflow: 'hidden',
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.background.paper,
}));

export const ControlButton = styled(IconButton)(({ theme }) => ({
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  borderRadius: 0,
  color: theme.vars.palette.text.primary,

  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
  },
}));

export const Value = styled('output')(({ theme }) => ({
  ...theme.typography.body1,
  minWidth: theme.spacing(5),
  color: theme.vars.palette.text.primary,
  fontVariantNumeric: 'tabular-nums',
  fontWeight: theme.typography.fontWeightMedium,
  textAlign: 'center',
}));
