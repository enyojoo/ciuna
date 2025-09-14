import { createClient } from '@/lib/supabase/client'
import { CurrencyConversion, CurrencyExchangeRate } from '@/lib/types'

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'RUB' | 'CAD' | 'AUD' | 'CHF' | 'JPY'

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  RUB: '₽',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  JPY: '¥'
}

export const CURRENCY_NAMES: Record<SupportedCurrency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  RUB: 'Russian Ruble',
  CAD: 'Canadian Dollar',
  AUD: 'Australian Dollar',
  CHF: 'Swiss Franc',
  JPY: 'Japanese Yen'
}

export class CurrencyService {
  private static instance: CurrencyService
  private exchangeRates: Map<string, CurrencyExchangeRate> = new Map()
  private lastUpdate: Date | null = null
  private readonly CACHE_DURATION = 60 * 60 * 1000 // 1 hour

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService()
    }
    return CurrencyService.instance
  }

  async getExchangeRate(fromCurrency: SupportedCurrency, toCurrency: SupportedCurrency): Promise<number> {
    if (fromCurrency === toCurrency) return 1

    const cacheKey = `${fromCurrency}_${toCurrency}`
    
    // Check if we have a cached rate that's still valid
    if (this.exchangeRates.has(cacheKey) && this.isCacheValid()) {
      return this.exchangeRates.get(cacheKey)!.rate
    }

    // Fetch from database
    const supabase = createClient()
    const { data, error } = await supabase
      .from('currency_exchange_rates')
      .select('*')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .single()

    if (error || !data) {
      console.error('Failed to fetch exchange rate:', error)
      return 1 // Fallback to 1:1 rate
    }

    // Cache the rate
    this.exchangeRates.set(cacheKey, data)
    this.lastUpdate = new Date()

    return data.rate
  }

  async convertCurrency(
    amount: number,
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency
  ): Promise<CurrencyConversion> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency)
    const convertedAmount = amount * rate

    return {
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      rate,
      lastUpdated: this.lastUpdate?.toISOString() || new Date().toISOString()
    }
  }

  async updateExchangeRates(): Promise<void> {
    try {
      // In a real implementation, you would call an external API like:
      // - Fixer.io
      // - CurrencyLayer
      // - ExchangeRate-API
      // For now, we'll use mock data
      
      const mockRates = {
        'USD_EUR': 0.85,
        'USD_GBP': 0.73,
        'USD_RUB': 75.0,
        'USD_CAD': 1.25,
        'USD_AUD': 1.35,
        'USD_CHF': 0.92,
        'USD_JPY': 110.0,
        'EUR_USD': 1.18,
        'EUR_GBP': 0.86,
        'EUR_RUB': 88.0,
        'GBP_USD': 1.37,
        'GBP_EUR': 1.16,
        'GBP_RUB': 103.0,
        'RUB_USD': 0.013,
        'RUB_EUR': 0.011,
        'RUB_GBP': 0.0097
      }

      const supabase = createClient()
      const updates = Object.entries(mockRates).map(([key, rate]) => {
        const [from, to] = key.split('_')
        return supabase
          .from('currency_exchange_rates')
          .upsert({
            from_currency: from,
            to_currency: to,
            rate,
            last_updated: new Date().toISOString()
          })
      })

      await Promise.all(updates)
      this.lastUpdate = new Date()
      
      console.log('Exchange rates updated successfully')
    } catch (error) {
      console.error('Failed to update exchange rates:', error)
    }
  }

  private isCacheValid(): boolean {
    if (!this.lastUpdate) return false
    return Date.now() - this.lastUpdate.getTime() < this.CACHE_DURATION
  }

  formatCurrency(amount: number, currency: SupportedCurrency, locale: string = 'en-US'): string {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })

    return formatter.format(amount)
  }

  formatPrice(amount: number, currency: SupportedCurrency): string {
    const symbol = CURRENCY_SYMBOLS[currency]
    return `${symbol}${amount.toFixed(2)}`
  }
}

// Export singleton instance
export const currencyService = CurrencyService.getInstance()

// Utility functions
export const formatCurrency = (amount: number, currency: SupportedCurrency, locale?: string): string => {
  return currencyService.formatCurrency(amount, currency, locale)
}

export const formatPrice = (amount: number, currency: SupportedCurrency): string => {
  return currencyService.formatPrice(amount, currency)
}

export const convertCurrency = async (
  amount: number,
  fromCurrency: SupportedCurrency,
  toCurrency: SupportedCurrency
): Promise<CurrencyConversion> => {
  return currencyService.convertCurrency(amount, fromCurrency, toCurrency)
}
