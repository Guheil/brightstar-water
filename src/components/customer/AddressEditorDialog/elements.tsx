import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
export const EditorDialog = styled(Dialog)(({ theme }) => ({ '& .MuiDialog-paper': { width: 'min(58rem, calc(100% - 32px))', maxWidth: '58rem', maxHeight: 'calc(100dvh - 32px)', borderRadius: theme.radii.surface } }));
export const EditorTitle = styled(DialogTitle)(({ theme }) => ({ ...theme.typography.h2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing(2), padding: theme.spacing(3, 3, 2) }));
export const EditorContent = styled(DialogContent)(({ theme }) => ({ padding: theme.spacing(1, 3, 3), [theme.breakpoints.down('sm')]: { padding: theme.spacing(1, 2, 2) } }));
export const CloseButton = styled(IconButton)(({ theme }) => ({ flexShrink: 0, color: theme.vars.palette.text.secondary }));
