import type { Components, Theme } from '@mui/material/styles';

export const buttonTheme: Components<Theme>['MuiButton'] = {
  defaultProps: {
    disableElevation: true,
  },

  styleOverrides: {
    root: ({ theme }) => ({
      textTransform: 'none',
      borderRadius: theme.shape.borderRadius,
    }),
  },
};
