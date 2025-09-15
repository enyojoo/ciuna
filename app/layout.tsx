import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'

const sora = Sora({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ciuna - Expat Marketplace in Russia',
  description: 'The marketplace for foreigners living in Russia. Buy, sell, and find services in your community.',
  keywords: ['expat', 'marketplace', 'russia', 'buy', 'sell', 'services'],
  authors: [{ name: 'Ciuna Team' }],
  openGraph: {
    title: 'Ciuna - Expat Marketplace in Russia',
    description: 'The marketplace for foreigners living in Russia',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ciuna - Expat Marketplace in Russia',
    description: 'The marketplace for foreigners living in Russia',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={sora.className}>
        <Providers>
          <Navigation />
          <main>
            {children}
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
