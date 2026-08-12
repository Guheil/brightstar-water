import { styled } from '@mui/material/styles';

export const ShellRoot = styled('div')(({ theme }) => ({
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: theme.spacing(10),
  backgroundColor: theme.vars.palette.background.default,
  color: theme.vars.palette.text.primary,
}));

export const PrototypeBanner = styled('div')(({ theme }) => ({
  backgroundColor: theme.vars.palette.neutral.main,
  color: theme.vars.palette.neutral.contrastText,
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
}));

export const PrototypeBannerInner = styled('p')(({ theme }) => ({
  width: '100%',
  maxWidth: theme.layout.maxContentWidth,
  margin: '0 auto',
  padding: theme.spacing(1, 4),
  fontSize: theme.typography.caption.fontSize,
  lineHeight: theme.typography.caption.lineHeight,
  textAlign: 'center',

  [theme.breakpoints.down('lg')]: {
    paddingInline: theme.layout.tabletGutter,
  },

  [theme.breakpoints.down('sm')]: {
    paddingInline: theme.layout.mobileGutter,
    textAlign: 'left',
  },
}));

export const Main = styled('main')({
  flex: 1,
  minWidth: 0,
});
