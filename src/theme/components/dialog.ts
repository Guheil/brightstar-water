import type { Components, Theme } from "@mui/material/styles";

export const dialogComponents: Pick<
  Components<Theme>,
  "MuiDialog" | "MuiDialogTitle" | "MuiDialogContent" | "MuiDialogActions"
> = {
  MuiDialog: {
    styleOverrides: {
      paper: ({ theme }) => ({
        margin: theme.spacing(2),
        borderRadius: theme.radii.surface,
        backgroundColor: theme.vars.palette.background.paper,
        boxShadow: theme.shadows[16],
        [theme.breakpoints.up("sm")]: {
          margin: theme.spacing(4),
        },
      }),
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: ({ theme }) => ({
        ...theme.typography.h4,
        padding: theme.spacing(3, 3, 1.5),
      }),
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(1.5, 3, 3),
        "&.MuiDialogContent-dividers": {
          borderColor: theme.vars.palette.divider,
        },
      }),
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: ({ theme }) => ({
        gap: theme.spacing(1),
        padding: theme.spacing(2, 3, 3),
      }),
    },
  },
};
