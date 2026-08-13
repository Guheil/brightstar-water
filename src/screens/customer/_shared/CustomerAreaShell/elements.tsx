import { styled } from '@mui/material/styles';

export const ShellRoot = styled('div')(({ theme }) => ({
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  paddingTop: theme.spacing(10),
  backgroundColor: theme.vars.palette.background.default,
  color: theme.vars.palette.text.primary,
}));

export const Main = styled('main')({
  flex: 1,
  minWidth: 0,
});
