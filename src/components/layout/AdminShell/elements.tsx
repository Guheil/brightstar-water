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
  backgroundColor: theme.vars.palette.background.default,
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
  position: 'fixed',
  insetBlock: 0,
  insetInlineStart: 0,
  zIndex: theme.zIndex.appBar,
  width: theme.spacing(34),
  overflowY: 'auto',
  overscrollBehavior: 'contain',
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
  paddingBlock: theme.spacing(4, 3),
}));

export const SidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingInline: theme.spacing(3),
  paddingBlockEnd: theme.spacing(4),
}));

export const BrandLink = styled(AppLink)(({ theme }) => ({
  minWidth: 0,
  display: 'grid',
  gap: theme.spacing(0.4),
  color: theme.vars.palette.primary.contrastText,
  textDecoration: 'none',

  '&:focus-visible': {
    outlineColor: theme.vars.palette.primary.contrastText,
  },
}));

export const BrandName = styled(Typography)(({ theme }) => ({
  ...theme.typography.h5,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightBold,
}));

export const BrandSubtitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(24),
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
  paddingInline: theme.spacing(2),
}));

export const SidebarNavLink = styled(AppLink, {
  shouldForwardProp: (prop) => prop !== '$active',
})<NavLinkProps>(({ theme, $active }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(6),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingInline: theme.spacing(1.75),
  borderRadius: theme.radii.control,
  backgroundColor: $active ? theme.vars.palette.background.paper : 'transparent',
  color: $active ? theme.vars.palette.primary.main : theme.vars.palette.primary.contrastText,
  fontWeight: $active ? theme.typography.fontWeightBold : theme.typography.fontWeightMedium,
  textDecoration: 'none',
  transition: theme.transitions.create(['background-color', 'color'], {
    duration: theme.transitions.duration.shorter,
  }),

  '&:hover': {
    backgroundColor: $active ? theme.vars.palette.background.paper : theme.vars.palette.primary.dark,
  },

  '&:focus-visible': {
    outlineColor: theme.vars.palette.primary.contrastText,
  },

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
    flex: '0 0 auto',
    color: $active ? theme.vars.palette.primary.main : 'currentColor',
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

export const SidebarFooter = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  marginTop: 'auto',
  marginInline: theme.spacing(3),
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
  paddingInline: theme.spacing(1.25),
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: theme.spacing(34),
    maxWidth: '100%',
    backgroundColor: theme.vars.palette.primary.main,
  },
}));

export const Workspace = styled(Box)(({ theme }) => ({
  minWidth: 0,
  height: '100dvh',
  marginInlineStart: theme.spacing(34),
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  scrollbarGutter: 'stable',

  [theme.breakpoints.down('lg')]: {
    height: 'auto',
    minHeight: '100dvh',
    marginInlineStart: 0,
    overflowY: 'visible',
  },
}));

export const WorkspaceHeader = styled('header')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,
}));

export const WorkspaceHeaderInner = styled(PageContainer)(({ theme }) => ({
  minHeight: theme.spacing(15),
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: theme.spacing(3),
  paddingBlock: theme.spacing(2.5),

  [theme.breakpoints.down('md')]: {
    minHeight: theme.spacing(11),
    gap: theme.spacing(2),
    paddingBlock: theme.spacing(1.75),
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(9.5),
    gap: theme.spacing(1.25),
    paddingBlock: theme.spacing(1.25),
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

export const HeaderCopy = styled(Box)(({ theme }) => ({
  minWidth: 0,
  display: 'grid',
  gap: theme.spacing(0.65),
  alignContent: 'center',
}));

export const HeaderLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.h3,
  overflow: 'hidden',
  color: theme.vars.palette.text.primary,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  [theme.breakpoints.down('md')]: {
    ...theme.typography.h5,
  },

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.subtitle1,
  },
}));

export const HeaderDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(78),
  overflow: 'hidden',
  color: theme.vars.palette.text.secondary,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const HeaderIdentity = styled(Box)(({ theme }) => ({
  minWidth: theme.spacing(30),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),

  [theme.breakpoints.down('md')]: {
    minWidth: 0,
  },
}));

export const HeaderIdentityCopy = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.1),
  textAlign: 'right',

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const HeaderIdentityName = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightBold,
}));

export const HeaderIdentityRole = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const Main = styled('main')({
  minWidth: 0,
});

export const MainContainer = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(5, 8),

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(3, 5),
  },
}));
