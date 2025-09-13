import { z } from 'zod';
import { BaseRecordSchema, UUIDSchema, RubleAmountSchema, ConditionSchema, ListingStatusSchema, FileUploadSchema } from './common';
import { CurrencyCodeSchema } from './currency';
// P2P Listing
export const ListingSchema = BaseRecordSchema.extend({
    seller_id: UUIDSchema,
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    category_id: z.string().uuid(),
    price_rub: RubleAmountSchema,
    currency: CurrencyCodeSchema.default('RUB'),
    price_original: z.number().int().min(0).optional(),
    exchange_rate: z.number().positive().optional(),
    condition: ConditionSchema,
    city: z.string().min(1).max(100),
    district: z.string().optional(),
    photo_urls: z.array(z.string().url()).max(10).default([]),
    status: ListingStatusSchema.default('ACTIVE'),
    is_negotiable: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    view_count: z.number().int().min(0).default(0),
    favorite_count: z.number().int().min(0).default(0),
    expires_at: z.string().datetime().optional(),
});
// Listing creation
export const CreateListingSchema = ListingSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    view_count: true,
    favorite_count: true,
});
// Listing update
export const UpdateListingSchema = ListingSchema.partial().omit({
    id: true,
    seller_id: true,
    created_at: true,
    updated_at: true,
    view_count: true,
    favorite_count: true,
});
// Listing with relations
export const ListingWithRelationsSchema = ListingSchema.extend({
    seller: z.object({
        id: UUIDSchema,
        email: z.string().email(),
        country_of_origin: z.string(),
        city: z.string(),
        verified_expat: z.boolean(),
    }),
    category: z.object({
        id: z.string().uuid(),
        name: z.string(),
        slug: z.string(),
    }),
    photos: z.array(FileUploadSchema).optional(),
});
// Listing search filters
export const ListingFiltersSchema = z.object({
    category_id: z.string().uuid().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    min_price: RubleAmountSchema.optional(),
    max_price: RubleAmountSchema.optional(),
    condition: ConditionSchema.optional(),
    status: ListingStatusSchema.optional(),
    search: z.string().optional(),
    tags: z.array(z.string()).optional(),
    seller_id: UUIDSchema.optional(),
});
// Listing search response
export const ListingSearchResponseSchema = z.object({
    listings: z.array(ListingWithRelationsSchema),
    total: z.number().int().min(0),
    filters: ListingFiltersSchema,
});
//# sourceMappingURL=listings.js.map