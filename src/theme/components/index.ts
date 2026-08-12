import type { Components, Theme } from "@mui/material/styles";

import { buttonComponents } from "./button";
import { dialogComponents } from "./dialog";
import { tableComponents } from "./table";
import { textFieldComponents } from "./textField";

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      html: {
        minHeight: "100%",
        backgroundColor: theme.vars.palette.background.default,
      },
      body: {
        minHeight: "100dvh",
        margin: 0,
        backgroundColor: theme.vars.palette.background.default,
        color: theme.vars.palette.text.primary,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      },
      "*, *::before, *::after": {
        boxSizing: "border-box",
      },
      "button, input, textarea, select": {
        font: "inherit",
      },
      "img, picture, video, canvas": {
        display: "block",
        maxWidth: "100%",
      },
      a: {
        color: "inherit",
        textDecorationThickness: "from-font",
        textUnderlineOffset: "0.16em",
      },
      "@media (prefers-reduced-motion: reduce)": {
        "*, *::before, *::after": {
          scrollBehavior: "auto !important",
          animationDuration: "0.01ms !important",
          animationIterationCount: "1 !important",
          transitionDuration: "0.01ms !important",
        },
      },
    }),
  },
  MuiTypography: {
    defaultProps: {
      variantMapping: {
        display: "h1",
        bodyLarge: "p",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
  MuiLink: {
    defaultProps: {
      underline: "hover",
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.spacing(0.25),
        "&:focus-visible": {
          outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.water.main}`,
          outlineOffset: theme.spacing(0.25),
        },
      }),
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.radii.control,
      }),
    },
  },
  ...buttonComponents,
  ...textFieldComponents,
  ...tableComponents,
  ...dialogComponents,
};
