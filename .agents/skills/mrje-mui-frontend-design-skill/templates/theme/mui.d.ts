import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    gas: Palette['primary'];
    water: Palette['primary'];
  }

  interface PaletteOptions {
    gas?: PaletteOptions['primary'];
    water?: PaletteOptions['primary'];
  }

  interface Theme {
    layout: {
      maxContentWidth: number;
      desktopGutter: number;
      tabletGutter: number;
      mobileGutter: number;
    };
  }

  interface ThemeOptions {
    layout?: {
      maxContentWidth?: number;
      desktopGutter?: number;
      tabletGutter?: number;
      mobileGutter?: number;
    };
  }
}
