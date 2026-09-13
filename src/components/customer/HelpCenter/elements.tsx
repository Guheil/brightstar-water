import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ButtonBase from '@mui/material/ButtonBase';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';
import type {
  HelpCategoryButtonProps,
  HelpFloatingButtonProps,
} from './interface';

export const FloatingHelpButton = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== '$tone',
})<HelpFloatingButtonProps>(({ theme, $tone }) => ({
  ...theme.typography.button,
  position: 'fixed',
  right: theme.spacing(3),
  bottom: `calc(${theme.spacing(3)} + env(safe-area-inset-bottom))`,
  zIndex: theme.zIndex.speedDial,
  minHeight: theme.spacing(6),
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  paddingInline: theme.spacing(2),
  borderRadius: theme.radii.control,
  backgroundColor:
    $tone === 'gas'
      ? theme.vars.palette.gas.main
      : $tone === 'water'
        ? theme.vars.palette.water.main
        : theme.vars.palette.primary.main,
  color: theme.vars.palette.primary.contrastText,
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create(['background-color', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),

  '&:hover': {
    backgroundColor:
      $tone === 'gas'
        ? theme.vars.palette.gas.dark
        : $tone === 'water'
          ? theme.vars.palette.water.dark
          : theme.vars.palette.primary.dark,
    boxShadow: theme.shadows[6],
  },

  '&:focus-visible': {
    outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.background.paper}`,
    outlineOffset: theme.spacing(0.375),
  },

  '& svg': {
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  },

  [theme.breakpoints.down('sm')]: {
    right: theme.spacing(2),
    bottom: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom))`,
    minHeight: theme.spacing(5.5),
    paddingInline: theme.spacing(1.5),
  },

  '@media (prefers-reduced-motion: reduce)': {
    transitionDuration: '0.01ms',
  },
}));

export const HelpDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    alignItems: 'center',
    padding: theme.spacing(3),
  },

  '& .MuiDialog-paper': {
    width: `min(${theme.spacing(104)}, calc(100vw - ${theme.spacing(6)}))`,
    maxWidth: theme.spacing(104),
    height: `min(${theme.spacing(86)}, 84dvh)`,
    maxHeight: '84dvh',
    margin: 0,
    overflow: 'hidden',
    borderRadius: theme.radii.surface,
    backgroundColor: theme.vars.palette.background.paper,
    backgroundImage: 'none',
  },

  [theme.breakpoints.down('sm')]: {
    '& .MuiDialog-container': {
      alignItems: 'flex-end',
      padding: 0,
    },

    '& .MuiDialog-paper': {
      width: '100%',
      maxWidth: '100%',
      height: '90dvh',
      maxHeight: '90dvh',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
  },

  '@media (prefers-reduced-motion: reduce)': {
    '& .MuiDialog-paper, & .MuiBackdrop-root': {
      transitionDuration: '0.01ms !important',
    },
  },
}));

export const Panel = styled('section')(({ theme }) => ({
  height: '100%',
  minHeight: 0,
  display: 'grid',
  gridTemplateRows: 'auto auto minmax(0, 1fr)',
  color: theme.vars.palette.text.primary,
}));

export const PanelHeader = styled('header')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gap: theme.spacing(2),
  alignItems: 'start',
  padding: theme.spacing(3, 3, 2),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2.5, 2, 2),
  },
}));

export const HeaderCopy = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.75),
}));

export const PanelTitle = styled('h2')(({ theme }) => ({
  ...theme.typography.h3,
  margin: 0,
}));

