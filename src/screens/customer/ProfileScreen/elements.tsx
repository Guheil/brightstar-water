import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { AppLink, PageContainer } from '@/components';

export const ProfilePage = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(7, 10),

  [theme.breakpoints.down('sm')]: {
    paddingBlock: theme.spacing(5, 8),
  },
}));

export const Header = styled('header')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  maxWidth: '48rem',
  marginBottom: theme.spacing(6),
}));

export const BackLink = styled(AppLink)(({ theme }) => ({
  width: 'fit-content',
  color: theme.vars.palette.water.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
}));

export const Title = styled('h1')(({ theme }) => ({
  ...theme.typography.h1,
  margin: 0,
}));

export const Lead = styled('p')(({ theme }) => ({
  ...theme.typography.bodyLarge,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const Layout = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(16rem, 0.7fr) minmax(0, 1.3fr)',
  gap: theme.spacing(6),
  alignItems: 'start',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const AddressSection = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const SectionTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h3,
  margin: 0,
}));

export const AddressList = styled('div')(({ theme }) => ({
  display: 'grid',
  borderTop: `1px solid ${theme.vars.palette.divider}`,
}));

export const AddressItem = styled('article')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.75),
  paddingBlock: theme.spacing(2.5),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
}));

export const AddressName = styled('strong')(({ theme }) => ({
  ...theme.typography.subtitle1,
}));

export const AddressText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const DistanceText = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.water.main,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

export const FormPanel = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  padding: theme.spacing(4),
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
  },
}));

export const Form = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
}));

export const FieldGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

export const FullField = styled(TextField)({
  gridColumn: '1 / -1',
});

export const Field = styled(TextField)({});

export const FormActions = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
}));

export const SaveButton = styled(Button)(({ theme }) => ({
  minWidth: 168,
  minHeight: 44,
  backgroundColor: theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  '&:hover': { backgroundColor: theme.vars.palette.primary.dark },
}));

export const ResetButton = styled(Button)(({ theme }) => ({
  minHeight: 44,
  color: theme.vars.palette.text.primary,
}));

export const Helper = styled('p')(({ theme }) => ({
  ...theme.typography.caption,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

