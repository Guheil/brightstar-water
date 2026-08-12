import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const AccountLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingInline: theme.spacing(1.5),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightMedium,

  '&:hover': {
    backgroundColor: theme.vars.palette.neutral.light,
  },

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
  },
}));
