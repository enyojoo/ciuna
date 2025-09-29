'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocationProvider } from '@/lib/contexts/location-context'
import { useState } from 'react'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        {children}
      </LocationProvider>
    </QueryClientProvider>
  )
}
