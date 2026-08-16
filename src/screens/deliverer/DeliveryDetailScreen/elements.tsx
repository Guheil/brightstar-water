import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

interface ToneProps {
  $tone: 'gas' | 'water' | 'mixed';
}

export const Root = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
}));

export const DeliveryHero = styled('section', {
  shouldForwardProp: (prop) => prop !== '$tone',
})<ToneProps>(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(3),
  alignItems: 'end',
  paddingBlock: theme.spacing(2.5, 3),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  },
}));

export const HeroReference = styled(Typography)(({ theme }) => ({
  ...theme.typography.h2,
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightBold,
}));

export const HeroMeta = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  marginTop: theme.spacing(0.5),
  color: theme.vars.palette.text.secondary,
}));

export const HeroAmount = styled(Box)(({ theme }) => ({
  textAlign: 'right',

  [theme.breakpoints.down('sm')]: {
    textAlign: 'left',
  },
}));

export const HeroAmountValue = styled('strong')(({ theme }) => ({
  ...theme.typography.h2,
  display: 'block',
  color: theme.vars.palette.primary.main,
  fontVariantNumeric: 'tabular-nums',
}));

export const HeroAmountLabel = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const DetailGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.2fr) minmax(18rem, 0.8fr)',
  gap: theme.spacing(5),
  alignItems: 'start',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const Column = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
}));

export const Section = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.25),
  paddingBlock: theme.spacing(2.25),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const Strong = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const Text = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const UtilityActions = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const UtilityLink = styled('a')(({ theme }) => ({
  ...theme.typography.button,
  minHeight: theme.spacing(6),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.75),
  paddingInline: theme.spacing(1.5),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
  color: theme.vars.palette.text.primary,
  textDecoration: 'none',
  backgroundColor: theme.vars.palette.background.paper,

  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  '& svg': {
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
}));

export const UtilityButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6),
  borderColor: theme.vars.palette.divider,
  color: theme.vars.palette.text.primary,

  '& svg': {
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
}));

export const DeliveryNote = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.neutral.light,
}));

export const Items = styled('ul')(({ theme }) => ({
  margin: 0,
  padding: 0,
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  listStyle: 'none',
}));

export const Item = styled('li')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.25),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const ActionPanel = styled('section')(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(12),
  display: 'grid',
  gap: theme.spacing(1.5),
  paddingBlock: theme.spacing(2.5),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.primary.main,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.background.paper,
  color: theme.vars.palette.text.primary,

  [theme.breakpoints.down('md')]: {
    position: 'static',
    marginBlockEnd: theme.spacing(1),
  },
}));

export const ActionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.primary.main,
}));

export const ActionCopy = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6.25),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const FailureLink = styled(AppLink)(({ theme }) => ({
  minHeight: theme.spacing(6),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(2),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.error.main,
  borderRadius: theme.radii.control,
  color: theme.vars.palette.error.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
}));

export const CashField = styled(TextField)(() => ({}));
export const NoteField = styled(TextField)(() => ({}));

export const UploadLabel = styled('label')(({ theme }) => ({
  ...theme.typography.button,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  paddingInline: theme.spacing(2),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
  color: theme.vars.palette.text.primary,
  cursor: 'pointer',
}));

export const UploadInput = styled('input')({
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
});

export const ProofPreview = styled('img')(({ theme }) => ({
  width: '100%',
  maxHeight: theme.spacing(26),
  objectFit: 'cover',
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  backgroundColor: theme.vars.palette.neutral.light,
}));

export const Result = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));
