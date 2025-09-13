import { z } from 'zod';
import { BaseRecordSchema, UUIDSchema, RubleAmountSchema, ServiceCategorySchema, ProviderStatusSchema } from './common';

// Service provider
export const ServiceProviderSchema = BaseRecordSchema.extend({
  profile_id: UUIDSchema,
  name: z.string().min(1).max(200),
  bio: z.string().min(1).max(2000),
  skills: z.array(z.string()).default([]),
  credentials: z.record(z.any()).default({}),
  verified: z.boolean().default(false),
  status: ProviderStatusSchema.default('ACTIVE'),
  rating: z.number().min(0).max(5).default(0),
  review_count: z.number().int().min(0).default(0),
  total_bookings: z.number().int().min(0).default(0),
  response_time_hours: z.number().positive().optional(),
  completion_rate: z.number().min(0).max(1).default(1),
  languages: z.array(z.string()).default([]),
  service_areas: z.array(z.string()).default([]),
  portfolio_urls: z.array(z.string().url()).default([]),
  social_links: z.record(z.string().url()).default({}),
  hourly_rate_rub: RubleAmountSchema.optional(),
  min_project_value_rub: RubleAmountSchema.optional(),
  max_project_value_rub: RubleAmountSchema.optional(),
});

// Service provider creation
export const CreateServiceProviderSchema = ServiceProviderSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  rating: true,
  review_count: true,
  total_bookings: true,
  completion_rate: true,
});

// Service provider update
export const UpdateServiceProviderSchema = ServiceProviderSchema.partial().omit({
  id: true,
  profile_id: true,
  created_at: true,
  updated_at: true,
  rating: true,
  review_count: true,
  total_bookings: true,
  completion_rate: true,
});

// Service
export const ServiceSchema = BaseRecordSchema.extend({
  provider_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: ServiceCategorySchema,
  price_rub: RubleAmountSchema,
  duration_minutes: z.number().int().positive(),
  available_slots: z.record(z.any()).default({}), // Calendar availability
  is_online: z.boolean().default(false),
  is_in_person: z.boolean().default(true),
  location: z.string().optional(),
  max_participants: z.number().int().positive().default(1),
  requirements: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  cancellation_policy: z.string().max(1000).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  tags: z.array(z.string()).default([]),
  view_count: z.number().int().min(0).default(0),
  booking_count: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).default(0),
  review_count: z.number().int().min(0).default(0),
});

// Service creation
export const CreateServiceSchema = ServiceSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  view_count: true,
  booking_count: true,
  rating: true,
  review_count: true,
});

// Service update
export const UpdateServiceSchema = ServiceSchema.partial().omit({
  id: true,
  provider_id: true,
  created_at: true,
  updated_at: true,
  view_count: true,
  booking_count: true,
  rating: true,
  review_count: true,
});

// Service with relations
export const ServiceWithRelationsSchema = ServiceSchema.extend({
  provider: z.object({
    id: z.string().uuid(),
    name: z.string(),
    bio: z.string(),
    verified: z.boolean(),
    rating: z.number().min(0).max(5),
    review_count: z.number().int().min(0),
    response_time_hours: z.number().positive().optional(),
    languages: z.array(z.string()),
  }),
  category_info: z.object({
    name: z.string(),
    description: z.string().optional(),
  }),
  reviews: z.object({
    average_rating: z.number().min(0).max(5),
    total_count: z.number().int().min(0),
  }).optional(),
});

// Service search filters
export const ServiceFiltersSchema = z.object({
  provider_id: z.string().uuid().optional(),
  category: ServiceCategorySchema.optional(),
  min_price: RubleAmountSchema.optional(),
  max_price: RubleAmountSchema.optional(),
  is_online: z.boolean().optional(),
  is_in_person: z.boolean().optional(),
  location: z.string().optional(),
  min_rating: z.number().min(0).max(5).optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  available_date: z.string().datetime().optional(),
  max_duration: z.number().int().positive().optional(),
  min_duration: z.number().int().positive().optional(),
});

// Service search response
export const ServiceSearchResponseSchema = z.object({
  services: z.array(ServiceWithRelationsSchema),
  total: z.number().int().min(0),
  filters: ServiceFiltersSchema,
  aggregations: z.object({
    price_ranges: z.array(z.object({
      min: z.number(),
      max: z.number(),
      count: z.number().int().min(0),
    })),
    categories: z.array(z.object({
      name: z.string(),
      count: z.number().int().min(0),
    })),
    providers: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      count: z.number().int().min(0),
    })),
  }).optional(),
});

// Service provider verification
export const ServiceProviderVerificationSchema = BaseRecordSchema.extend({
  provider_id: z.string().uuid(),
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

// Service provider stats
export const ServiceProviderStatsSchema = z.object({
  total_services: z.number().int().min(0),
  active_services: z.number().int().min(0),
  total_bookings: z.number().int().min(0),
  pending_bookings: z.number().int().min(0),
  completed_bookings: z.number().int().min(0),
  total_revenue: z.number().int().min(0),
  monthly_revenue: z.number().int().min(0),
  average_rating: z.number().min(0).max(5),
  total_reviews: z.number().int().min(0),
  response_rate: z.number().min(0).max(1),
  completion_rate: z.number().min(0).max(1),
});

export type ServiceProvider = z.infer<typeof ServiceProviderSchema>;
export type CreateServiceProvider = z.infer<typeof CreateServiceProviderSchema>;
export type UpdateServiceProvider = z.infer<typeof UpdateServiceProviderSchema>;

// Service provider with profile
export const ServiceProviderWithProfileSchema = ServiceProviderSchema.extend({
  profile: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.enum(['USER', 'VENDOR', 'COURIER', 'ADMIN']),
    country_of_origin: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    phone: z.string().optional(),
    verified_expat: z.boolean(),
    verification_status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

export type ServiceProviderWithProfile = z.infer<typeof ServiceProviderWithProfileSchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type CreateService = z.infer<typeof CreateServiceSchema>;
export type UpdateService = z.infer<typeof UpdateServiceSchema>;
export type ServiceWithRelations = z.infer<typeof ServiceWithRelationsSchema>;
export type ServiceFilters = z.infer<typeof ServiceFiltersSchema>;
export type ServiceSearchResponse = z.infer<typeof ServiceSearchResponseSchema>;
export type ServiceProviderVerification = z.infer<typeof ServiceProviderVerificationSchema>;
export type ServiceProviderStats = z.infer<typeof ServiceProviderStatsSchema>;
