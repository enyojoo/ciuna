import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Navigation } from '../components/navigation';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Ciuna - Expat Marketplace in Russia',
  description: 'The ultimate marketplace for expats in Russia. Buy, sell, and discover products and services from fellow expats and local vendors.',
  keywords: ['expat', 'marketplace', 'russia', 'moscow', 'st petersburg', 'buy', 'sell', 'services'],
  authors: [{ name: 'Ciuna Team' }],
  creator: 'Ciuna',
  publisher: 'Ciuna',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    title: 'Ciuna - Expat Marketplace in Russia',
    description: 'The ultimate marketplace for expats in Russia. Buy, sell, and discover products and services from fellow expats and local vendors.',
    siteName: 'Ciuna',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ciuna - Expat Marketplace in Russia',
    description: 'The ultimate marketplace for expats in Russia. Buy, sell, and discover products and services from fellow expats and local vendors.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
