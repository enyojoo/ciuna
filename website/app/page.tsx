'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublicHeader } from '@/components/layout/public-header'
import { PublicFooter } from '@/components/layout/public-footer'
import { CurrencyConverter } from '@/components/currency-converter'

export default function HomePage() {
  const router = useRouter()

  const handleSendMoney = (data: {
    sendAmount: string
    sendCurrency: string
    receiveCurrency: string
    receiveAmount: number
    exchangeRate: number
    fee: number
  }) => {
    router.push("/access")
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main
        className="min-h-screen"
        style={{ paddingTop: '4.5rem' }}
      >
        <Hero onSendMoney={handleSendMoney} />
      </main>
      <PublicFooter />
    </div>
  )
}

function Hero({ onSendMoney }: { onSendMoney: (data: {
  sendAmount: string
  sendCurrency: string
  receiveCurrency: string
  receiveAmount: number
  exchangeRate: number
  fee: number
}) => void }) {
  const router = useRouter()

  return (
    <section className="relative bg-white pt-10 pb-8 sm:pt-12 sm:pb-10 md:pt-14 md:pb-12 lg:pt-16 lg:pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-ciuna-primary-50/10 pointer-events-none" style={{ clipPath: 'ellipse(80% 50% at 50% 0%)' }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 sm:space-y-8"
        >
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 font-display">
              Send money
              <br />
              <span className="text-ciuna-primary">across borders</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Fast, transparent remittances from your bank account to recipients abroad — with clear rates and a simple path to get started.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" className="gap-2 bg-ciuna-primary hover:bg-ciuna-primary-600" onClick={() => router.push("/access")}>
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-12 sm:mt-16 pb-6 sm:pb-8 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="w-full max-w-sm sm:max-w-md">
            <CurrencyConverter onSendMoney={onSendMoney} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
