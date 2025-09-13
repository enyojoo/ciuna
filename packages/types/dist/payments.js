import { z } from 'zod';
import { BaseRecordSchema, RubleAmountSchema, PaymentProviderSchema, PaymentStatusSchema } from './common';
// Payment
export const PaymentSchema = BaseRecordSchema.extend({
    provider: PaymentProviderSchema,
    provider_ref: z.string(),
    amount_rub: RubleAmountSchema,
    status: PaymentStatusSchema.default('AUTHORIZED'),
    currency: z.string().default('RUB'),
    description: z.string().optional(),
    metadata: z.record(z.any()).default({}),
    failure_reason: z.string().optional(),
    processed_at: z.string().datetime().optional(),
    refunded_amount_rub: RubleAmountSchema.default(0),
    refunded_at: z.string().datetime().optional(),
});
// Payment creation
export const CreatePaymentSchema = PaymentSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    processed_at: true,
    refunded_amount_rub: true,
    refunded_at: true,
});
// Payment update
export const UpdatePaymentSchema = PaymentSchema.partial().omit({
    id: true,
    created_at: true,
    updated_at: true,
});
// Payment with order
export const PaymentWithOrderSchema = PaymentSchema.extend({
    order: z.object({
        id: z.string().uuid(),
        buyer_id: z.string().uuid(),
        seller_id: z.string().uuid(),
        total_amount_rub: z.number().int().min(0),
        status: z.string(),
    }),
});
// Payment intent (for frontend)
export const PaymentIntentSchema = z.object({
    id: z.string().uuid(),
    amount_rub: RubleAmountSchema,
    currency: z.string().default('RUB'),
    description: z.string().optional(),
    client_secret: z.string().optional(),
    status: PaymentStatusSchema,
    metadata: z.record(z.any()).default({}),
});
// Refund
export const RefundSchema = BaseRecordSchema.extend({
    payment_id: z.string().uuid(),
    amount_rub: RubleAmountSchema,
    reason: z.string().optional(),
    status: z.enum(['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED']).default('PENDING'),
    provider_ref: z.string().optional(),
    processed_at: z.string().datetime().optional(),
    failure_reason: z.string().optional(),
});
// Refund creation
export const CreateRefundSchema = RefundSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    processed_at: true,
});
//# sourceMappingURL=payments.js.map