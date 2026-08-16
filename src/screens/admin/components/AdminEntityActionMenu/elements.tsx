import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';

export const ActionTrigger = styled(IconButton)(({ theme }) => ({
  width: theme.spacing(5.5),
  height: theme.spacing(5.5),
  borderWidth: theme.spacing(0.125),
  borderStyle: 'solid',
  borderColor: theme.vars.palette.divider,
  borderRadius: theme.radii.control,
  color: theme.vars.palette.text.primary,
  backgroundColor: theme.vars.palette.background.paper,
  transition: theme.transitions.create(['border-color', 'background-color']),

  '&:hover, &:focus-visible': {
    borderColor: theme.vars.palette.primary.main,
    backgroundColor: theme.vars.palette.neutral.light,
  },
}));

export const ActionMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    minWidth: theme.spacing(26),
    borderWidth: theme.spacing(0.125),
    borderStyle: 'solid',
    borderColor: theme.vars.palette.divider,
    borderRadius: theme.radii.surface,
    boxShadow: theme.shadows[5],
  },
}));

export const ActionMenuItem = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== '$danger',
})<{ $danger?: boolean }>(({ theme, $danger }) => ({
  ...theme.typography.body2,
  minHeight: theme.spacing(5.5),
  color: $danger ? theme.vars.palette.error.main : theme.vars.palette.text.primary,
}));

export const ActionIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: `${theme.spacing(4)} !important`,
  color: 'inherit',
  '& svg': { width: theme.spacing(2.25), height: theme.spacing(2.25) },
}));

export const ActionText = styled(ListItemText)(() => ({}));
