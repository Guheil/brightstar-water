import { styled } from '@mui/material/styles';
import { AppLink, PageContainer } from '@/components';
export const Page = styled(PageContainer)(({ theme }) => ({ paddingBlock: theme.spacing(7, 10), [theme.breakpoints.down('sm')]: { paddingBlock: theme.spacing(5, 8) } }));
export const Header = styled('header')(({ theme }) => ({ display: 'grid', gap: theme.spacing(1.5), maxWidth: '52rem', marginBottom: theme.spacing(5) }));
export const BackLink = styled(AppLink)(({ theme }) => ({ width: 'fit-content', color: theme.vars.palette.water.main, fontWeight: theme.typography.fontWeightSemiBold, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }));
export const Title = styled('h1')(({ theme }) => ({ ...theme.typography.h1, margin: 0 }));
export const Lead = styled('p')(({ theme }) => ({ ...theme.typography.bodyLarge, margin: 0, color: theme.vars.palette.text.secondary }));
export const FormShell = styled('section')(({ theme }) => ({ maxWidth: '58rem', padding: theme.spacing(4), border: `1px solid ${theme.vars.palette.divider}`, borderRadius: theme.radii.surface, backgroundColor: theme.vars.palette.background.paper, [theme.breakpoints.down('sm')]: { padding: theme.spacing(3, 2) } }));
