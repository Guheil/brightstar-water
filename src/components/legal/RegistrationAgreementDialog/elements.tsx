import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import type { DocumentNavButtonProps } from './interface';

export const AgreementDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: theme.spacing(96),
    maxHeight: `calc(100dvh - ${theme.spacing(4)})`,
    margin: theme.spacing(2),
    borderRadius: theme.radii.surface,
    boxShadow: theme.shadows[12],
    backgroundColor: theme.vars.palette.background.paper,
  },

  [theme.breakpoints.down('sm')]: {
    '& .MuiDialog-paper': {
      maxHeight: `calc(100dvh - ${theme.spacing(2)})`,
      margin: theme.spacing(1),
      borderRadius: theme.radii.control,
    },
  },
}));

export const AgreementTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(3.5, 4, 1),
  color: theme.vars.palette.primary.main,

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5, 2.5, 1),
  },
}));

export const TitleText = styled('span')(({ theme }) => ({
  ...theme.typography.h4,
  display: 'block',
}));

export const IntroText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(74),
  marginTop: theme.spacing(1),
  color: theme.vars.palette.text.secondary,
}));

export const AgreementContent = styled(DialogContent)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  padding: theme.spacing(2.5, 4, 3),

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 2.5, 2.5),
  },
}));

export const DocumentNav = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(1),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const DocumentNavButton = styled(Button, {
  shouldForwardProp: (prop) => !['$active', '$complete'].includes(String(prop)),
})<DocumentNavButtonProps>(({ theme, $active, $complete }) => ({
  minHeight: theme.spacing(5.5),
  justifyContent: 'space-between',
  padding: theme.spacing(1, 0.5),
  borderRadius: 0,
  borderBottomWidth: theme.spacing(0.25),
  borderBottomStyle: 'solid',
  borderBottomColor: $active
    ? theme.vars.palette.water.main
    : 'transparent',
  color: $active
    ? theme.vars.palette.text.primary
    : theme.vars.palette.text.secondary,
  fontWeight: $active || $complete
    ? theme.typography.fontWeightSemiBold
    : theme.typography.fontWeightMedium,

  '&:hover': {
    backgroundColor: theme.vars.palette.action.hover,
  },
}));

export const NavCompletion = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.success.main,
}));

export const DocumentHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
}));

export const DocumentTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const VersionText = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
  whiteSpace: 'nowrap',
}));

export const DocumentViewport = styled(Box)(({ theme }) => ({
  height: theme.spacing(38),
  overflowY: 'auto',
  overscrollBehavior: 'contain',
  scrollbarGutter: 'stable',
  padding: theme.spacing(0.5, 2.25, 2.5, 0),
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,

  '&:focus-visible': {
    outlineWidth: theme.spacing(0.25),
    outlineStyle: 'solid',
    outlineColor: theme.vars.palette.water.main,
    outlineOffset: theme.spacing(0.5),
  },

  [theme.breakpoints.down('sm')]: {
    height: theme.spacing(32),
    paddingInlineEnd: theme.spacing(1.5),
  },
}));

export const LegalSectionBlock = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2.5),

  '&:first-of-type': {
    marginTop: theme.spacing(1),
  },
}));

export const LegalSectionTitle = styled('h4')(({ theme }) => ({
  ...theme.typography.subtitle1,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const LegalParagraph = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const LegalList = styled('ul')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.75),
  margin: 0,
  paddingInlineStart: theme.spacing(2.5),
  color: theme.vars.palette.text.secondary,

  '& li': {
    ...theme.typography.body2,
    paddingInlineStart: theme.spacing(0.5),
  },
}));

export const DocumentEnd = styled(Box)(({ theme }) => ({
  ...theme.typography.caption,
  marginTop: theme.spacing(3),
  paddingTop: theme.spacing(2),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  color: theme.vars.palette.text.secondary,
}));

export const ReadInstruction = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const ConsentGroup = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  paddingTop: theme.spacing(0.5),
}));

export const ConsentItem = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.25),
}));

export const ConsentHint = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  marginInlineStart: theme.spacing(4),
  color: theme.vars.palette.text.secondary,
}));

export const ConsentControl = styled(FormControlLabel)(({ theme }) => ({
  alignItems: 'flex-start',
  margin: 0,
  color: theme.vars.palette.text.primary,

  '& .MuiFormControlLabel-label': {
    ...theme.typography.body2,
    paddingTop: theme.spacing(1.125),
  },

  '&.Mui-disabled .MuiFormControlLabel-label': {
    color: theme.vars.palette.text.disabled,
  },
}));

export const ConsentCheckbox = styled(Checkbox)(({ theme }) => ({
  marginInlineStart: theme.spacing(-1),
  color: theme.vars.palette.text.secondary,

  '&.Mui-checked': {
    color: theme.vars.palette.water.main,
  },
}));

export const AgreementActions = styled(DialogActions)(({ theme }) => ({
  gap: theme.spacing(1),
  padding: theme.spacing(2, 4, 3.5),
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,

  '& > :not(style) ~ :not(style)': {
    marginInlineStart: 0,
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 2.5, 2.5),
  },
}));

export const CancelButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.text.primary,
}));

export const AcceptButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  paddingInline: theme.spacing(2.5),
}));
