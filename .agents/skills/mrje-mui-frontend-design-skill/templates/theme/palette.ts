import type { PaletteOptions } from '@mui/material/styles';

export const palette: PaletteOptions = {
  mode: 'light',

  primary: {
    main: '#0E2A36',
    light: '#244753',
    dark: '#081B23',
    contrastText: '#FFFFFF',
  },

  secondary: {
    main: '#1F6C8A',
    light: '#4389A3',
    dark: '#164D63',
    contrastText: '#FFFFFF',
  },

  background: {
    default: '#F7F5EF',
    paper: '#FFFFFF',
  },

  text: {
    primary: '#17201D',
    secondary: '#5E6965',
  },

  divider: '#D8DDD9',

  success: {
    main: '#2E6B4F',
  },

  warning: {
    main: '#A85D16',
  },

  error: {
    main: '#B23A34',
  },
};
