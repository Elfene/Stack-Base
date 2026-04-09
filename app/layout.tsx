import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stackbased.vercel.app'),
  title: 'BlockStack - 3D Tower Stacking Game on Base',
  description: 'Stack blocks perfectly in this addictive 3D tower game on Base blockchain. Compete for the highest score on-chain!',
  openGraph: {
    title: 'BlockStack',
    description: 'Stack blocks perfectly in this addictive 3D tower game on Base',
    url: 'https://stackbased.vercel.app',
    type: 'website',
    images: ['/thumbnail.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlockStack',
    description: 'Stack blocks perfectly in this addictive 3D tower game on Base',
    images: ['/thumbnail.png'],
  },
  other: {
    'base:app_id': '69cad0ab33aaaac28015a4a1',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#667eea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} h-full`}>
      <body className="h-full overflow-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
