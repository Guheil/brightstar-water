import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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
  width: theme.spacing(28),
  zIndex: theme.zIndex.appBar,
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
  display: 'block',
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightBold,
  textDecoration: 'none',

  '&:focus-visible': {
    outlineColor: theme.vars.palette.primary.contrastText,
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
  minHeight: theme.spacing(5.75),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingInline: theme.spacing(1.5),
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
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

export const SidebarFooter = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  marginTop: 'auto',
  paddingBlockStart: theme.spacing(3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.dark,
}));

export const SidebarUser = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.neutral.light,
}));

export const SidebarLogoutButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  justifyContent: 'flex-start',
  paddingInline: theme.spacing(1.5),
  color: theme.vars.palette.primary.contrastText,
  borderColor: theme.vars.palette.primary.dark,

  '&:hover': {
    borderColor: theme.vars.palette.primary.contrastText,
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const Workspace = styled(Box)(({ theme }) => ({
  minWidth: 0,
  minHeight: '100dvh',
  marginInlineStart: theme.spacing(28),

  [theme.breakpoints.down('md')]: {
    marginInlineStart: 0,
  },
}));

export const Header = styled('header')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,
}));

export const HeaderInner = styled(PageContainer)(({ theme }) => ({
  minHeight: theme.spacing(9.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(8.5),
  },
}));

export const HeaderText = styled(Box)(({ theme }) => ({
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.2),
}));

export const HeaderTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.h5,
  overflow: 'hidden',
  margin: 0,
  color: theme.vars.palette.primary.main,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.h6,
  },
}));

export const HeaderMeta = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  overflow: 'hidden',
  color: theme.vars.palette.text.secondary,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

export const HeaderControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginInlineStart: 'auto',
}));

export const HeaderAction = styled(Box)({});

export const HeaderLogoutButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  display: 'none',
  color: theme.vars.palette.primary.main,

  [theme.breakpoints.down('md')]: {
    display: 'inline-flex',
  },

  [theme.breakpoints.down('sm')]: {
    minWidth: theme.spacing(5.5),
    paddingInline: theme.spacing(1),

    '& .MuiButton-startIcon': {
      margin: 0,
    },

  },
}));

export const HeaderLogoutLabel = styled('span')(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const Main = styled('main')(({ theme }) => ({
  minWidth: 0,
  paddingBlockEnd: theme.spacing(3),

  [theme.breakpoints.down('md')]: {
    paddingBlockEnd: `calc(${theme.spacing(11)} + env(safe-area-inset-bottom))`,
  },
}));

export const MainContainer = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(3.5, 5),

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(2.5, 4),
  },
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
  minHeight: theme.spacing(8),
  display: 'flex',
  flex: '1 1 0',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.4),
  padding: theme.spacing(0.75),
  backgroundColor: $active ? theme.vars.palette.neutral.light : 'transparent',
  color: $active ? theme.vars.palette.primary.main : theme.vars.palette.text.secondary,
  fontWeight: $active ? theme.typography.fontWeightBold : theme.typography.fontWeightMedium,
  textAlign: 'center',
  textDecoration: 'none',
  transition: theme.transitions.create(['background-color', 'color'], {
    duration: theme.transitions.duration.shorter,
  }),

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));