export const PanelDescription = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  maxWidth: theme.spacing(58),
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  width: theme.spacing(5.5),
  height: theme.spacing(5.5),
  marginTop: theme.spacing(-0.75),
  marginRight: theme.spacing(-0.75),
  color: theme.vars.palette.text.secondary,

  '&:focus-visible': {
    outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.water.main}`,
    outlineOffset: theme.spacing(0.25),
  },
}));

export const Controls = styled('div')(({ theme }) => ({
  padding: theme.spacing(2.5, 3, 2),
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 2, 1.5),
  },
}));

export const SearchField = styled(TextField)(({ theme }) => ({
  width: '100%',

  '& .MuiInputBase-root': {
    minHeight: theme.spacing(6),
    borderRadius: theme.radii.control,
  },
}));

export const HelpBody = styled('div')(({ theme }) => ({
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: `${theme.spacing(21)} minmax(0, 1fr)`,

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'auto minmax(0, 1fr)',
  },
}));

export const CategoryNav = styled('nav')(({ theme }) => ({
  display: 'flex',
  minWidth: 0,
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  padding: theme.spacing(2.5, 2),
  borderRight: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  backgroundColor: theme.vars.palette.background.default,

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
    overflowX: 'auto',
    overscrollBehaviorInline: 'contain',
    scrollbarWidth: 'thin',
    padding: theme.spacing(0.5, 2, 0),
    borderRight: 0,
    borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
    backgroundColor: theme.vars.palette.background.paper,
  },
}));

export const CategoryButton = styled(ButtonBase, {
  shouldForwardProp: (prop) => !['$active', '$tone'].includes(String(prop)),
})<HelpCategoryButtonProps>(({ theme, $active, $tone }) => {
  const activeColor =
    $tone === 'gas'
      ? theme.vars.palette.gas.main
      : $tone === 'water'
        ? theme.vars.palette.water.main
        : theme.vars.palette.primary.main;

  return {
    ...theme.typography.body2,
    minHeight: theme.spacing(5.5),
    width: '100%',
    justifyContent: 'flex-start',
    paddingInline: theme.spacing(1.25),
    borderRadius: theme.radii.control,
    color: $active ? activeColor : theme.vars.palette.text.secondary,
    backgroundColor: $active
      ? theme.vars.palette.action.selected
      : 'transparent',
    fontWeight: $active
      ? theme.typography.fontWeightSemiBold
      : theme.typography.fontWeightRegular,
    textAlign: 'left',

    '&:hover': {
      color: theme.vars.palette.text.primary,
      backgroundColor: theme.vars.palette.action.hover,
    },

    '&:focus-visible': {
      outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.water.main}`,
      outlineOffset: theme.spacing(0.25),
    },

    [theme.breakpoints.down('sm')]: {
      width: 'auto',
      minWidth: 'max-content',
      flexShrink: 0,
      paddingInline: 0,
      borderRadius: 0,
      borderBottom: `${theme.spacing(0.25)} solid ${$active ? activeColor : 'transparent'}`,
      backgroundColor: 'transparent',

      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  };
});

export const QuestionsScroll = styled('div')(({ theme }) => ({
  minHeight: 0,
  overflowY: 'auto',
  overscrollBehaviorY: 'contain',
  scrollbarGutter: 'stable',
  padding: theme.spacing(2.5, 3, 3),

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 2, 2.5),
  },
}));

export const ResultsHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(1.25),
}));

export const ResultsTitle = styled('h3')(({ theme }) => ({
  ...theme.typography.subtitle1,
  margin: 0,
}));

export const ResultSummary = styled('p')(({ theme }) => ({
  ...theme.typography.caption,
  flexShrink: 0,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const QuestionGroup = styled('section')(({ theme }) => ({
  '& + &': {
    marginTop: theme.spacing(3.5),
  },
}));

export const QuestionList = styled('div')(({ theme }) => ({
  display: 'grid',
  borderTop: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
}));

export const QuestionAccordion = styled(Accordion)(({ theme }) => ({
  margin: 0,
  borderBottom: `${theme.spacing(0.125)} solid ${theme.vars.palette.divider}`,
  backgroundColor: 'transparent',
  backgroundImage: 'none',
  boxShadow: 'none',

  '&::before': { display: 'none' },
  '&.Mui-expanded': { margin: 0 },

  '@media (prefers-reduced-motion: reduce)': {
    '& .MuiCollapse-root, & .MuiAccordionSummary-expandIconWrapper': {
      transitionDuration: '0.01ms !important',
    },
  },
}));

export const QuestionSummary = styled(AccordionSummary)(({ theme }) => ({
  minHeight: theme.spacing(7),
  padding: theme.spacing(0, 0.5),

  '&.Mui-expanded': { minHeight: theme.spacing(7) },
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(1.5, 0),
  },
  '& .MuiAccordionSummary-content.Mui-expanded': {
    margin: theme.spacing(1.5, 0),
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: theme.vars.palette.text.secondary,
  },
  '&:focus-visible': {
    outline: `${theme.spacing(0.375)} solid ${theme.vars.palette.water.main}`,
    outlineOffset: theme.spacing(-0.375),
  },
}));

export const QuestionText = styled('span')(({ theme }) => ({
  ...theme.typography.subtitle2,
  paddingRight: theme.spacing(1.5),
  textAlign: 'left',
}));

export const AnswerDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0, 4.5, 2.5, 0.5),
}));

export const AnswerText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));

export const EmptyState = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(0.75),
  paddingBlock: theme.spacing(4),
}));

export const EmptyTitle = styled('strong')(({ theme }) => ({
  ...theme.typography.subtitle1,
}));

export const EmptyText = styled('p')(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  color: theme.vars.palette.text.secondary,
}));
