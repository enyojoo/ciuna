import { z } from 'zod';
import { BaseRecordSchema, UUIDSchema, RubleAmountSchema, OrderStatusSchema, EscrowStatusSchema } from './common';
import { CurrencyCodeSchema } from './currency';

// Order
export const OrderSchema = BaseRecordSchema.extend({
  buyer_id: UUIDSchema,
  seller_id: UUIDSchema,
  listing_id: z.string().uuid().optional(),
  vendor_product_id: z.string().uuid().optional(),
  service_booking_id: z.string().uuid().optional(),
  escrow_status: EscrowStatusSchema.default('HELD'),
  payment_id: z.string().uuid(),
  delivery_id: z.string().uuid().optional(),
  status: OrderStatusSchema.default('PENDING'),
  total_amount_rub: RubleAmountSchema,
  escrow_amount_rub: RubleAmountSchema,
  delivery_amount_rub: RubleAmountSchema.default(0),
  currency: CurrencyCodeSchema.default('RUB'),
  total_amount_original: z.number().int().min(0).optional(),
  exchange_rate: z.number().positive().optional(),
  notes: z.string().optional(),
  cancelled_at: z.string().datetime().optional(),
  cancelled_reason: z.string().optional(),
  completed_at: z.string().datetime().optional(),
});

// Order creation
export const CreateOrderSchema = OrderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  cancelled_at: true,
  cancelled_reason: true,
  completed_at: true,
});

// Order update
export const UpdateOrderSchema = OrderSchema.partial().omit({
  id: true,
  buyer_id: true,
  seller_id: true,
  created_at: true,
  updated_at: true,
});

// Order with relations
export const OrderWithRelationsSchema = OrderSchema.extend({
  buyer: z.object({
    id: UUIDSchema,
    email: z.string().email(),
    country_of_origin: z.string(),
    city: z.string(),
    phone: z.string().optional(),
  }),
  seller: z.object({
    id: UUIDSchema,
    email: z.string().email(),
    country_of_origin: z.string(),
    city: z.string(),
    phone: z.string().optional(),
  }),
  listing: z.object({
    id: z.string().uuid(),
    title: z.string(),
    price_rub: z.number().int().min(0),
    photo_urls: z.array(z.string().url()),
  }).optional(),
  vendor_product: z.object({
    id: z.string().uuid(),
    name: z.string(),
    price_rub: z.number().int().min(0),
    photo_urls: z.array(z.string().url()),
    vendor: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  }).optional(),
  service_booking: z.object({
    id: z.string().uuid(),
    service: z.object({
      id: z.string().uuid(),
      title: z.string(),
      price_rub: z.number().int().min(0),
    }),
    scheduled_at: z.string().datetime(),
  }).optional(),
  payment: z.object({
    id: z.string().uuid(),
    provider: z.string(),
    status: z.string(),
    amount_rub: z.number().int().min(0),
  }),
  delivery: z.object({
    id: z.string().uuid(),
    status: z.string(),
    tracking_code: z.string().optional(),
  }).optional(),
});

// Order filters
export const OrderFiltersSchema = z.object({
  buyer_id: UUIDSchema.optional(),
  seller_id: UUIDSchema.optional(),
  status: OrderStatusSchema.optional(),
  escrow_status: EscrowStatusSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;
export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;
export type OrderWithRelations = z.infer<typeof OrderWithRelationsSchema>;
export type OrderFilters = z.infer<typeof OrderFiltersSchema>;
