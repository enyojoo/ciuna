import { z } from 'zod';
export declare const CurrencyCodeSchema: z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>;
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;
export declare const ExchangeRateSchema: z.ZodObject<{
    id: z.ZodNumber;
    from_currency: z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>;
    to_currency: z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>;
    rate: z.ZodNumber;
    source: z.ZodEnum<["api", "manual", "bank"]>;
    is_active: z.ZodDefault<z.ZodBoolean>;
    valid_from: z.ZodString;
    valid_until: z.ZodNullable<z.ZodString>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
    from_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    to_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    rate: number;
    source: "api" | "manual" | "bank";
    valid_from: string;
    valid_until: string | null;
}, {
    id: number;
    created_at: string;
    updated_at: string;
    from_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    to_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    rate: number;
    source: "api" | "manual" | "bank";
    valid_from: string;
    valid_until: string | null;
    is_active?: boolean | undefined;
}>;
export type ExchangeRate = z.infer<typeof ExchangeRateSchema>;
export declare const UserCurrencyPreferencesSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    primary_currency: z.ZodDefault<z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>>;
    display_currency: z.ZodDefault<z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>>;
    auto_convert: z.ZodDefault<z.ZodBoolean>;
    exchange_rate_source: z.ZodDefault<z.ZodEnum<["api", "manual", "bank"]>>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    primary_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    display_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    auto_convert: boolean;
    exchange_rate_source: "api" | "manual" | "bank";
}, {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    primary_currency?: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH" | undefined;
    display_currency?: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH" | undefined;
    auto_convert?: boolean | undefined;
    exchange_rate_source?: "api" | "manual" | "bank" | undefined;
}>;
export type UserCurrencyPreferences = z.infer<typeof UserCurrencyPreferencesSchema>;
export declare const PriceWithCurrencySchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>;
    original_amount: z.ZodOptional<z.ZodNumber>;
    exchange_rate: z.ZodOptional<z.ZodNumber>;
    converted_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    original_amount?: number | undefined;
    exchange_rate?: number | undefined;
    converted_at?: string | undefined;
}, {
    amount: number;
    currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    original_amount?: number | undefined;
    exchange_rate?: number | undefined;
    converted_at?: string | undefined;
}>;
export type PriceWithCurrency = z.infer<typeof PriceWithCurrencySchema>;
export declare const CurrencyConversionRequestSchema: z.ZodObject<{
    amount: z.ZodNumber;
    from_currency: z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>;
    to_currency: z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>;
    date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    from_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    to_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    amount: number;
    date?: string | undefined;
}, {
    from_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    to_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    amount: number;
    date?: string | undefined;
}>;
export type CurrencyConversionRequest = z.infer<typeof CurrencyConversionRequestSchema>;
export declare const CurrencyConversionResponseSchema: z.ZodObject<{
    original_amount: z.ZodNumber;
    converted_amount: z.ZodNumber;
    from_currency: z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>;
    to_currency: z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>;
    exchange_rate: z.ZodNumber;
    converted_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    from_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    to_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    original_amount: number;
    exchange_rate: number;
    converted_at: string;
    converted_amount: number;
}, {
    from_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    to_currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    original_amount: number;
    exchange_rate: number;
    converted_at: string;
    converted_amount: number;
}>;
export type CurrencyConversionResponse = z.infer<typeof CurrencyConversionResponseSchema>;
export declare const CURRENCY_INFO: Record<CurrencyCode, {
    symbol: string;
    name: string;
    decimals: number;
}>;
export declare function formatCurrency(amount: number, currency: CurrencyCode): string;
export declare function getCurrencyName(currency: CurrencyCode): string;
export declare function getCurrencySymbol(currency: CurrencyCode): string;
//# sourceMappingURL=currency.d.ts.map