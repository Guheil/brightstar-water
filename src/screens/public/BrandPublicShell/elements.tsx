import { styled } from '@mui/material/styles';

interface MainProps {
  $heroUnderHeader: boolean;
}

export const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== '$heroUnderHeader',
})<MainProps>(({ theme, $heroUnderHeader }) => ({
  minWidth: 0,
  paddingTop: $heroUnderHeader ? 0 : theme.spacing(10),
}));
