import { z } from 'zod';
// Currency codes supported by the platform
export const CurrencyCodeSchema = z.enum([
    'USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'KRW',
    'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY',
    'BRL', 'MXN', 'INR', 'ZAR', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'UAH'
]);
// Exchange rate schema
export const ExchangeRateSchema = z.object({
    id: z.number(),
    from_currency: CurrencyCodeSchema,
    to_currency: CurrencyCodeSchema,
    rate: z.number().positive(),
    source: z.enum(['api', 'manual', 'bank']),
    is_active: z.boolean().default(true),
    valid_from: z.string().datetime(),
    valid_until: z.string().datetime().nullable(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});
// User currency preferences schema
export const UserCurrencyPreferencesSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    primary_currency: CurrencyCodeSchema.default('RUB'),
    display_currency: CurrencyCodeSchema.default('RUB'),
    auto_convert: z.boolean().default(true),
    exchange_rate_source: z.enum(['api', 'manual', 'bank']).default('api'),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});
// Price with currency schema
export const PriceWithCurrencySchema = z.object({
    amount: z.number().int().min(0),
    currency: CurrencyCodeSchema,
    original_amount: z.number().int().min(0).optional(),
    exchange_rate: z.number().positive().optional(),
    converted_at: z.string().datetime().optional(),
});
// Currency conversion request schema
export const CurrencyConversionRequestSchema = z.object({
    amount: z.number().int().min(0),
    from_currency: CurrencyCodeSchema,
    to_currency: CurrencyCodeSchema,
    date: z.string().datetime().optional(),
});
// Currency conversion response schema
export const CurrencyConversionResponseSchema = z.object({
    original_amount: z.number().int().min(0),
    converted_amount: z.number().int().min(0),
    from_currency: CurrencyCodeSchema,
    to_currency: CurrencyCodeSchema,
    exchange_rate: z.number().positive(),
    converted_at: z.string().datetime(),
});
// Common currency symbols and names
export const CURRENCY_INFO = {
    USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
    EUR: { symbol: '€', name: 'Euro', decimals: 2 },
    GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
    RUB: { symbol: '₽', name: 'Russian Ruble', decimals: 2 },
    JPY: { symbol: '¥', name: 'Japanese Yen', decimals: 0 },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
    AUD: { symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
    CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
    CNY: { symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
    KRW: { symbol: '₩', name: 'South Korean Won', decimals: 0 },
    SGD: { symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
    HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
    NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2 },
    SEK: { symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
    NOK: { symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
    DKK: { symbol: 'kr', name: 'Danish Krone', decimals: 2 },
    PLN: { symbol: 'zł', name: 'Polish Zloty', decimals: 2 },
    CZK: { symbol: 'Kč', name: 'Czech Koruna', decimals: 2 },
    HUF: { symbol: 'Ft', name: 'Hungarian Forint', decimals: 2 },
    TRY: { symbol: '₺', name: 'Turkish Lira', decimals: 2 },
    BRL: { symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
    MXN: { symbol: '$', name: 'Mexican Peso', decimals: 2 },
    INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2 },
    ZAR: { symbol: 'R', name: 'South African Rand', decimals: 2 },
    THB: { symbol: '฿', name: 'Thai Baht', decimals: 2 },
    MYR: { symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 },
    IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 0 },
    PHP: { symbol: '₱', name: 'Philippine Peso', decimals: 2 },
    VND: { symbol: '₫', name: 'Vietnamese Dong', decimals: 0 },
    UAH: { symbol: '₴', name: 'Ukrainian Hryvnia', decimals: 2 },
};
// Helper function to format currency
export function formatCurrency(amount, currency) {
    const info = CURRENCY_INFO[currency];
    const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: info.decimals,
        maximumFractionDigits: info.decimals,
    }).format(amount);
    return `${info.symbol}${formattedAmount}`;
}
// Helper function to get currency name
export function getCurrencyName(currency) {
    return CURRENCY_INFO[currency].name;
}
// Helper function to get currency symbol
export function getCurrencySymbol(currency) {
    return CURRENCY_INFO[currency].symbol;
}
//# sourceMappingURL=currency.js.map