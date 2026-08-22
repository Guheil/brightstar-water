import Image from 'next/image';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  maxWidth: theme.spacing(118),
  flexDirection: 'column',
  gap: theme.spacing(3.5),
}));

export const ProductForm = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
}));

export const FormSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(2.5),
  paddingBlock: theme.spacing(3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const SectionHeading = styled(Box)(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h4,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const SectionCopy = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(78),
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const Field = styled(TextField)(() => ({}));
export const FullField = styled(Field)({ gridColumn: '1 / -1' });
export const Option = styled(MenuItem)(() => ({}));

export const ChoiceControl = styled(FormControl)(({ theme }) => ({
  gridColumn: '1 / -1',
  gap: theme.spacing(1),
}));

export const ChoiceLabel = styled(FormLabel)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const StoreChoices = styled(RadioGroup)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(1),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const StoreChoice = styled(FormControlLabel)(({ theme }) => ({
  minHeight: theme.spacing(7),
  margin: 0,
  paddingInline: theme.spacing(1.5),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
}));

export const ChoiceRadio = styled(Radio)(() => ({}));

export const SizeChoices = styled(ToggleButtonGroup)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),

  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    borderWidth: theme.spacing(0.125),
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
    borderRadius: theme.radii.control,
  },
}));

export const SizeChoice = styled(ToggleButton)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  minWidth: theme.spacing(10),
  color: theme.vars.palette.text.primary,
}));

export const ReadOnlyPair = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(1.5),
  gridColumn: '1 / -1',

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ReadOnlyItem = styled(Box)(({ theme }) => ({
  minHeight: theme.spacing(7),
  padding: theme.spacing(1.5),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
}));

export const ReadOnlyLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  display: 'block',
  color: theme.vars.palette.text.secondary,
}));

export const ReadOnlyValue = styled('strong')(({ theme }) => ({
  ...theme.typography.body2,
  display: 'block',
  marginBlockStart: theme.spacing(0.25),
  color: theme.vars.palette.text.primary,
}));

export const SuggestedNameRow = styled(Box)(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const SuggestedName = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const SuggestionButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(4.5),
}));

export const FeaturedControl = styled(FormControlLabel)({
  gridColumn: '1 / -1',
  margin: 0,
});
export const FeaturedCheckbox = styled(Checkbox)(() => ({}));

export const UploadArea = styled(Box)(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: `minmax(0, ${theme.spacing(34)}) minmax(0, 1fr)`,
  gap: theme.spacing(2.5),
  alignItems: 'stretch',

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const ImagePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: theme.spacing(26),
  overflow: 'hidden',
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.media,
  backgroundColor: theme.vars.palette.background.default,
}));

export const PreviewImage = styled(Image)({
  objectFit: 'cover',
});

export const UploadCopy = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: theme.spacing(1),
  minHeight: theme.spacing(26),
  padding: theme.spacing(2.5),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'dashed',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
}));

export const UploadTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h6,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const UploadText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const UploadButton = styled(Button)(({ theme }) => ({
  alignSelf: 'flex-start',
  minHeight: theme.spacing(5.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const HiddenFileInput = styled('input')({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

export const FileMeta = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const AdvancedDetails = styled('details')(({ theme }) => ({
  gridColumn: '1 / -1',
  paddingBlock: theme.spacing(1.5),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const AdvancedSummary = styled('summary')(({ theme }) => ({
  ...theme.typography.body2,
  cursor: 'pointer',
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const AdvancedGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(2),
  marginBlockStart: theme.spacing(2),

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const FormActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  paddingBlockEnd: theme.spacing(4),
}));

export const PublishButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': { backgroundColor: theme.vars.palette.primary.dark },
}));

export const DraftButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,
  borderColor: theme.vars.palette.divider,
}));

export const CancelLink = styled(AppLink)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: theme.spacing(2),
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightMedium,
  textDecoration: 'none',
}));

export const EmptyActionLink = styled(AppLink)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  paddingInline: theme.spacing(2),
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
}));
