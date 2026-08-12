import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
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
  gridTemplateColumns: `${theme.spacing(35)} minmax(0, 1fr)`,
  backgroundColor: theme.vars.palette.background.default,

  [theme.breakpoints.down('lg')]: {
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
  overflowY: 'auto',
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('lg')]: {
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

export const SidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

export const BrandLink = styled(AppLink)(({ theme }) => ({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.25),
  color: theme.vars.palette.primary.contrastText,

  '&:focus-visible': {
    outlineColor: theme.vars.palette.water.light,
  },
}));

export const BrandName = styled(Typography)(({ theme }) => ({
  ...theme.typography.h6,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightBold,
}));

export const BrandSubtitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.neutral.light,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.primary.contrastText,

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export const SidebarNavigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const SidebarNavLink = styled(AppLink, {
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
    flex: '0 0 auto',
  },
}));

export const SidebarFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  marginTop: 'auto',
  paddingBlockStart: theme.spacing(3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.dark,
}));

export const UserName = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightBold,
}));

export const UserRole = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.neutral.light,
}));

export const SignOutButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  justifyContent: 'flex-start',
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: theme.spacing(35),
    maxWidth: '100%',
    backgroundColor: theme.vars.palette.primary.main,
  },
}));

export const Workspace = styled(Box)({
  minWidth: 0,
});

export const WorkspaceHeader = styled('header')(({ theme }) => ({
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

  [theme.breakpoints.down('lg')]: {
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(8),
    paddingInline: theme.layout.mobileGutter,
  },
}));

export const MenuButton = styled(IconButton)(({ theme }) => ({
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  display: 'none',
  color: theme.vars.palette.primary.main,

  [theme.breakpoints.down('lg')]: {
    display: 'inline-flex',
  },

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export const HeaderLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  overflow: 'hidden',
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightBold,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginInlineStart: 'auto',
}));

export const Main = styled('main')({
  minWidth: 0,
});

export const MainContainer = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(4),

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(3),
  },
}));
