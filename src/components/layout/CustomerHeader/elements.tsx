import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Image from 'next/image';
import PageContainer from '@/components/layout/PageContainer';
import AppLink from '@/components/ui/AppLink';

interface HeaderRootProps {
  $condensed: boolean;
  $transparent: boolean;
}

interface HeaderLinkProps {
  $active: boolean;
}

interface LogoImageProps {
  $inverted: boolean;
}

interface LogoFrameProps {
  $paired: boolean;
}

interface MenuToneProps {
  $tone: 'neutral' | 'gas' | 'water';
}

interface MegaMenuProps {
  $open: boolean;
}

interface ShopMenuButtonProps {
  $active: boolean;
}

export const HeaderRoot = styled('header', {
  shouldForwardProp: (prop) =>
    !['$condensed', '$transparent'].includes(String(prop)),
})<HeaderRootProps>(({ theme, $condensed, $transparent }) => ({
  position: 'fixed',
  top: 0,
  insetInline: 0,
  zIndex: theme.zIndex.appBar,
  width: '100%',
  height: $condensed ? theme.spacing(8) : theme.spacing(10),
  color: $transparent
    ? theme.vars.palette.primary.contrastText
    : theme.vars.palette.text.primary,
  backgroundColor: 'transparent',
  transition: theme.transitions.create('color', {
    duration: theme.transitions.duration.standard,
    delay: $transparent ? 0 : theme.transitions.duration.shorter,
  }),

  '&::before': {
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    backgroundColor: theme.vars.palette.background.default,
    content: '""',
    transform: $transparent ? 'scaleY(0)' : 'scaleY(1)',
    transformOrigin: 'top',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.complex,
      easing: theme.transitions.easing.easeOut,
    }),
  },

  '& a, & button': {
    color: 'inherit',
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

export const HeaderContainer = styled(PageContainer)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: theme.spacing(4),
  height: '100%',

  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
  },
}));

export const BrandLink = styled(AppLink)({
  display: 'inline-flex',
  alignItems: 'center',
  width: 'fit-content',
  color: 'inherit',
});

export const BrandWordmark = styled('span')(({ theme }) => ({
  ...theme.typography.h5,
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: theme.spacing(5.5),
  color: 'inherit',
  letterSpacing: '-0.02em',
  whiteSpace: 'nowrap',
}));

export const LogoCluster = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'transparent',
}));

export const LogoFrame = styled('span', {
  shouldForwardProp: (prop) => prop !== '$paired',
})<LogoFrameProps>(({ theme, $paired }) => ({
  position: 'relative',
  width: $paired ? theme.spacing(15) : theme.spacing(22),
  height: theme.spacing(7),
  display: 'block',
  backgroundColor: 'transparent',

  [theme.breakpoints.down('lg')]: {
    width: $paired ? theme.spacing(13) : theme.spacing(18),
    height: theme.spacing(6.5),
  },

  [theme.breakpoints.down('sm')]: {
    width: $paired ? theme.spacing(9.5) : theme.spacing(15),
    height: theme.spacing(6),
  },
}));

export const LogoImage = styled(Image, {
  shouldForwardProp: (prop) => prop !== '$inverted',
})<LogoImageProps>(({ theme, $inverted }) => ({
  backgroundColor: 'transparent',
  objectFit: 'contain',
  objectPosition: 'left center',
  filter: $inverted ? 'grayscale(1) brightness(0) invert(1)' : 'none',
  transition: theme.transitions.create('filter', {
    duration: theme.transitions.duration.standard,
  }),
}));

export const DesktopNavigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(3),

  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

export const HeaderLink = styled(AppLink, {
  shouldForwardProp: (prop) => prop !== '$active',
})<HeaderLinkProps>(({ theme, $active }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  color: 'inherit',
  fontWeight: $active
    ? theme.typography.fontWeightBold
    : theme.typography.fontWeightMedium,
  textDecoration: 'none',
}));

