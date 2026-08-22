import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Image from 'next/image';

export const Root = styled(Box)(({ theme }) => ({
  minHeight: '100dvh',
  backgroundColor: theme.vars.palette.background.default,
}));

export const PageShell = styled(Box)(({ theme }) => ({
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: theme.layout.maxContentWidth,
  minHeight: '100dvh',
  marginInline: 'auto',
  padding: theme.spacing(3, 4, 6),

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2.5, 3, 5),
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 2, 4),
  },
}));

export const BrandHeader = styled('header')(({ theme }) => ({
  minHeight: theme.spacing(9),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(3),
  paddingBottom: theme.spacing(2.5),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    minHeight: 0,
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: theme.spacing(1.5),
    paddingBottom: theme.spacing(2),
  },
}));

export const BrandLogos = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  minWidth: 0,

  [theme.breakpoints.down('sm')]: {
    width: '100%',
    gap: theme.spacing(1),
  },
}));

export const LogoFrame = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: theme.spacing(21),
  height: theme.spacing(6.5),
  flex: '0 1 auto',
  overflow: 'hidden',
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('md')]: {
    width: theme.spacing(18),
    height: theme.spacing(5.75),
  },

  [theme.breakpoints.down('sm')]: {
    flex: '1 1 0',
    width: 'auto',
    maxWidth: theme.spacing(18),
    height: theme.spacing(5),
  },
}));

export const LogoImage = styled(Image)(() => ({
  objectFit: 'contain',
  objectPosition: 'left center',
}));

export const HeaderAccount = styled(Box)(({ theme }) => ({
  minWidth: 0,
  textAlign: 'right',

  [theme.breakpoints.down('sm')]: {
    textAlign: 'left',
  },
}));

export const HeaderAccountLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const HeaderAccountValue = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(0.25),
  fontWeight: theme.typography.fontWeightSemiBold,
  color: theme.vars.palette.text.primary,
  overflowWrap: 'anywhere',
}));

export const WelcomeBand = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(0, 0.86fr) minmax(${theme.spacing(52.5)}, 1.14fr)`,
  gap: theme.spacing(5),
  alignItems: 'stretch',
  paddingBlock: theme.spacing(5),

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: `minmax(0, 0.9fr) minmax(${theme.spacing(45)}, 1.1fr)`,
    gap: theme.spacing(3.5),
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    paddingBlock: theme.spacing(4),
  },

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(3),
    paddingBlock: theme.spacing(3),
  },
}));

export const WelcomeCopy = styled(Box)(({ theme }) => ({
  alignSelf: 'center',
  maxWidth: theme.spacing(69),
  paddingBlock: theme.spacing(2),

  [theme.breakpoints.down('md')]: {
    maxWidth: theme.spacing(82),
    paddingBlock: 0,
  },
}));

export const WelcomeTitle = styled('h1')(({ theme }) => ({
  ...theme.typography.display,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const WelcomeText = styled(Typography)(({ theme }) => ({
  ...theme.typography.bodyLarge,
  maxWidth: theme.spacing(64),
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.body1,
  },
}));

export const WelcomeHint = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(58),
  marginTop: theme.spacing(2.5),
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const PhotoStage = styled(Box)(({ theme }) => ({
  minHeight: theme.spacing(32),
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.65fr)',
  gap: theme.spacing(1.25),
  overflow: 'hidden',
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.primary.main,

  [theme.breakpoints.down('md')]: {
    minHeight: theme.spacing(27),
  },

  [theme.breakpoints.down('sm')]: {
    minHeight: theme.spacing(22),
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
    gap: theme.spacing(0.75),
  },
}));

export const PhotoCell = styled(Box)(() => ({
  position: 'relative',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
}));

export const PhotoImage = styled(Image)(() => ({
  objectFit: 'cover',
}));

export const PhotoCaption = styled(Box)(({ theme }) => ({
  position: 'absolute',
  insetInlineStart: theme.spacing(2),
  insetBlockEnd: theme.spacing(2),
  maxWidth: theme.spacing(33),
  padding: theme.spacing(1.25, 1.5),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('sm')]: {
    insetInlineStart: theme.spacing(1),
    insetBlockEnd: theme.spacing(1),
    maxWidth: theme.spacing(27),
    padding: theme.spacing(1, 1.25),
  },
}));

export const PhotoCaptionTitle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.vars.palette.primary.main,
}));

export const PhotoCaptionText = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  marginTop: theme.spacing(0.25),
  color: theme.vars.palette.text.secondary,
}));

export const SetupWorkspace = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: `minmax(${theme.spacing(28.75)}, 0.34fr) minmax(0, 0.66fr)`,
  minHeight: theme.spacing(55),
  overflow: 'hidden',
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.surface,
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    minHeight: 0,
  },
}));

export const JourneyPane = styled('aside')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  padding: theme.spacing(4),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(3.5),
  },

  [theme.breakpoints.down('md')]: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: theme.spacing(3),
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2.5),
    padding: theme.spacing(3, 2.5),
  },
}));

export const JourneyIntro = styled(Box)(() => ({
  minWidth: 0,
}));

export const JourneyTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h3,
  margin: 0,
  color: 'inherit',
}));

export const JourneyText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(1),
  color: 'inherit',
  opacity: 0.76,
}));

export const StageList = styled(Box)(({ theme }) => ({
  display: 'grid',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('md')]: {
    alignSelf: 'end',
  },
}));

export const StageRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$active' && prop !== '$complete',
})<{ $active: boolean; $complete: boolean }>(({ theme, $active, $complete }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: theme.spacing(2),
  minHeight: theme.spacing(7),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.primary.contrastText,
  opacity: $active || $complete ? 1 : 0.5,
}));

export const StageName = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  fontWeight: theme.typography.fontWeightSemiBold,
  color: 'inherit',
}));

export const StageState = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: 'inherit',
  opacity: 0.74,
}));

export const AccountSummary = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  marginTop: 'auto',
  paddingTop: theme.spacing(3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.contrastText,

  [theme.breakpoints.down('md')]: {
    gridColumn: '1 / -1',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    marginTop: 0,
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    paddingTop: theme.spacing(2.5),
  },
}));

export const SummaryItem = styled(Box)(() => ({
  minWidth: 0,
}));

export const SummaryLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: 'inherit',
  opacity: 0.64,
}));

export const SummaryValue = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(0.25),
  fontWeight: theme.typography.fontWeightSemiBold,
  color: 'inherit',
  overflowWrap: 'anywhere',
}));

export const FormPane = styled('main')(({ theme }) => ({
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(5, 6),
  backgroundColor: theme.vars.palette.background.paper,

  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(4.5, 5),
  },

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3.5, 2.5),
  },
}));

export const FormRegion = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: theme.spacing(72),
  marginInline: 'auto',
}));

export const FormTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h2,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const FormDescription = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  maxWidth: theme.spacing(64),
  marginBlock: theme.spacing(1.5, 4),
  color: theme.vars.palette.text.secondary,
}));

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.25),
}));

export const Field = styled(TextField)(() => ({}));
export const PasswordAdornment = styled(InputAdornment)(() => ({}));
export const PasswordToggle = styled(IconButton)(() => ({}));

export const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginTop: theme.spacing(1.5),

  [theme.breakpoints.down('sm')]: {
    alignItems: 'stretch',
    flexDirection: 'column-reverse',
  },
}));

export const PrimaryButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.75),
  minWidth: theme.spacing(22),

  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

export const SignOutButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.secondary,

  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));
