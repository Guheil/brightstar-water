import type { TypographyVariantsOptions } from "@mui/material/styles";

export const fontVariables = {
  interface: "--font-ibm-plex-sans",
  display: "--font-ibm-plex-serif",
} as const;

export const interfaceFontFamily = `var(${fontVariables.interface}), "IBM Plex Sans", "Segoe UI", sans-serif`;
export const displayFontFamily = `var(${fontVariables.display}), "IBM Plex Serif", Georgia, serif`;

export const typography: TypographyVariantsOptions = {
  fontFamily: interfaceFontFamily,
  fontSize: 16,
  htmlFontSize: 16,
  fontWeightLight: 400,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  allVariants: {
    fontFamily: interfaceFontFamily,
  },
  display: {
    fontFamily: displayFontFamily,
    fontSize: "clamp(2.25rem, 1.85rem + 2vw, 3.75rem)",
    fontWeight: 600,
    lineHeight: 1.06,
    letterSpacing: "-0.025em",
  },
  h1: {
    fontSize: "clamp(2rem, 1.7rem + 1.5vw, 3rem)",
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontSize: "clamp(1.625rem, 1.4rem + 1.1vw, 2.25rem)",
    fontWeight: 700,
    lineHeight: 1.18,
    letterSpacing: "-0.015em",
  },
  h3: {
    fontSize: "clamp(1.375rem, 1.25rem + 0.55vw, 1.625rem)",
    fontWeight: 600,
    lineHeight: 1.24,
    letterSpacing: "-0.01em",
  },
  h4: {
    fontSize: "1.25rem",
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h5: {
    fontSize: "1.125rem",
    fontWeight: 600,
    lineHeight: 1.35,
  },
  h6: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.4,
  },
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 600,
    lineHeight: 1.45,
  },
  bodyLarge: {
    fontSize: "1.125rem",
    fontWeight: 400,
    lineHeight: 1.65,
  },
  body1: {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: "0.875rem",
    fontWeight: 400,
    lineHeight: 1.55,
  },
  caption: {
    fontSize: "0.8125rem",
    fontWeight: 400,
    lineHeight: 1.45,
  },
  button: {
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: "0.005em",
    textTransform: "none",
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
};
