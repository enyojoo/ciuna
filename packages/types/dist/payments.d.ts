import { z } from 'zod';
export declare const PaymentSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    provider: z.ZodEnum<["MOCKPAY", "YOOMONEY", "SBER", "TINKOFF"]>;
    provider_ref: z.ZodString;
    amount_rub: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["AUTHORIZED", "CAPTURED", "CANCELLED", "REFUNDED"]>>;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    failure_reason: z.ZodOptional<z.ZodString>;
    processed_at: z.ZodOptional<z.ZodString>;
    refunded_amount_rub: z.ZodDefault<z.ZodNumber>;
    refunded_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED";
    provider: "MOCKPAY" | "YOOMONEY" | "SBER" | "TINKOFF";
    amount_rub: number;
    currency: string;
    provider_ref: string;
    metadata: Record<string, any>;
    refunded_amount_rub: number;
    description?: string | undefined;
    failure_reason?: string | undefined;
    processed_at?: string | undefined;
    refunded_at?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    provider: "MOCKPAY" | "YOOMONEY" | "SBER" | "TINKOFF";
    amount_rub: number;
    provider_ref: string;
    status?: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED" | undefined;
    description?: string | undefined;
    currency?: string | undefined;
    metadata?: Record<string, any> | undefined;
    failure_reason?: string | undefined;
    processed_at?: string | undefined;
    refunded_amount_rub?: number | undefined;
    refunded_at?: string | undefined;
}>;
export declare const CreatePaymentSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    provider: z.ZodEnum<["MOCKPAY", "YOOMONEY", "SBER", "TINKOFF"]>;
    provider_ref: z.ZodString;
    amount_rub: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["AUTHORIZED", "CAPTURED", "CANCELLED", "REFUNDED"]>>;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    failure_reason: z.ZodOptional<z.ZodString>;
    processed_at: z.ZodOptional<z.ZodString>;
    refunded_amount_rub: z.ZodDefault<z.ZodNumber>;
    refunded_at: z.ZodOptional<z.ZodString>;
}, "id" | "created_at" | "updated_at" | "processed_at" | "refunded_amount_rub" | "refunded_at">, "strip", z.ZodTypeAny, {
    status: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED";
    provider: "MOCKPAY" | "YOOMONEY" | "SBER" | "TINKOFF";
    amount_rub: number;
    currency: string;
    provider_ref: string;
    metadata: Record<string, any>;
    description?: string | undefined;
    failure_reason?: string | undefined;
}, {
    provider: "MOCKPAY" | "YOOMONEY" | "SBER" | "TINKOFF";
    amount_rub: number;
    provider_ref: string;
    status?: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED" | undefined;
    description?: string | undefined;
    currency?: string | undefined;
    metadata?: Record<string, any> | undefined;
    failure_reason?: string | undefined;
}>;
export declare const UpdatePaymentSchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodString>;
    created_at: z.ZodOptional<z.ZodString>;
    updated_at: z.ZodOptional<z.ZodString>;
    provider: z.ZodOptional<z.ZodEnum<["MOCKPAY", "YOOMONEY", "SBER", "TINKOFF"]>>;
    provider_ref: z.ZodOptional<z.ZodString>;
    amount_rub: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["AUTHORIZED", "CAPTURED", "CANCELLED", "REFUNDED"]>>>;
    currency: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>>;
    failure_reason: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    processed_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    refunded_amount_rub: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    refunded_at: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "id" | "created_at" | "updated_at">, "strip", z.ZodTypeAny, {
    status?: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED" | undefined;
    description?: string | undefined;
    provider?: "MOCKPAY" | "YOOMONEY" | "SBER" | "TINKOFF" | undefined;
    amount_rub?: number | undefined;
    currency?: string | undefined;
    provider_ref?: string | undefined;
    metadata?: Record<string, any> | undefined;
    failure_reason?: string | undefined;
    processed_at?: string | undefined;
    refunded_amount_rub?: number | undefined;
    refunded_at?: string | undefined;
}, {
    status?: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED" | undefined;
    description?: string | undefined;
    provider?: "MOCKPAY" | "YOOMONEY" | "SBER" | "TINKOFF" | undefined;
    amount_rub?: number | undefined;
    currency?: string | undefined;
    provider_ref?: string | undefined;
    metadata?: Record<string, any> | undefined;
    failure_reason?: string | undefined;
    processed_at?: string | undefined;
    refunded_amount_rub?: number | undefined;
    refunded_at?: string | undefined;
}>;
export declare const PaymentWithOrderSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    provider: z.ZodEnum<["MOCKPAY", "YOOMONEY", "SBER", "TINKOFF"]>;
    provider_ref: z.ZodString;
    amount_rub: z.ZodNumber;
    status: z.ZodDefault<z.ZodEnum<["AUTHORIZED", "CAPTURED", "CANCELLED", "REFUNDED"]>>;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    failure_reason: z.ZodOptional<z.ZodString>;
    processed_at: z.ZodOptional<z.ZodString>;
    refunded_amount_rub: z.ZodDefault<z.ZodNumber>;
    refunded_at: z.ZodOptional<z.ZodString>;
} & {
    order: z.ZodObject<{
        id: z.ZodString;
        buyer_id: z.ZodString;
        seller_id: z.ZodString;
        total_amount_rub: z.ZodNumber;
        status: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: string;
        total_amount_rub: number;
        buyer_id: string;
        seller_id: string;
    }, {
        id: string;
        status: string;
        total_amount_rub: number;
        buyer_id: string;
        seller_id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED";
    provider: "MOCKPAY" | "YOOMONEY" | "SBER" | "TINKOFF";
    amount_rub: number;
    currency: string;
    provider_ref: string;
    metadata: Record<string, any>;
    refunded_amount_rub: number;
    order: {
        id: string;
        status: string;
        total_amount_rub: number;
        buyer_id: string;
        seller_id: string;
    };
    description?: string | undefined;
    failure_reason?: string | undefined;
    processed_at?: string | undefined;
    refunded_at?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    provider: "MOCKPAY" | "YOOMONEY" | "SBER" | "TINKOFF";
    amount_rub: number;
    provider_ref: string;
    order: {
        id: string;
        status: string;
        total_amount_rub: number;
        buyer_id: string;
        seller_id: string;
    };
    status?: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED" | undefined;
    description?: string | undefined;
    currency?: string | undefined;
    metadata?: Record<string, any> | undefined;
    failure_reason?: string | undefined;
    processed_at?: string | undefined;
    refunded_amount_rub?: number | undefined;
    refunded_at?: string | undefined;
}>;
export declare const PaymentIntentSchema: z.ZodObject<{
    id: z.ZodString;
    amount_rub: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    client_secret: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<["AUTHORIZED", "CAPTURED", "CANCELLED", "REFUNDED"]>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED";
    amount_rub: number;
    currency: string;
    metadata: Record<string, any>;
    description?: string | undefined;
    client_secret?: string | undefined;
}, {
    id: string;
    status: "CANCELLED" | "REFUNDED" | "AUTHORIZED" | "CAPTURED";
    amount_rub: number;
    description?: string | undefined;
    currency?: string | undefined;
    metadata?: Record<string, any> | undefined;
    client_secret?: string | undefined;
}>;
export declare const RefundSchema: z.ZodObject<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    payment_id: z.ZodString;
    amount_rub: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "SUCCEEDED", "FAILED", "CANCELLED"]>>;
    provider_ref: z.ZodOptional<z.ZodString>;
    processed_at: z.ZodOptional<z.ZodString>;
    failure_reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    status: "PENDING" | "CANCELLED" | "FAILED" | "SUCCEEDED";
    payment_id: string;
    amount_rub: number;
    provider_ref?: string | undefined;
    failure_reason?: string | undefined;
    processed_at?: string | undefined;
    reason?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    payment_id: string;
    amount_rub: number;
    status?: "PENDING" | "CANCELLED" | "FAILED" | "SUCCEEDED" | undefined;
    provider_ref?: string | undefined;
    failure_reason?: string | undefined;
    processed_at?: string | undefined;
    reason?: string | undefined;
}>;
export declare const CreateRefundSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
} & {
    payment_id: z.ZodString;
    amount_rub: z.ZodNumber;
    reason: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["PENDING", "SUCCEEDED", "FAILED", "CANCELLED"]>>;
    provider_ref: z.ZodOptional<z.ZodString>;
    processed_at: z.ZodOptional<z.ZodString>;
    failure_reason: z.ZodOptional<z.ZodString>;
}, "id" | "created_at" | "updated_at" | "processed_at">, "strip", z.ZodTypeAny, {
    status: "PENDING" | "CANCELLED" | "FAILED" | "SUCCEEDED";
    payment_id: string;
    amount_rub: number;
    provider_ref?: string | undefined;
    failure_reason?: string | undefined;
    reason?: string | undefined;
}, {
    payment_id: string;
    amount_rub: number;
    status?: "PENDING" | "CANCELLED" | "FAILED" | "SUCCEEDED" | undefined;
    provider_ref?: string | undefined;
    failure_reason?: string | undefined;
    reason?: string | undefined;
}>;
export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePayment = z.infer<typeof CreatePaymentSchema>;
export type UpdatePayment = z.infer<typeof UpdatePaymentSchema>;
export type PaymentWithOrder = z.infer<typeof PaymentWithOrderSchema>;
export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;
export type Refund = z.infer<typeof RefundSchema>;
export type CreateRefund = z.infer<typeof CreateRefundSchema>;
//# sourceMappingURL=payments.d.ts.map