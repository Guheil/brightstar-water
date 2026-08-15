import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1.75),
  },
}));

export const ErrorRegion = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
}));

export const Field = styled(TextField)(() => ({}));
export const PasswordAdornment = styled(InputAdornment)(() => ({}));

export const PasswordToggle = styled(IconButton)(({ theme }) => ({
  width: theme.spacing(5.5),
  height: theme.spacing(5.5),
  color: theme.vars.palette.text.secondary,

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
  },
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(6),
  marginTop: theme.spacing(0.5),
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,

  '&:hover': {
    backgroundColor: theme.vars.palette.primary.dark,
  },
}));

export const FormLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginTop: theme.spacing(0.5),

  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
}));

export const TextLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const DemoSection = styled('section')(({ theme }) => ({
  marginTop: theme.spacing(5),
  paddingTop: theme.spacing(3),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(4),
    paddingTop: theme.spacing(2.5),
  },
}));

export const DemoHeader = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.5),
}));

export const DemoTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const DemoIntro = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const DemoList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
}));

export const DemoRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.5),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
    paddingBlock: theme.spacing(1.25),
  },
}));

export const DemoCopy = styled(Box)({
  minWidth: 0,
});

export const DemoRole = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.vars.palette.text.primary,
}));

export const DemoEmail = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(0.25),
  overflowWrap: 'anywhere',
  color: theme.vars.palette.text.secondary,
}));

export const DemoUseButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,

  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    paddingInline: theme.spacing(1.5),
  },
}));

export const PrototypeNotice = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  marginTop: theme.spacing(2),
  color: theme.vars.palette.text.secondary,
}));
