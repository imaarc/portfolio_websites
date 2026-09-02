import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.eipibelettering.nl'),
  title: 'EIPI Belettering | Belettering en Gevelreclame',
  description:
    'Vehicle lettering, facade signage, interior signing, flags, banners, and wayfinding for visible businesses in and around Purmerend.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/eipi-logo-mark.svg',
  },
  openGraph: {
    title: 'EIPI Belettering | Show Who You Are',
    description:
      'A premium landing-page redesign concept for EIPI Belettering and Gevelreclame.',
    images: ['/og.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EIPI Belettering | Show Who You Are',
    description:
      'Vehicle lettering and signage designed to make businesses impossible to ignore.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
