import type { Components, Theme } from "@mui/material/styles";

export const tableComponents: Pick<
  Components<Theme>,
  "MuiTable" | "MuiTableCell" | "MuiTableRow"
> = {
  MuiTable: {
    defaultProps: {
      size: "medium",
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        padding: theme.spacing(1.5, 2),
        borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
        color: theme.vars.palette.text.primary,
      }),
      head: ({ theme }) => ({
        ...theme.typography.subtitle2,
        backgroundColor: theme.vars.palette.neutral.main,
        color: theme.vars.palette.text.primary,
      }),
      body: ({ theme }) => ({
        ...theme.typography.body2,
      }),
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition: theme.transitions.create("background-color", {
          duration: theme.transitions.duration.shorter,
        }),
        "&.MuiTableRow-hover:hover": {
          backgroundColor: theme.vars.palette.action.hover,
        },
        "&.Mui-selected": {
          backgroundColor: theme.vars.palette.action.selected,
        },
      }),
    },
  },
};