export const ShopMenuButton = styled('button', {
  shouldForwardProp: (prop) => prop !== '$active',
})<ShopMenuButtonProps>(({ theme, $active }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  padding: 0,
  border: 0,
  backgroundColor: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  fontWeight: $active
    ? theme.typography.fontWeightBold
    : theme.typography.fontWeightMedium,

  '&:focus-visible': {
    outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.water.main}`,
    outlineOffset: theme.spacing(0.25),
  },

  '& svg': {
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
}));

export const UtilityNavigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(0.5),
}));

export const ActionLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.75),
  paddingInline: theme.spacing(1),
  color: 'inherit',
  fontWeight: theme.typography.fontWeightMedium,

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export const ActionText = styled('span')(({ theme }) => ({
  color: 'inherit',

  [theme.breakpoints.down('xl')]: {
    display: 'none',
  },
}));

export const CartCount = styled('span')(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.vars.palette.gas.main,
  fontVariantNumeric: 'tabular-nums',
}));

export const SearchActionLink = styled(ActionLink)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

export const AccountActionLink = styled(ActionLink)(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

export const LogoutActionButton = styled('button')(({ theme }) => ({
  ...theme.typography.body2,
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.75),
  paddingInline: theme.spacing(1),
  border: 0,
  backgroundColor: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  fontWeight: theme.typography.fontWeightMedium,

  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },

  '&:focus-visible': {
    outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.water.main}`,
    outlineOffset: theme.spacing(0.25),
  },

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export const MenuButton = styled(IconButton)(({ theme }) => ({
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  display: 'none',
  color: 'inherit',

  [theme.breakpoints.down('lg')]: {
    display: 'inline-flex',
  },

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export const MegaMenu = styled('div', {
  shouldForwardProp: (prop) => prop !== '$open',
})<MegaMenuProps>(({ theme, $open }) => ({
  position: 'absolute',
  top: '100%',
  insetInline: 0,
  height: 'auto',
  color: theme.vars.palette.text.primary,
  pointerEvents: $open ? 'auto' : 'none',
  visibility: $open ? 'visible' : 'hidden',
  transitionProperty: 'visibility',
  transitionDelay: $open ? '0ms' : `${theme.transitions.duration.complex}ms`,

  '&::before': {
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    backgroundColor: theme.vars.palette.background.default,
    boxShadow: $open ? theme.shadows[4] : theme.shadows[0],
    content: '\"\"',
    transform: $open ? 'scaleY(1)' : 'scaleY(0)',
    transformOrigin: 'top',
    transition: theme.transitions.create(['transform', 'box-shadow'], {
      duration: theme.transitions.duration.complex,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
}));

export const MegaMenuInner = styled(PageContainer, {
  shouldForwardProp: (prop) => prop !== '$open',
})<MegaMenuProps>(({ theme, $open }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(6),
  paddingBlock: theme.spacing(5),
  opacity: $open ? 1 : 0,
  transform: $open ? 'translateY(0)' : `translateY(${theme.spacing(-1.5)})`,
  transition: theme.transitions.create(['opacity', 'transform'], {
    duration: $open
      ? theme.transitions.duration.standard
      : theme.transitions.duration.short,
    easing: theme.transitions.easing.easeOut,
    delay: $open ? theme.transitions.duration.shortest : 0,
  }),
}));

export const MegaMenuGroup = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

export const MegaMenuTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.subtitle2,
  margin: 0,
  marginBottom: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
}));

export const MegaMenuLink = styled(AppLink, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<MenuToneProps>(({ theme, $tone }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: theme.spacing(0.25),
  paddingBlock: theme.spacing(1),
  color:
    $tone === 'gas'
      ? theme.vars.palette.gas.dark
      : $tone === 'water'
        ? theme.vars.palette.water.dark
        : theme.vars.palette.text.primary,
}));

export const MegaMenuLinkLabel = styled('span')(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: 'inherit',
}));

export const MegaMenuLinkDescription = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const CustomerDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: theme.spacing(42),
    maxWidth: '100%',
    backgroundColor: theme.vars.palette.background.default,
  },
}));

export const DrawerBody = styled(Box)(({ theme }) => ({
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
}));

export const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },
}));

export const MobileNavigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

export const MobileMenuGroup = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const MobileMenuTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.caption,
  margin: 0,
  marginBottom: theme.spacing(0.5),
  color: theme.vars.palette.text.secondary,
  textTransform: 'uppercase',
}));

export const MobileNavigationLink = styled(AppLink, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<MenuToneProps>(({ theme, $tone }) => ({
  ...theme.typography.body1,
  minHeight: theme.spacing(5.5),
  display: 'flex',
  alignItems: 'center',
  color:
    $tone === 'gas'
      ? theme.vars.palette.gas.dark
      : $tone === 'water'
        ? theme.vars.palette.water.dark
        : theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightMedium,
}));

export const MobileUtilityLinks = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(1),
  marginTop: 'auto',
}));

export const MobileUtilityLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightMedium,

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
  },
}));

export const MobileUtilityButton = styled('button')(({ theme }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: 0,
  border: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.control,
  backgroundColor: 'transparent',
  color: theme.vars.palette.text.primary,
  cursor: 'pointer',
  fontWeight: theme.typography.fontWeightMedium,

  '&:focus-visible': {
    outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.water.main}`,
    outlineOffset: theme.spacing(0.25),
  },

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
  },
}));
