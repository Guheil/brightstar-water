import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';
import type { RegistrationStepProps } from './interface';

export const ProgressList = styled('ol')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: theme.spacing(1),
  margin: theme.spacing(0, 0, 3),
  padding: 0,
  listStyle: 'none',
}));

export const ProgressItem = styled('li', {
  shouldForwardProp: (prop) => !['$active', '$complete'].includes(String(prop)),
})<RegistrationStepProps>(({ theme, $active, $complete }) => ({
  ...theme.typography.body2,
  paddingBlock: theme.spacing(1),
  borderBottomWidth: theme.spacing(0.25),
  borderBottomStyle: 'solid',
  borderBottomColor: $active || $complete
    ? theme.vars.palette.water.main
    : theme.vars.palette.divider,
  color: $active
    ? theme.vars.palette.text.primary
    : theme.vars.palette.text.secondary,
  fontWeight: $active
    ? theme.typography.fontWeightBold
    : theme.typography.fontWeightMedium,

  [theme.breakpoints.down('sm')]: {
    ...theme.typography.caption,
    paddingInline: theme.spacing(0.25),
  },
}));

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const Field = styled(TextField)(() => ({}));

export const StepTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h5,
  margin: 0,
  color: theme.vars.palette.text.primary,
}));

export const StepText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(-1),
  color: theme.vars.palette.text.secondary,
}));

export const ActionRow = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(0.5),

  '& > :last-child': {
    justifySelf: 'end',
  },
}));

export const PrimaryButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  paddingInline: theme.spacing(2.5),
}));

export const SecondaryButton = styled(Button)(({ theme }) => ({
  minHeight: theme.spacing(5.5),
  paddingInline: theme.spacing(2),
  color: theme.vars.palette.text.primary,
}));


export const OtpCells = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: theme.spacing(52),
  display: 'grid',
  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
  gap: theme.spacing(1),
}));

export const OtpCell = styled('input')(({ theme }) => ({
  ...theme.typography.h5,
  boxSizing: 'border-box',
  width: '100%',
  minWidth: 0,
  height: theme.spacing(7),
  padding: 0,
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
  outline: 0,
  backgroundColor: theme.vars.palette.background.paper,
  color: theme.vars.palette.text.primary,
  textAlign: 'center',
  fontVariantNumeric: 'tabular-nums',
  transition: theme.transitions.create(['border-color', 'box-shadow'], {
    duration: theme.transitions.duration.shorter,
  }),

  '&:focus': {
    borderColor: theme.vars.palette.water.main,
    boxShadow: `0 0 0 ${theme.spacing(0.25)} ${theme.vars.palette.action.focus}`,
  },

  [theme.breakpoints.down('sm')]: {
    height: theme.spacing(6),
    fontSize: theme.typography.body1.fontSize,
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));

export const InlineActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export const FooterText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body2,
  marginTop: theme.spacing(2.5),
  color: theme.vars.palette.text.secondary,
}));

export const TextLink = styled(AppLink)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: theme.spacing(5.5),
  color: theme.vars.palette.primary.main,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const LegalReviewList = styled('ul')(({ theme }) => ({
  display: 'grid',
  margin: 0,
  padding: 0,
  listStyle: 'none',
  borderTopWidth: theme.spacing(0.125),
  borderTopStyle: 'solid',
  borderTopColor: theme.vars.palette.divider,
  borderBottomWidth: theme.spacing(0.125),
  borderBottomStyle: 'solid',
  borderBottomColor: theme.vars.palette.divider,
}));

export const LegalReviewRow = styled('li')(({ theme }) => ({
  minHeight: theme.spacing(6.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(1.25),

  '& + &': {
    borderTopWidth: theme.spacing(0.125),
    borderTopStyle: 'solid',
    borderTopColor: theme.vars.palette.divider,
  },
}));

export const LegalReviewText = styled(Typography)(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const LegalVersion = styled(Typography)(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
  whiteSpace: 'nowrap',
}));
