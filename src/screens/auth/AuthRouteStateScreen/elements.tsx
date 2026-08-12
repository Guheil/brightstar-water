import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

export const StateRegion = styled(Box)(({ theme }) => ({
  display: 'grid',
  minHeight: theme.spacing(24),
  alignItems: 'center',
  paddingBlock: theme.spacing(2),
}));
