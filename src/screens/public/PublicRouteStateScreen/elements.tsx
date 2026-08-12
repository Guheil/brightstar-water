import { styled } from '@mui/material/styles';
import PageContainer from '@/components/layout/PageContainer';

export const Root = styled(PageContainer)(({ theme }) => ({
  display: 'flex',
  minHeight: theme.spacing(58),
  alignItems: 'center',
  justifyContent: 'center',
  paddingBlock: theme.spacing(8),
}));
