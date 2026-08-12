import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  width: '100%',
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
}));

export const Title = styled(Typography)(({ theme }) => ({
  ...theme.typography.h4,
  color: theme.vars.palette.text.primary,
}));

export const Description = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.secondary,
  marginTop: theme.spacing(1),
}));

export const Action = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },

  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));
