import { alpha, darken, lighten } from "@mui/material/styles";
import type { PaletteOptions } from "@mui/material/styles";

/**
 * The only raw application colours in the codebase live here. Components must
 * consume their semantic equivalents from `theme.vars.palette`.
 */
export const paletteColors = {
  deepInk: "#0E2A36",
  mainText: "#17201D",
  mutedText: "#5E6965",
  warmCanvas: "#F7F5EF",
  surfaceWhite: "#FFFFFF",
  softNeutral: "#EEF1ED",
  border: "#D8DDD9",
  gas: "#B95418",
  water: "#1F6C8A",
  success: "#2E6B4F",
  danger: "#B23A34",
  warning: "#8A5A12",
} as const;

const semanticColour = (
  main: string,
  contrastText: string = paletteColors.surfaceWhite,
) => ({
  main,
  light: lighten(main, 0.18),
  dark: darken(main, 0.18),
  contrastText,
});

export const palette: PaletteOptions = {
  mode: "light",
  contrastThreshold: 4.5,
  tonalOffset: 0.18,
  primary: semanticColour(paletteColors.deepInk),
  secondary: semanticColour(paletteColors.water),
  gas: semanticColour(paletteColors.gas),
  water: semanticColour(paletteColors.water),
  neutral: semanticColour(
    paletteColors.softNeutral,
    paletteColors.mainText,
  ),
  success: semanticColour(paletteColors.success),
  warning: semanticColour(paletteColors.warning),
  error: semanticColour(paletteColors.danger),
  info: semanticColour(paletteColors.water),
  background: {
    default: paletteColors.warmCanvas,
    paper: paletteColors.surfaceWhite,
  },
  text: {
    primary: paletteColors.mainText,
    secondary: paletteColors.mutedText,
    disabled: alpha(paletteColors.mainText, 0.42),
  },
  divider: paletteColors.border,
  action: {
    active: paletteColors.deepInk,
    hover: alpha(paletteColors.deepInk, 0.05),
    selected: alpha(paletteColors.deepInk, 0.09),
    disabled: alpha(paletteColors.mainText, 0.38),
    disabledBackground: alpha(paletteColors.mainText, 0.1),
    focus: alpha(paletteColors.water, 0.16),
  },
};
