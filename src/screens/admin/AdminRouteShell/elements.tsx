import { styled } from '@mui/material/styles';
import AppLink from '@/components/ui/AppLink';

export const AccountLink = styled(AppLink)(({ theme }) => ({
  ...theme.typography.body2,
  minWidth: theme.spacing(5.5),
  minHeight: theme.spacing(5.5),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.75),
  paddingInline: theme.spacing(1.25),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
  backgroundColor: theme.vars.palette.background.paper,
  color: theme.vars.palette.text.primary,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  transition: theme.transitions.create(['background-color', 'border-color'], {
    duration: theme.transitions.duration.shorter,
  }),

  '&:hover, &:focus-visible': {
    borderColor: theme.vars.palette.primary.main,
    backgroundColor: theme.vars.palette.neutral.light,
  },

  '& svg': {
    width: theme.spacing(2.25),
    height: theme.spacing(2.25),
  },

  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
}));
