import { z } from 'zod';
import { BaseRecordSchema, UUIDSchema, RubleAmountSchema, GroupBuyStatusSchema } from './common';

// Group buy deal
export const GroupBuyDealSchema = BaseRecordSchema.extend({
  vendor_product_id: z.string().uuid(),
  min_quantity: z.number().int().min(2),
  discount_percentage: z.number().min(0).max(100),
  expires_at: z.string().datetime(),
  status: GroupBuyStatusSchema.default('ACTIVE'),
  current_quantity: z.number().int().min(0).default(0),
  max_quantity: z.number().int().positive().optional(),
  description: z.string().max(1000).optional(),
  terms: z.string().max(2000).optional(),
  is_featured: z.boolean().default(false),
  featured_until: z.string().datetime().optional(),
});

// Group buy deal creation
export const CreateGroupBuyDealSchema = GroupBuyDealSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  current_quantity: true,
});

// Group buy deal update
export const UpdateGroupBuyDealSchema = GroupBuyDealSchema.partial().omit({
  id: true,
  vendor_product_id: true,
  created_at: true,
  updated_at: true,
  current_quantity: true,
});

// Group buy order
export const GroupBuyOrderSchema = BaseRecordSchema.extend({
  deal_id: z.string().uuid(),
  buyer_id: UUIDSchema,
  quantity: z.number().int().min(1),
  price_per_unit_rub: RubleAmountSchema,
  total_amount_rub: RubleAmountSchema,
  discount_amount_rub: RubleAmountSchema,
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED']).default('PENDING'),
  payment_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  cancelled_at: z.string().datetime().optional(),
  cancelled_reason: z.string().optional(),
});

// Group buy order creation
export const CreateGroupBuyOrderSchema = GroupBuyOrderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  cancelled_at: true,
  cancelled_reason: true,
});

// Group buy order update
export const UpdateGroupBuyOrderSchema = GroupBuyOrderSchema.partial().omit({
  id: true,
  deal_id: true,
  buyer_id: true,
  created_at: true,
  updated_at: true,
  cancelled_at: true,
  cancelled_reason: true,
});

// Group buy deal with relations
export const GroupBuyDealWithRelationsSchema = GroupBuyDealSchema.extend({
  vendor_product: z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    price_rub: z.number().int().min(0),
    photo_urls: z.array(z.string().url()),
    vendor: z.object({
      id: z.string().uuid(),
      name: z.string(),
      country: z.string(),
      city: z.string(),
      verified: z.boolean(),
    }),
  }),
  orders: z.array(z.object({
    id: z.string().uuid(),
    buyer_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    total_amount_rub: z.number().int().min(0),
    status: z.string(),
    created_at: z.string().datetime(),
  })),
  participants: z.array(z.object({
    id: z.string().uuid(),
    buyer: z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      country_of_origin: z.string(),
      city: z.string(),
    }),
    quantity: z.number().int().min(1),
    joined_at: z.string().datetime(),
  })),
});

// Group buy order with relations
export const GroupBuyOrderWithRelationsSchema = GroupBuyOrderSchema.extend({
  deal: z.object({
    id: z.string().uuid(),
    vendor_product_id: z.string().uuid(),
    min_quantity: z.number().int().min(2),
    discount_percentage: z.number().min(0).max(100),
    expires_at: z.string().datetime(),
    status: z.string(),
    current_quantity: z.number().int().min(0),
  }),
  buyer: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    country_of_origin: z.string(),
    city: z.string(),
  }),
  vendor_product: z.object({
    id: z.string().uuid(),
    name: z.string(),
    price_rub: z.number().int().min(0),
    photo_urls: z.array(z.string().url()),
  }),
});

// Group buy stats
export const GroupBuyStatsSchema = z.object({
  total_deals: z.number().int().min(0),
  active_deals: z.number().int().min(0),
  completed_deals: z.number().int().min(0),
  total_orders: z.number().int().min(0),
  total_savings: z.number().int().min(0),
  average_discount: z.number().min(0).max(100),
});

// Group buy filters
export const GroupBuyFiltersSchema = z.object({
  vendor_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  status: GroupBuyStatusSchema.optional(),
  min_discount: z.number().min(0).max(100).optional(),
  max_discount: z.number().min(0).max(100).optional(),
  expires_after: z.string().datetime().optional(),
  expires_before: z.string().datetime().optional(),
  is_featured: z.boolean().optional(),
  search: z.string().optional(),
});

export type GroupBuyDeal = z.infer<typeof GroupBuyDealSchema>;
export type CreateGroupBuyDeal = z.infer<typeof CreateGroupBuyDealSchema>;
export type UpdateGroupBuyDeal = z.infer<typeof UpdateGroupBuyDealSchema>;
export type GroupBuyOrder = z.infer<typeof GroupBuyOrderSchema>;
export type CreateGroupBuyOrder = z.infer<typeof CreateGroupBuyOrderSchema>;
export type UpdateGroupBuyOrder = z.infer<typeof UpdateGroupBuyOrderSchema>;
export type GroupBuyDealWithRelations = z.infer<typeof GroupBuyDealWithRelationsSchema>;
export type GroupBuyOrderWithRelations = z.infer<typeof GroupBuyOrderWithRelationsSchema>;
export type GroupBuyStats = z.infer<typeof GroupBuyStatsSchema>;
export type GroupBuyFilters = z.infer<typeof GroupBuyFiltersSchema>;
