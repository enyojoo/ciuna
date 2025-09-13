import { z } from 'zod';
import { BaseRecordSchema, UUIDSchema, VendorTypeSchema, VendorStatusSchema } from './common';
// Vendor
export const VendorSchema = BaseRecordSchema.extend({
    owner_id: UUIDSchema,
    name: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    logo_url: z.string().url().optional(),
    country: z.string().min(2).max(2), // ISO country code
    city: z.string().min(1).max(100),
    district: z.string().optional(),
    verified: z.boolean().default(false),
    type: VendorTypeSchema,
    status: VendorStatusSchema.default('ACTIVE'),
    business_license: z.string().optional(),
    tax_id: z.string().optional(),
    bank_details: z.record(z.any()).optional(),
    contact_email: z.string().email().optional(),
    contact_phone: z.string().optional(),
    website: z.string().url().optional(),
    social_links: z.record(z.string().url()).default({}),
    rating: z.number().min(0).max(5).default(0),
    review_count: z.number().int().min(0).default(0),
    total_sales: z.number().int().min(0).default(0),
    commission_rate: z.number().min(0).max(1).default(0.1), // 10% default
});
// Vendor creation
export const CreateVendorSchema = VendorSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    rating: true,
    review_count: true,
    total_sales: true,
});
// Vendor update
export const UpdateVendorSchema = VendorSchema.partial().omit({
    id: true,
    owner_id: true,
    created_at: true,
    updated_at: true,
    rating: true,
    review_count: true,
    total_sales: true,
});
// Vendor with owner
export const VendorWithOwnerSchema = VendorSchema.extend({
    owner: z.object({
        id: UUIDSchema,
        email: z.string().email(),
        country_of_origin: z.string(),
        city: z.string(),
        verified_expat: z.boolean(),
    }),
});
// Vendor verification
export const VendorVerificationSchema = BaseRecordSchema.extend({
    vendor_id: z.string().uuid(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).default('PENDING'),
    documents: z.array(z.object({
        type: z.string(),
        url: z.string().url(),
        filename: z.string(),
    })),
    admin_notes: z.string().optional(),
    verified_at: z.string().datetime().optional(),
    verified_by: z.string().uuid().optional(),
});
// Vendor stats
export const VendorStatsSchema = z.object({
    total_products: z.number().int().min(0),
    active_products: z.number().int().min(0),
    total_orders: z.number().int().min(0),
    pending_orders: z.number().int().min(0),
    total_revenue: z.number().int().min(0),
    monthly_revenue: z.number().int().min(0),
    average_rating: z.number().min(0).max(5),
    total_reviews: z.number().int().min(0),
});
// Vendor filters
export const VendorFiltersSchema = z.object({
    type: VendorTypeSchema.optional(),
    status: VendorStatusSchema.optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    verified: z.boolean().optional(),
    min_rating: z.number().min(0).max(5).optional(),
    search: z.string().optional(),
});
//# sourceMappingURL=vendors.js.map