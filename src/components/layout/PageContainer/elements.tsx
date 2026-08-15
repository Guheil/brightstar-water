import { styled } from '@mui/material/styles';

export const Root = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: theme.layout.maxContentWidth,
  marginInline: 'auto',
  paddingInline: theme.layout.desktopGutter,

  [theme.breakpoints.down('lg')]: {
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('sm')]: {
    paddingInline: theme.layout.mobileGutter,
  },
}));
