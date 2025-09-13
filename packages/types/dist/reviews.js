import { z } from 'zod';
import { BaseRecordSchema, UUIDSchema, RatingSchema } from './common';
// Review
export const ReviewSchema = BaseRecordSchema.extend({
    order_id: z.string().uuid(),
    reviewer_id: UUIDSchema,
    reviewee_id: UUIDSchema,
    rating: RatingSchema,
    comment: z.string().max(1000).optional(),
    is_anonymous: z.boolean().default(false),
    helpful_count: z.number().int().min(0).default(0),
    is_verified_purchase: z.boolean().default(true),
});
// Review creation
export const CreateReviewSchema = ReviewSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    helpful_count: true,
});
// Review update
export const UpdateReviewSchema = ReviewSchema.partial().omit({
    id: true,
    order_id: true,
    reviewer_id: true,
    reviewee_id: true,
    created_at: true,
    updated_at: true,
    helpful_count: true,
});
// Review with reviewer
export const ReviewWithReviewerSchema = ReviewSchema.extend({
    reviewer: z.object({
        id: UUIDSchema,
        email: z.string().email(),
        country_of_origin: z.string(),
        city: z.string(),
        verified_expat: z.boolean(),
    }),
    order: z.object({
        id: z.string().uuid(),
        listing: z.object({
            id: z.string().uuid(),
            title: z.string(),
        }).optional(),
        vendor_product: z.object({
            id: z.string().uuid(),
            name: z.string(),
        }).optional(),
        service_booking: z.object({
            id: z.string().uuid(),
            service: z.object({
                id: z.string().uuid(),
                title: z.string(),
            }),
        }).optional(),
    }),
});
// Review summary
export const ReviewSummarySchema = z.object({
    total_reviews: z.number().int().min(0),
    average_rating: z.number().min(1).max(5),
    rating_distribution: z.object({
        5: z.number().int().min(0),
        4: z.number().int().min(0),
        3: z.number().int().min(0),
        2: z.number().int().min(0),
        1: z.number().int().min(0),
    }),
    recent_reviews: z.array(ReviewWithReviewerSchema),
});
// Review filters
export const ReviewFiltersSchema = z.object({
    reviewee_id: UUIDSchema.optional(),
    rating: RatingSchema.optional(),
    is_verified_purchase: z.boolean().optional(),
    date_from: z.string().datetime().optional(),
    date_to: z.string().datetime().optional(),
});
//# sourceMappingURL=reviews.js.map