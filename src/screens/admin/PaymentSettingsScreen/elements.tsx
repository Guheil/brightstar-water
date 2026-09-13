import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: theme.spacing(112),
}));

export const SettingsForm = styled('form')(({ theme }) => ({
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
  maxWidth: theme.spacing(76),
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const AvailabilityControl = styled(FormControlLabel)(({ theme }) => ({
  gridColumn: '1 / -1',
  minHeight: theme.spacing(7),
  margin: 0,
  paddingInline: theme.spacing(1.5),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
  color: theme.vars.palette.text.primary,
}));

export const AvailabilitySwitch = styled(Switch)(() => ({}));
export const Field = styled(TextField)(() => ({}));

export const QrArea = styled(Box)(({ theme }) => ({
  gridColumn: '1 / -1',
  display: 'grid',
  gridTemplateColumns: `minmax(0, ${theme.spacing(36)}) minmax(0, 1fr)`,
  gap: theme.spacing(3),
  alignItems: 'start',

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const QrPreviewFrame = styled(Box)(({ theme }) => ({
  display: 'grid',
  placeItems: 'center',
  minHeight: theme.spacing(30),
  padding: theme.spacing(2),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.background.paper,
}));

export const QrPreview = styled('img')(({ theme }) => ({
  display: 'block',
  width: '100%',
  maxWidth: theme.spacing(32),
  aspectRatio: '1',
  objectFit: 'contain',
}));

export const QrEmpty = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(28),
  margin: 0,
  color: theme.vars.palette.text.secondary,
  textAlign: 'center',
}));

export const QrControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
}));

export const QrHelp = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(58),
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const ButtonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export const UploadButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
})) as typeof Button;

export const RemoveButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
}));

export const HiddenFileInput = styled('input')(({ theme }) => ({
  position: 'absolute',
  width: theme.spacing(0.125),
  height: theme.spacing(0.125),
  padding: 0,
  margin: 0,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}));

export const FormActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  paddingBlockEnd: theme.spacing(4),
}));

export const SaveButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
}));
