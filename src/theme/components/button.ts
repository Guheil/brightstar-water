import type { Components, Theme } from "@mui/material/styles";

export const buttonComponents: Pick<
  Components<Theme>,
  "MuiButton" | "MuiIconButton"
> = {
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        ...theme.typography.button,
        minHeight: theme.spacing(5.5),
        borderRadius: theme.radii.control,
        paddingInline: theme.spacing(2),
        textTransform: "none",
        transition: theme.transitions.create(
          ["background-color", "border-color", "color"],
          { duration: theme.transitions.duration.shorter },
        ),
        "&.Mui-focusVisible": {
          outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.water.main}`,
          outlineOffset: theme.spacing(0.25),
        },
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        minWidth: theme.spacing(5.5),
        minHeight: theme.spacing(5.5),
        borderRadius: theme.radii.control,
        transition: theme.transitions.create(
          ["background-color", "color"],
          { duration: theme.transitions.duration.shorter },
        ),
        "&.Mui-focusVisible": {
          outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.water.main}`,
          outlineOffset: theme.spacing(0.25),
        },
      }),
    },
  },
};
