import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled('section')(({ theme }) => ({
  display: 'flex',
  minHeight: theme.spacing(64),
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: theme.spacing(2),
  maxWidth: theme.layout.maxContentWidth,
  marginInline: 'auto',
  paddingBlock: theme.spacing(8),
  paddingInline: theme.layout.desktopGutter,

  [theme.breakpoints.down('md')]: {
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(52),
    paddingInline: theme.layout.mobileGutter,
  },
}));

export const Code = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  color: theme.vars.palette.gas.main,
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const Description = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(65),
  color: theme.vars.palette.text.secondary,
}));

export const Action = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  minHeight: theme.spacing(6),
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  paddingInline: theme.spacing(3),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
}));
