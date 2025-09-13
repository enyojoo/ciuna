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
export declare class CurrencyService {
    /**
     * Get supported currencies
     */
    static getCurrencies(): Promise<Currency[]>;
    /**
     * Get exchange rate between two currencies
     */
    static getExchangeRate(fromCurrency: string, toCurrency: string, date?: Date): Promise<number | null>;
    /**
     * Convert amount from one currency to another
     */
    static convertAmount(amount: number, fromCurrency: string, toCurrency: string, date?: Date): Promise<{
        success: boolean;
        convertedAmount?: number;
        rate?: number;
    }>;
    /**
     * Get exchange rates for a base currency
     */
    static getExchangeRates(baseCurrency: string, targetCurrencies: string[], date?: Date): Promise<{
        [currency: string]: number;
    }>;
    /**
     * Format amount with currency symbol and proper decimals
     */
    static formatAmount(amount: number, currencyCode: string, locale?: string): string;
    /**
     * Get currency information by code
     */
    static getCurrencyInfo(currencyCode: string): Currency | null;
    /**
     * Update exchange rates (admin function)
     */
    static updateExchangeRates(rates: {
        from: string;
        to: string;
        rate: number;
        provider?: string;
    }[]): Promise<boolean>;
    /**
     * Get currency conversion history
     */
    static getConversionHistory(fromCurrency: string, toCurrency: string, days?: number): Promise<ExchangeRate[]>;
}
//# sourceMappingURL=currency.d.ts.map