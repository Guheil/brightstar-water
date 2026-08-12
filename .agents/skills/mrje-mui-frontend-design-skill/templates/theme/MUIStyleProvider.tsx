'use client';

import type { ReactNode } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import theme from './theme';

interface MUIStyleProviderProps {
  children: ReactNode;
}

export default function MUIStyleProvider({
  children,
}: MUIStyleProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
