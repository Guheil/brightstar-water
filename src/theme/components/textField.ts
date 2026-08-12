import type { Components, Theme } from "@mui/material/styles";

export const textFieldComponents: Pick<
  Components<Theme>,
  "MuiTextField" | "MuiOutlinedInput" | "MuiInputLabel" | "MuiFormHelperText"
> = {
  MuiTextField: {
    defaultProps: {
      variant: "outlined",
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        minHeight: theme.spacing(6),
        borderRadius: theme.radii.control,
        backgroundColor: theme.vars.palette.background.paper,
        transition: theme.transitions.create(
          ["background-color", "border-color", "box-shadow"],
          { duration: theme.transitions.duration.shorter },
        ),
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.vars.palette.text.secondary,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderWidth: theme.spacing(0.25),
          borderColor: theme.vars.palette.primary.main,
        },
        "&.Mui-error .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.vars.palette.error.main,
        },
      }),
      input: ({ theme }) => ({
        padding: theme.spacing(1.5, 1.75),
      }),
      notchedOutline: ({ theme }) => ({
        borderColor: theme.vars.palette.divider,
      }),
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.vars.palette.text.secondary,
        "&.Mui-focused": {
          color: theme.vars.palette.primary.main,
        },
      }),
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: ({ theme }) => ({
        ...theme.typography.caption,
        marginInline: 0,
      }),
    },
  },
};
