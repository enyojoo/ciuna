import { createClient } from '@/lib/supabase/client'
import { UserFeatureAccess, FeatureAccessRule, ShippingProvider, PaymentMethod } from '@/lib/types'

export type UserLocation = 'russia' | 'uk' | 'us' | 'germany' | 'france' | 'canada' | 'australia' | 'other'

export const LOCATION_NAMES: Record<UserLocation, string> = {
  russia: 'Russia',
  uk: 'United Kingdom',
  us: 'United States',
  germany: 'Germany',
  france: 'France',
  canada: 'Canada',
  australia: 'Australia',
  other: 'Other'
}

export const LOCATION_FLAGS: Record<UserLocation, string> = {
  russia: '🇷🇺',
  uk: '🇬🇧',
  us: '🇺🇸',
  germany: '🇩🇪',
  france: '🇫🇷',
  canada: '🇨🇦',
  australia: '🇦🇺',
  other: '🌍'
}

export class LocationService {
  private static instance: LocationService
  private featureRules: Map<string, FeatureAccessRule[]> = new Map()
  private shippingProviders: Map<string, ShippingProvider[]> = new Map()
  private paymentMethods: Map<string, PaymentMethod[]> = new Map()
  private lastUpdate: Date | null = null
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService()
    }
    return LocationService.instance
  }

  async getUserFeatureAccess(location: UserLocation): Promise<UserFeatureAccess> {
    await this.ensureDataLoaded()

    const rules = this.featureRules.get(location) || []
    const shippingProviders = this.shippingProviders.get(location) || []
    const paymentMethods = this.paymentMethods.get(location) || []

    const canList = rules.find(r => r.feature_name === 'can_list')?.is_enabled || false
    const canSell = rules.find(r => r.feature_name === 'can_sell')?.is_enabled || false
    const canBuy = rules.find(r => r.feature_name === 'can_buy')?.is_enabled || true
    const localServices = rules.find(r => r.feature_name === 'local_services')?.is_enabled || false
    const groupBuy = rules.find(r => r.feature_name === 'group_buy')?.is_enabled || false

    const listConfig = rules.find(r => r.feature_name === 'can_list')?.configuration || {}
    const sellConfig = rules.find(r => r.feature_name === 'can_sell')?.configuration || {}

    return {
      canList,
      canSell,
      canBuy,
      localServices,
      groupBuy,
      paymentMethods: paymentMethods.map(pm => pm.code),
      shippingProviders: shippingProviders.map(sp => sp.code),
      maxListings: listConfig.maxListings as number,
      maxProducts: sellConfig.maxProducts as number,
      requiresVerification: listConfig.requiresVerification as boolean || sellConfig.requiresVerification as boolean
    }
  }

  async getAvailableShippingProviders(location: UserLocation): Promise<ShippingProvider[]> {
    await this.ensureDataLoaded()
    return this.shippingProviders.get(location) || []
  }

  async getAvailablePaymentMethods(location: UserLocation): Promise<PaymentMethod[]> {
    await this.ensureDataLoaded()
    return this.paymentMethods.get(location) || []
  }

  async getShippingProvidersForRoute(fromLocation: UserLocation, toLocation: UserLocation): Promise<ShippingProvider[]> {
    await this.ensureDataLoaded()
    
    if (fromLocation === toLocation) {
      // Local shipping
      return this.shippingProviders.get(fromLocation) || []
    } else {
      // International shipping
      const allProviders = Array.from(this.shippingProviders.values()).flat()
      return allProviders.filter(provider => 
        provider.countries.includes('international') || 
        (provider.countries.includes(fromLocation) && provider.countries.includes(toLocation))
      )
    }
  }

  async getPaymentMethodsForLocation(location: UserLocation): Promise<PaymentMethod[]> {
    await this.ensureDataLoaded()
    return this.paymentMethods.get(location) || []
  }

  private async ensureDataLoaded(): Promise<void> {
    if (this.isCacheValid() && this.featureRules.size > 0) {
      return
    }

    const supabase = createClient()

    try {
      // Load feature access rules
      const { data: rulesData, error: rulesError } = await supabase
        .from('feature_access_rules')
        .select('*')

      if (rulesError) throw rulesError

      // Group rules by location
      this.featureRules.clear()
      rulesData?.forEach(rule => {
        if (!this.featureRules.has(rule.location)) {
          this.featureRules.set(rule.location, [])
        }
        this.featureRules.get(rule.location)!.push(rule)
      })

      // Load shipping providers
      const { data: shippingData, error: shippingError } = await supabase
        .from('shipping_providers')
        .select('*')
        .eq('is_active', true)

      if (shippingError) throw shippingError

      // Group providers by location
      this.shippingProviders.clear()
      shippingData?.forEach(provider => {
        provider.countries.forEach((country: string) => {
          if (!this.shippingProviders.has(country)) {
            this.shippingProviders.set(country, [])
          }
          this.shippingProviders.get(country)!.push(provider)
        })
      })

      // Load payment methods
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)

      if (paymentError) throw paymentError

      // Group methods by location
      this.paymentMethods.clear()
      paymentData?.forEach(method => {
        method.countries.forEach((country: string) => {
          if (!this.paymentMethods.has(country)) {
            this.paymentMethods.set(country, [])
          }
          this.paymentMethods.get(country)!.push(method)
        })
      })

      this.lastUpdate = new Date()
    } catch (error) {
      console.error('Failed to load location data:', error)
    }
  }

  private isCacheValid(): boolean {
    if (!this.lastUpdate) return false
    return Date.now() - this.lastUpdate.getTime() < this.CACHE_DURATION
  }

  getLocationName(location: UserLocation): string {
    return LOCATION_NAMES[location]
  }

  getLocationFlag(location: UserLocation): string {
    return LOCATION_FLAGS[location]
  }

  getLocationDisplay(location: UserLocation): string {
    return `${this.getLocationFlag(location)} ${this.getLocationName(location)}`
  }

  // Helper function to determine if a user can access a specific feature
  async canAccessFeature(location: UserLocation, featureName: string): Promise<boolean> {
    const access = await this.getUserFeatureAccess(location)
    
    switch (featureName) {
      case 'list':
        return access.canList
      case 'sell':
        return access.canSell
      case 'buy':
        return access.canBuy
      case 'services':
        return access.localServices
      case 'group_buy':
        return access.groupBuy
      default:
        return false
    }
  }
}

// Export singleton instance
export const locationService = LocationService.getInstance()

// Utility functions
export const getUserFeatureAccess = (location: UserLocation): Promise<UserFeatureAccess> => {
  return locationService.getUserFeatureAccess(location)
}

export const canAccessFeature = (location: UserLocation, featureName: string): Promise<boolean> => {
  return locationService.canAccessFeature(location, featureName)
}

export const getLocationDisplay = (location: UserLocation): string => {
  return locationService.getLocationDisplay(location)
}
