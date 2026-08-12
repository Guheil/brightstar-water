import type { TypographyOptions } from '@mui/material/styles/createTypography';

export const typography: TypographyOptions = {
  fontFamily: 'var(--font-interface)',

  h1: {
    fontSize: '3rem',
    fontWeight: 600,
    lineHeight: 1.1,
  },

  h2: {
    fontSize: '2.25rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },

  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.25,
  },

  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },

  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.35,
  },

  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },

  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.55,
  },

  button: {
    fontWeight: 600,
    textTransform: 'none',
  },
};
