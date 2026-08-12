'use client';

import { createTheme, responsiveFontSizes } from '@mui/material/styles';

import { breakpoints } from './breakpoints';
import { layout } from './layout';
import { palette } from './palette';
import { shape } from './shape';
import { spacing } from './spacing';
import { typography } from './typography';

let theme = createTheme({
  cssVariables: true,
  palette: {
    ...palette,

    gas: {
      main: '#B95418',
      light: '#CE7749',
      dark: '#883B11',
      contrastText: '#FFFFFF',
    },

    water: {
      main: '#1F6C8A',
      light: '#4389A3',
      dark: '#164D63',
      contrastText: '#FFFFFF',
    },
  },
  typography,
  breakpoints,
  spacing,
  shape,
  layout,
});

theme = responsiveFontSizes(theme);

export default theme;
