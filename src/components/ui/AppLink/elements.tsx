import { styled } from '@mui/material/styles';
import Link from 'next/link';

export const StyledAppLink = styled(Link)(({ theme }) => ({
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: theme.radii.control,

  '&:focus-visible': {
    outlineColor: theme.vars.palette.primary.main,
    outlineOffset: theme.spacing(0.25),
    outlineStyle: 'solid',
    outlineWidth: theme.spacing(0.25),
  },
}));
