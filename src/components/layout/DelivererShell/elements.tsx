import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import PageContainer from '@/components/layout/PageContainer';
import AppLink from '@/components/ui/AppLink';

interface NavLinkProps {
  $active: boolean;
}

export const ShellRoot = styled(Box)(({ theme }) => ({
  minHeight: '100dvh',
  display: 'grid',
  gridTemplateColumns: `${theme.spacing(28)} minmax(0, 1fr)`,
  backgroundColor: theme.vars.palette.background.default,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
}));

export const SkipLink = styled(AppLink)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(1),
  left: theme.spacing(1),
  zIndex: theme.zIndex.modal + 1,
  padding: theme.spacing(1, 1.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  transform: 'translateY(-200%)',

  '&:focus': {
    transform: 'translateY(0)',
  },
}));

export const DesktopSidebar = styled('aside')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  height: '100dvh',
  backgroundColor: theme.vars.palette.primary.main,

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const SidebarBody = styled(Box)(({ theme }) => ({
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  padding: theme.spacing(3),
}));

export const BrandLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.h6,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightBold,

  '&:focus-visible': {
    outlineColor: theme.vars.palette.water.light,
  },
}));

export const DesktopNavigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const DesktopNavLink = styled(AppLink, {
  shouldForwardProp: (prop) => prop !== '$active',
})<NavLinkProps>(({ theme, $active }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingInline: theme.spacing(1.5),
  backgroundColor: $active
    ? theme.vars.palette.primary.dark
    : undefined,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: $active
    ? theme.typography.fontWeightBold
    : theme.typography.fontWeightMedium,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },

  '&:focus-visible': {
    outlineColor: theme.vars.palette.water.light,
  },

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
  },
}));

export const SidebarUser = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: 'auto',
  paddingBlockStart: theme.spacing(3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.dark,
  color: theme.vars.palette.neutral.light,
}));

export const Workspace = styled(Box)({
  minWidth: 0,
});

export const Header = styled('header')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
  minHeight: theme.spacing(9),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  paddingInline: theme.layout.desktopGutter,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('md')]: {
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(8),
    paddingInline: theme.layout.mobileGutter,
  },
}));

export const HeaderText = styled(Box)(({ theme }) => ({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
}));

export const HeaderTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.h6,
  overflow: 'hidden',
  margin: 0,
  color: theme.vars.palette.text.primary,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const HeaderMeta = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  overflow: 'hidden',
  color: theme.vars.palette.text.secondary,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const HeaderAction = styled(Box)({
  marginInlineStart: 'auto',
});

export const Main = styled('main')(({ theme }) => ({
  minWidth: 0,

  [theme.breakpoints.down('md')]: {
    paddingBlockEnd: theme.spacing(10),
  },
}));

export const MainContainer = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(3),
}));

export const BottomNavigation = styled('nav')(({ theme }) => ({
  position: 'fixed',
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: theme.zIndex.appBar,
  display: 'none',
  alignItems: 'stretch',
  paddingBlockEnd: 'env(safe-area-inset-bottom)',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,
  boxShadow: theme.shadows[8],

  [theme.breakpoints.down('md')]: {
    display: 'flex',
  },
}));

export const BottomNavLink = styled(AppLink, {
  shouldForwardProp: (prop) => prop !== '$active',
})<NavLinkProps>(({ theme, $active }) => ({
  ...theme.typography.body2,
  minWidth: 0,
  minHeight: theme.spacing(7),
  display: 'flex',
  flex: '1 1 0',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.75),
  color: $active
    ? theme.vars.palette.water.dark
    : theme.vars.palette.text.secondary,
  fontWeight: $active
    ? theme.typography.fontWeightBold
    : theme.typography.fontWeightMedium,
  textAlign: 'center',

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));
