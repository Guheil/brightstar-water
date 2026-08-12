import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import { AppLink, PageContainer } from '@/components';

export const DetailPage = styled(PageContainer)(({ theme }) => ({
  paddingBlock: theme.spacing(7, 10),
  [theme.breakpoints.down('sm')]: { paddingBlock: theme.spacing(5, 8) },
}));

export const Header = styled('header')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(3),
  alignItems: 'end',
  paddingBottom: theme.spacing(5),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
  [theme.breakpoints.down('sm')]: { gridTemplateColumns: '1fr' },
}));

export const HeadingCopy = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
}));

export const BackLink = styled(AppLink)(({ theme }) => ({
  width: 'fit-content',
  color: theme.vars.palette.water.main,
  fontWeight: theme.typography.fontWeightSemiBold,
  textDecoration: 'none',
  '&:hover': { textDecoration: 'underline' },
}));

export const Title = styled('h1')(({ theme }) => ({ ...theme.typography.h1, margin: 0 }));
export const DateText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const ContentGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.35fr) minmax(18rem, 0.65fr)',
  gap: theme.spacing(7),
  paddingTop: theme.spacing(6),
  alignItems: 'start',
  [theme.breakpoints.down('md')]: { gridTemplateColumns: '1fr' },
}));

export const MainColumn = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(6),
}));

export const SideColumn = styled('aside')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
}));

export const Section = styled('section')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2.5),
}));

export const Panel = styled(Section)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.vars.palette.background.paper,
  border: `1px solid ${theme.vars.palette.divider}`,
  borderRadius: theme.radii.surface,
}));

export const SectionTitle = styled('h2')(({ theme }) => ({ ...theme.typography.h3, margin: 0 }));

export const Timeline = styled('ol')({
  display: 'grid',
  gap: 0,
  margin: 0,
  padding: 0,
  listStyle: 'none',
});

export const TimelineItem = styled('li')(({ theme }) => ({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '1.5rem minmax(0, 1fr)',
  gap: theme.spacing(1.5),
  paddingBottom: theme.spacing(3),

  '&:not(:last-child)::before': {
    content: '""',
    position: 'absolute',
    left: 7,
    top: 16,
    bottom: 0,
    width: 2,
    backgroundColor: theme.vars.palette.divider,
  },
}));

export const TimelineDot = styled('span')(({ theme }) => ({
  width: 16,
  height: 16,
  marginTop: theme.spacing(0.5),
  borderRadius: '50%',
  backgroundColor: theme.vars.palette.water.main,
  border: `3px solid ${theme.vars.palette.background.paper}`,
  boxShadow: `0 0 0 1px ${theme.vars.palette.water.main}`,
  zIndex: 1,
}));

export const TimelineCopy = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.25),
}));

export const TimelineLabel = styled('strong')(({ theme }) => ({ ...theme.typography.subtitle2 }));
export const TimelineMeta = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  color: theme.vars.palette.text.secondary,
}));

export const ItemList = styled('div')(({ theme }) => ({
  display: 'grid',
  borderTop: `1px solid ${theme.vars.palette.divider}`,
}));

export const ItemRow = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  paddingBlock: theme.spacing(2),
  borderBottom: `1px solid ${theme.vars.palette.divider}`,
}));

export const ItemCopy = styled('span')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.vars.palette.text.secondary,
}));

export const ItemTotal = styled('strong')(({ theme }) => ({ ...theme.typography.subtitle2 }));

export const DefinitionList = styled('dl')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.25),
  margin: 0,
}));

export const DefinitionRow = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  ...theme.typography.body2,
  '& dt': { color: theme.vars.palette.text.secondary },
  '& dd': { margin: 0, textAlign: 'right', fontWeight: theme.typography.fontWeightSemiBold },
}));

export const DefinitionTotal = styled(DefinitionRow)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  borderTop: `1px solid ${theme.vars.palette.divider}`,
  ...theme.typography.subtitle1,
}));

export const AddressText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const CancelButton = styled(Button)(({ theme }) => ({
  minHeight: 44,
  justifySelf: 'start',
  color: theme.vars.palette.error.main,
  borderColor: theme.vars.palette.error.main,
}));

export const CancellationForm = styled('form')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));

export const ReasonField = styled(TextField)({});

export const FormActions = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  minHeight: 44,
  backgroundColor: theme.vars.palette.error.main,
  color: theme.vars.palette.error.contrastText,
  '&:hover': { backgroundColor: theme.vars.palette.error.dark },
}));

export const DismissButton = styled(Button)(({ theme }) => ({
  minHeight: 44,
  color: theme.vars.palette.text.primary,
}));
