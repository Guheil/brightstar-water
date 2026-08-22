import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

export const Card = styled('article')(({ theme }) => ({ display: 'grid', gap: theme.spacing(2), padding: theme.spacing(3, 0), borderBottom: `1px solid ${theme.vars.palette.divider}` }));
export const Header = styled(Box)(({ theme }) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: theme.spacing(2), flexWrap: 'wrap' }));
export const LabelGroup = styled(Box)(({ theme }) => ({ display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), flexWrap: 'wrap' }));
export const Label = styled(Typography)(({ theme }) => ({ ...theme.typography.h3 }));
export const DefaultText = styled(Typography)(({ theme }) => ({ ...theme.typography.caption, color: theme.vars.palette.water.main, fontWeight: theme.typography.fontWeightSemiBold }));
export const AddressCopy = styled(Typography)(({ theme }) => ({ ...theme.typography.body2, color: theme.vars.palette.text.secondary, maxWidth: '52rem' }));
export const Recipient = styled(Typography)(({ theme }) => ({ ...theme.typography.subtitle2 }));
export const Meta = styled(Typography)(({ theme }) => ({ ...theme.typography.caption, color: theme.vars.palette.text.secondary }));
export const Actions = styled(Box)(({ theme }) => ({ display: 'flex', gap: theme.spacing(1), flexWrap: 'wrap' }));
export const ActionButton = styled(Button)(({ theme }) => ({ minHeight: 38, borderRadius: theme.radii.control }));
