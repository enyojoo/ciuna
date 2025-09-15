'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserFeatureAccess } from '@/lib/types'
import { UserLocation } from '@/lib/location'
import { SupportedCurrency } from '@/lib/currency'
import { locationService } from '@/lib/location'

interface LocationContextType {
  location: UserLocation | null
  currency: SupportedCurrency | null
  featureAccess: UserFeatureAccess | null
  isLoading: boolean
  error: string | null
  setLocation: (location: UserLocation) => void
  setCurrency: (currency: SupportedCurrency) => void
  refreshFeatureAccess: () => Promise<void>
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

interface LocationProviderProps {
  children: ReactNode
  initialLocation?: UserLocation
  initialCurrency?: SupportedCurrency
}

export function LocationProvider({ 
  children, 
  initialLocation = 'other',
  initialCurrency = 'USD'
}: LocationProviderProps) {
  const [location, setLocationState] = useState<UserLocation | null>(initialLocation)
  const [currency, setCurrencyState] = useState<SupportedCurrency | null>(initialCurrency)
  const [featureAccess, setFeatureAccess] = useState<UserFeatureAccess | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setLocation = async (newLocation: UserLocation) => {
    setLocationState(newLocation)
    setIsLoading(true)
    setError(null)

    try {
      const access = await locationService.getUserFeatureAccess(newLocation)
      setFeatureAccess(access)
      
      // Update user profile in database
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          location: newLocation,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id)

      if (updateError) {
        console.error('Failed to update location:', updateError)
      }
    } catch (err) {
      setError('Failed to load location features')
      console.error('Location update error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const setCurrency = async (newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency)

    try {
      // Update user profile in database
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          base_currency: newCurrency,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id)

      if (updateError) {
        console.error('Failed to update currency:', updateError)
      }
    } catch (err) {
      console.error('Currency update error:', err)
    }
  }

  const refreshFeatureAccess = async () => {
    if (!location) return

    setIsLoading(true)
    setError(null)

    try {
      const access = await locationService.getUserFeatureAccess(location)
      setFeatureAccess(access)
    } catch (err) {
      setError('Failed to refresh feature access')
      console.error('Feature access refresh error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!location) return

      setIsLoading(true)
      try {
        const access = await locationService.getUserFeatureAccess(location)
        setFeatureAccess(access)
      } catch (err) {
        setError('Failed to load initial data')
        console.error('Initial data load error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [location])

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('location, base_currency')
            .eq('id', user.id)
            .single()

          if (profile) {
            if (profile.location) {
              setLocationState(profile.location as UserLocation)
            }
            if (profile.base_currency) {
              setCurrencyState(profile.base_currency as SupportedCurrency)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load user profile:', err)
      }
    }

    loadUserProfile()
  }, [])

  const value: LocationContextType = {
    location,
    currency,
    featureAccess,
    isLoading,
    error,
    setLocation,
    setCurrency,
    refreshFeatureAccess
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

// Hook for checking feature access
export function useFeatureAccess() {
  const { featureAccess, location } = useLocation()
  
  const canAccess = (feature: string): boolean => {
    if (!featureAccess) return false
    
    switch (feature) {
      case 'list':
        return featureAccess.canList
      case 'sell':
        return featureAccess.canSell
      case 'buy':
        return featureAccess.canBuy
      case 'services':
        return featureAccess.localServices
      case 'group_buy':
        return featureAccess.groupBuy
      default:
        return false
    }
  }

  const getAvailablePaymentMethods = (): string[] => {
    return featureAccess?.paymentMethods || []
  }

  const getAvailableShippingProviders = (): string[] => {
    return featureAccess?.shippingProviders || []
  }

  return {
    canAccess,
    getAvailablePaymentMethods,
    getAvailableShippingProviders,
    featureAccess,
    location
  }
}
