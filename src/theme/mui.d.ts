import type { CSSProperties } from "react";

import type { LayoutTokens } from "./layout";
import type { RadiusTokens } from "./shape";

declare module "@mui/material/styles" {
  interface CssThemeVariables {
    enabled: true;
  }

  interface Palette {
    gas: Palette["primary"];
    water: Palette["primary"];
    neutral: Palette["primary"];
  }

  interface PaletteOptions {
    gas?: PaletteOptions["primary"];
    water?: PaletteOptions["primary"];
    neutral?: PaletteOptions["primary"];
  }

  interface Theme {
    layout: LayoutTokens;
    radii: RadiusTokens;
  }

  interface ThemeOptions {
    layout?: LayoutTokens;
    radii?: RadiusTokens;
  }

  interface TypographyVariants {
    fontWeightSemiBold: CSSProperties["fontWeight"];
    display: CSSProperties;
    bodyLarge: CSSProperties;
  }

  interface TypographyVariantsOptions {
    fontWeightSemiBold?: CSSProperties["fontWeight"];
    display?: CSSProperties;
    bodyLarge?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    display: true;
    bodyLarge: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    gas: true;
    water: true;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    gas: true;
    water: true;
  }
}

declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides {
    gas: true;
    water: true;
  }
}

export {};
