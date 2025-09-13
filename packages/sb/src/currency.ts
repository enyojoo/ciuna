import { createClient } from './client';

const supabase = createClient();

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  is_active: boolean;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  provider: string;
  valid_from: string;
  valid_until?: string;
  created_at: string;
}

export class CurrencyService {
  /**
   * Get supported currencies
   */
  static async getCurrencies(): Promise<Currency[]> {
    try {
      // In a real implementation, this would come from a currencies table
      // For now, return a static list of major currencies
      const currencies: Currency[] = [
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimals: 2, is_active: true },
        { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, is_active: true },
        { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, is_active: true },
        { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, is_active: true },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, is_active: true },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, is_active: true },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2, is_active: true },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, is_active: true },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, is_active: true },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, is_active: true },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, is_active: true },
        { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, is_active: true },
        { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2, is_active: true },
        { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2, is_active: true },
        { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 2, is_active: true },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2, is_active: true },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, is_active: true },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2, is_active: true },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, is_active: true },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, is_active: true },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2, is_active: true },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2, is_active: true },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2, is_active: true },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, is_active: true },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, is_active: true },
        { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimals: 2, is_active: true },
        { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', decimals: 2, is_active: true },
        { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', decimals: 3, is_active: true },
        { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', decimals: 3, is_active: true },
        { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', decimals: 3, is_active: true },
      ];

      return currencies.filter(currency => currency.is_active);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  static async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    date?: Date
  ): Promise<number | null> {
    try {
      if (fromCurrency === toCurrency) {
        return 1;
      }

      const { data, error } = await supabase.rpc('get_exchange_rate', {
        p_from_currency: fromCurrency,
        p_to_currency: toCurrency,
        p_date: date?.toISOString() || new Date().toISOString(),
      });

      if (error) {
        console.error('Error getting exchange rate:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getExchangeRate:', error);
      return null;
    }
  }

  /**
   * Convert amount from one currency to another
   */
  static async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date?: Date
  ): Promise<{ success: boolean; convertedAmount?: number; rate?: number }> {
    try {
      if (fromCurrency === toCurrency) {
        return { success: true, convertedAmount: amount, rate: 1 };
      }

      const rate = await this.getExchangeRate(fromCurrency, toCurrency, date);
      if (!rate) {
        return { success: false };
      }

      const convertedAmount = Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
      return { success: true, convertedAmount, rate };
    } catch (error) {
      console.error('Error in convertAmount:', error);
      return { success: false };
    }
  }

  /**
   * Get exchange rates for a base currency
   */
  static async getExchangeRates(
    baseCurrency: string,
    targetCurrencies: string[],
    date?: Date
  ): Promise<{ [currency: string]: number }> {
    try {
      const rates: { [currency: string]: number } = {};
      
      // Get rates for all target currencies
      const ratePromises = targetCurrencies.map(async (currency) => {
        if (currency === baseCurrency) {
          return { currency, rate: 1 };
        }
        
        const rate = await this.getExchangeRate(baseCurrency, currency, date);
        return { currency, rate: rate || 0 };
      });

      const results = await Promise.all(ratePromises);
      
      results.forEach(({ currency, rate }) => {
        rates[currency] = rate;
      });

      return rates;
    } catch (error) {
      console.error('Error in getExchangeRates:', error);
      return {};
    }
  }

  /**
   * Format amount with currency symbol and proper decimals
   */
  static formatAmount(amount: number, currencyCode: string, locale: string = 'en-US'): string {
    try {
      const currency = this.getCurrencyInfo(currencyCode);
      if (!currency) {
        return `${amount} ${currencyCode}`;
      }

      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals,
      }).format(amount);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `${amount} ${currencyCode}`;
    }
  }

  /**
   * Get currency information by code
   */
  static getCurrencyInfo(currencyCode: string): Currency | null {
    const currencies = [
      { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimals: 2, is_active: true },
      { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2, is_active: true },
      { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2, is_active: true },
      { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2, is_active: true },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2, is_active: true },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0, is_active: true },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2, is_active: true },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2, is_active: true },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2, is_active: true },
      { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2, is_active: true },
      { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2, is_active: true },
      { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2, is_active: true },
      { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2, is_active: true },
      { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2, is_active: true },
      { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 2, is_active: true },
      { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2, is_active: true },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2, is_active: true },
      { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2, is_active: true },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2, is_active: true },
      { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0, is_active: true },
      { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2, is_active: true },
      { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2, is_active: true },
      { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2, is_active: true },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2, is_active: true },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2, is_active: true },
      { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimals: 2, is_active: true },
      { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', decimals: 2, is_active: true },
      { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', decimals: 3, is_active: true },
      { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب', decimals: 3, is_active: true },
      { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', decimals: 3, is_active: true },
    ];

    return currencies.find(c => c.code === currencyCode) || null;
  }

  /**
   * Update exchange rates (admin function)
   */
  static async updateExchangeRates(
    rates: { from: string; to: string; rate: number; provider?: string }[]
  ): Promise<boolean> {
    try {
      const exchangeRates = rates.map(rate => ({
        from_currency: rate.from,
        to_currency: rate.to,
        rate: rate.rate,
        provider: rate.provider || 'MANUAL',
        valid_from: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('exchange_rates')
        .insert(exchangeRates);

      if (error) {
        console.error('Error updating exchange rates:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateExchangeRates:', error);
      return false;
    }
  }

  /**
   * Get currency conversion history
   */
  static async getConversionHistory(
    fromCurrency: string,
    toCurrency: string,
    days: number = 30
  ): Promise<ExchangeRate[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('from_currency', fromCurrency)
        .eq('to_currency', toCurrency)
        .gte('valid_from', startDate.toISOString())
        .order('valid_from', { ascending: false });

      if (error) {
        console.error('Error fetching conversion history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConversionHistory:', error);
      return [];
    }
  }
}