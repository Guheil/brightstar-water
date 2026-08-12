import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import PageContainer from '@/components/layout/PageContainer';
import AppLink from '@/components/ui/AppLink';

export const FooterRoot = styled('footer')(({ theme }) => ({
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
}));

export const FooterContainer = styled(PageContainer)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(5),
  paddingBlock: theme.spacing(7),
}));

export const FooterGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(5),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(4),
  },
}));

export const BrandSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: theme.spacing(52),
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

export const BrandName = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  color: theme.vars.palette.primary.contrastText,
}));

export const Summary = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.neutral.light,
}));

export const ContactList = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.75),
  marginTop: theme.spacing(1),
}));

export const ContactLine = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.neutral.light,
}));

export const LinkGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

export const GroupTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightBold,
}));

export const GroupNavigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
}));

export const FooterLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.neutral.light,
  textDecoration: 'underline',
  textDecorationColor: theme.vars.palette.primary.dark,
  textUnderlineOffset: theme.spacing(0.5),

  '&:hover': {
    color: theme.vars.palette.primary.contrastText,
    textDecorationColor: theme.vars.palette.water.light,
  },
}));

export const FooterBottom = styled(Box)(({ theme }) => ({
  paddingBlockStart: theme.spacing(3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.dark,
}));

export const LegalText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.neutral.light,
}));
