import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { MUIStyleProvider } from '@/theme';
import './globals.css';

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-sans',
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
  variable: '--font-ibm-plex-serif',
});

export const metadata: Metadata = {
  title: {
    default: 'MRJE Gas & Bright Star Water',
    template: '%s | MRJE Gas & Bright Star Water',
  },
  description:
    'Order LPG and purified water for scheduled delivery within San Pedro, Laguna.',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable}`}
    >
      <body suppressHydrationWarning>
        <AppRouterCacheProvider>
          <MUIStyleProvider>{children}</MUIStyleProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
