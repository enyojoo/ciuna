import { z } from 'zod';
export declare const OrderSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    buyer_id: z.ZodString;
    seller_id: z.ZodString;
    listing_id: z.ZodOptional<z.ZodString>;
    vendor_product_id: z.ZodOptional<z.ZodString>;
    service_booking_id: z.ZodOptional<z.ZodString>;
    escrow_status: z.ZodDefault<z.ZodEnum<["HELD", "RELEASED", "REFUNDED"]>>;
    payment_id: z.ZodString;
    delivery_id: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "PAID", "FULFILLING", "DELIVERED", "CANCELLED"]>>;
    total_amount_rub: z.ZodNumber;
    escrow_amount_rub: z.ZodNumber;
    delivery_amount_rub: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>>;
    total_amount_original: z.ZodOptional<z.ZodNumber>;
    exchange_rate: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    cancelled_at: z.ZodOptional<z.ZodString>;
    cancelled_reason: z.ZodOptional<z.ZodString>;
    completed_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED";
    escrow_status: "HELD" | "RELEASED" | "REFUNDED";
    total_amount_rub: number;
    escrow_amount_rub: number;
    payment_id: string;
    currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    buyer_id: string;
    seller_id: string;
    delivery_amount_rub: number;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    service_booking_id?: string | undefined;
    delivery_id?: string | undefined;
    total_amount_original?: number | undefined;
    exchange_rate?: number | undefined;
    notes?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
    completed_at?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    total_amount_rub: number;
    escrow_amount_rub: number;
    payment_id: string;
    buyer_id: string;
    seller_id: string;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    service_booking_id?: string | undefined;
    escrow_status?: "HELD" | "RELEASED" | "REFUNDED" | undefined;
    delivery_id?: string | undefined;
    status?: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED" | undefined;
    delivery_amount_rub?: number | undefined;
    currency?: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH" | undefined;
    total_amount_original?: number | undefined;
    exchange_rate?: number | undefined;
    notes?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
    completed_at?: string | undefined;
}>;
export declare const CreateOrderSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    buyer_id: z.ZodString;
    seller_id: z.ZodString;
    listing_id: z.ZodOptional<z.ZodString>;
    vendor_product_id: z.ZodOptional<z.ZodString>;
    service_booking_id: z.ZodOptional<z.ZodString>;
    escrow_status: z.ZodDefault<z.ZodEnum<["HELD", "RELEASED", "REFUNDED"]>>;
    payment_id: z.ZodString;
    delivery_id: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "PAID", "FULFILLING", "DELIVERED", "CANCELLED"]>>;
    total_amount_rub: z.ZodNumber;
    escrow_amount_rub: z.ZodNumber;
    delivery_amount_rub: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>>;
    total_amount_original: z.ZodOptional<z.ZodNumber>;
    exchange_rate: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    cancelled_at: z.ZodOptional<z.ZodString>;
    cancelled_reason: z.ZodOptional<z.ZodString>;
    completed_at: z.ZodOptional<z.ZodString>;
}, "id" | "created_at" | "updated_at" | "completed_at" | "cancelled_at" | "cancelled_reason">, "strip", z.ZodTypeAny, {
    status: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED";
    escrow_status: "HELD" | "RELEASED" | "REFUNDED";
    total_amount_rub: number;
    escrow_amount_rub: number;
    payment_id: string;
    currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    buyer_id: string;
    seller_id: string;
    delivery_amount_rub: number;
    notes?: string | undefined;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    exchange_rate?: number | undefined;
    service_booking_id?: string | undefined;
    delivery_id?: string | undefined;
    total_amount_original?: number | undefined;
}, {
    total_amount_rub: number;
    escrow_amount_rub: number;
    payment_id: string;
    buyer_id: string;
    seller_id: string;
    status?: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED" | undefined;
    escrow_status?: "HELD" | "RELEASED" | "REFUNDED" | undefined;
    notes?: string | undefined;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    currency?: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH" | undefined;
    exchange_rate?: number | undefined;
    service_booking_id?: string | undefined;
    delivery_id?: string | undefined;
    delivery_amount_rub?: number | undefined;
    total_amount_original?: number | undefined;
}>;
export declare const UpdateOrderSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    buyer_id: z.ZodOptional<z.ZodString>;
    seller_id: z.ZodOptional<z.ZodString>;
    listing_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    vendor_product_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    service_booking_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    escrow_status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["HELD", "RELEASED", "REFUNDED"]>>>;
    payment_id: z.ZodOptional<z.ZodString>;
    delivery_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["PENDING", "PAID", "FULFILLING", "DELIVERED", "CANCELLED"]>>>;
    total_amount_rub: z.ZodOptional<z.ZodNumber>;
    escrow_amount_rub: z.ZodOptional<z.ZodNumber>;
    delivery_amount_rub: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>>>;
    total_amount_original: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    exchange_rate: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    notes: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cancelled_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    cancelled_reason: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    completed_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "id" | "created_at" | "updated_at" | "buyer_id" | "seller_id">, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED" | undefined;
    escrow_status?: "HELD" | "RELEASED" | "REFUNDED" | undefined;
    total_amount_rub?: number | undefined;
    escrow_amount_rub?: number | undefined;
    payment_id?: string | undefined;
    notes?: string | undefined;
    completed_at?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    currency?: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH" | undefined;
    exchange_rate?: number | undefined;
    service_booking_id?: string | undefined;
    delivery_id?: string | undefined;
    delivery_amount_rub?: number | undefined;
    total_amount_original?: number | undefined;
}, {
    status?: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED" | undefined;
    escrow_status?: "HELD" | "RELEASED" | "REFUNDED" | undefined;
    total_amount_rub?: number | undefined;
    escrow_amount_rub?: number | undefined;
    payment_id?: string | undefined;
    notes?: string | undefined;
    completed_at?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    currency?: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH" | undefined;
    exchange_rate?: number | undefined;
    service_booking_id?: string | undefined;
    delivery_id?: string | undefined;
    delivery_amount_rub?: number | undefined;
    total_amount_original?: number | undefined;
}>;
export declare const OrderWithRelationsSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "PAID", "FULFILLING", "DELIVERED", "CANCELLED"]>>;
    escrow_status: z.ZodDefault<z.ZodEnum<["HELD", "RELEASED", "REFUNDED"]>>;
    total_amount_rub: z.ZodNumber;
    escrow_amount_rub: z.ZodNumber;
    payment_id: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    completed_at: z.ZodOptional<z.ZodString>;
    cancelled_at: z.ZodOptional<z.ZodString>;
    cancelled_reason: z.ZodOptional<z.ZodString>;
    listing_id: z.ZodOptional<z.ZodString>;
    vendor_product_id: z.ZodOptional<z.ZodString>;
    currency: z.ZodDefault<z.ZodEnum<["USD", "EUR", "GBP", "RUB", "JPY", "CAD", "AUD", "CHF", "CNY", "KRW", "SGD", "HKD", "NZD", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "TRY", "BRL", "MXN", "INR", "ZAR", "THB", "MYR", "IDR", "PHP", "VND", "UAH"]>>;
    exchange_rate: z.ZodOptional<z.ZodNumber>;
    buyer_id: z.ZodString;
    seller_id: z.ZodString;
    service_booking_id: z.ZodOptional<z.ZodString>;
    delivery_id: z.ZodOptional<z.ZodString>;
    delivery_amount_rub: z.ZodDefault<z.ZodNumber>;
    total_amount_original: z.ZodOptional<z.ZodNumber>;
    buyer: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        country_of_origin: z.ZodString;
        city: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        phone?: string | undefined;
    }, {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        phone?: string | undefined;
    }>;
    seller: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        country_of_origin: z.ZodString;
        city: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        phone?: string | undefined;
    }, {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        phone?: string | undefined;
    }>;
    listing: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        price_rub: z.ZodNumber;
        photo_urls: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        price_rub: number;
        photo_urls: string[];
    }, {
        id: string;
        title: string;
        price_rub: number;
        photo_urls: string[];
    }>>;
    vendor_product: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        price_rub: z.ZodNumber;
        photo_urls: z.ZodArray<z.ZodString, "many">;
        vendor: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            name: string;
        };
    }, {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            name: string;
        };
    }>>;
    service_booking: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        service: z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            price_rub: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            price_rub: number;
        }, {
            id: string;
            title: string;
            price_rub: number;
        }>;
        scheduled_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        scheduled_at: string;
        service: {
            id: string;
            title: string;
            price_rub: number;
        };
    }, {
        id: string;
        scheduled_at: string;
        service: {
            id: string;
            title: string;
            price_rub: number;
        };
    }>>;
    payment: z.ZodObject<{
        id: z.ZodString;
        provider: z.ZodString;
        status: z.ZodString;
        amount_rub: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: string;
        provider: string;
        amount_rub: number;
    }, {
        id: string;
        status: string;
        provider: string;
        amount_rub: number;
    }>;
    delivery: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        status: z.ZodString;
        tracking_code: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: string;
        tracking_code?: string | undefined;
    }, {
        id: string;
        status: string;
        tracking_code?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED";
    escrow_status: "HELD" | "RELEASED" | "REFUNDED";
    total_amount_rub: number;
    escrow_amount_rub: number;
    payment_id: string;
    payment: {
        id: string;
        status: string;
        provider: string;
        amount_rub: number;
    };
    currency: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH";
    buyer_id: string;
    buyer: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        phone?: string | undefined;
    };
    seller_id: string;
    seller: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        phone?: string | undefined;
    };
    delivery_amount_rub: number;
    notes?: string | undefined;
    completed_at?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    exchange_rate?: number | undefined;
    service_booking_id?: string | undefined;
    delivery_id?: string | undefined;
    total_amount_original?: number | undefined;
    listing?: {
        id: string;
        title: string;
        price_rub: number;
        photo_urls: string[];
    } | undefined;
    vendor_product?: {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            name: string;
        };
    } | undefined;
    service_booking?: {
        id: string;
        scheduled_at: string;
        service: {
            id: string;
            title: string;
            price_rub: number;
        };
    } | undefined;
    delivery?: {
        id: string;
        status: string;
        tracking_code?: string | undefined;
    } | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    total_amount_rub: number;
    escrow_amount_rub: number;
    payment_id: string;
    payment: {
        id: string;
        status: string;
        provider: string;
        amount_rub: number;
    };
    buyer_id: string;
    buyer: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        phone?: string | undefined;
    };
    seller_id: string;
    seller: {
        id: string;
        city: string;
        email: string;
        country_of_origin: string;
        phone?: string | undefined;
    };
    status?: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED" | undefined;
    escrow_status?: "HELD" | "RELEASED" | "REFUNDED" | undefined;
    notes?: string | undefined;
    completed_at?: string | undefined;
    cancelled_at?: string | undefined;
    cancelled_reason?: string | undefined;
    listing_id?: string | undefined;
    vendor_product_id?: string | undefined;
    currency?: "USD" | "EUR" | "GBP" | "RUB" | "JPY" | "CAD" | "AUD" | "CHF" | "CNY" | "KRW" | "SGD" | "HKD" | "NZD" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "TRY" | "BRL" | "MXN" | "INR" | "ZAR" | "THB" | "MYR" | "IDR" | "PHP" | "VND" | "UAH" | undefined;
    exchange_rate?: number | undefined;
    service_booking_id?: string | undefined;
    delivery_id?: string | undefined;
    delivery_amount_rub?: number | undefined;
    total_amount_original?: number | undefined;
    listing?: {
        id: string;
        title: string;
        price_rub: number;
        photo_urls: string[];
    } | undefined;
    vendor_product?: {
        id: string;
        price_rub: number;
        name: string;
        photo_urls: string[];
        vendor: {
            id: string;
            name: string;
        };
    } | undefined;
    service_booking?: {
        id: string;
        scheduled_at: string;
        service: {
            id: string;
            title: string;
            price_rub: number;
        };
    } | undefined;
    delivery?: {
        id: string;
        status: string;
        tracking_code?: string | undefined;
    } | undefined;
}>;
export declare const OrderFiltersSchema: z.ZodObject<{
    buyer_id: z.ZodOptional<z.ZodString>;
    seller_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "PAID", "FULFILLING", "DELIVERED", "CANCELLED"]>>;
    escrow_status: z.ZodOptional<z.ZodEnum<["HELD", "RELEASED", "REFUNDED"]>>;
    date_from: z.ZodOptional<z.ZodString>;
    date_to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    buyer_id?: string | undefined;
    seller_id?: string | undefined;
    status?: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED" | undefined;
    escrow_status?: "HELD" | "RELEASED" | "REFUNDED" | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
}, {
    buyer_id?: string | undefined;
    seller_id?: string | undefined;
    status?: "PENDING" | "PAID" | "FULFILLING" | "DELIVERED" | "CANCELLED" | undefined;
    escrow_status?: "HELD" | "RELEASED" | "REFUNDED" | undefined;
    date_from?: string | undefined;
    date_to?: string | undefined;
}>;
export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type OrderWithRelations = z.infer<typeof OrderWithRelationsSchema>;
export type OrderFilters = z.infer<typeof OrderFiltersSchema>;
//# sourceMappingURL=orders.d.ts.map