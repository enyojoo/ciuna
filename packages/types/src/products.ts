import { z } from 'zod';
import { BaseRecordSchema, UUIDSchema, RubleAmountSchema, ProductStatusSchema, FileUploadSchema } from './common';

// Vendor Product
export const VendorProductSchema = BaseRecordSchema.extend({
  vendor_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category_id: z.string().uuid(),
  price_rub: RubleAmountSchema,
  stock_quantity: z.number().int().min(0).default(0),
  photo_urls: z.array(z.string().url()).max(20).default([]),
  is_local_stock: z.boolean().default(true),
  is_dropship: z.boolean().default(false),
  status: ProductStatusSchema.default('ACTIVE'),
  sku: z.string().optional(),
  weight_kg: z.number().positive().optional(),
  dimensions: z.object({
    length_cm: z.number().positive(),
    width_cm: z.number().positive(),
    height_cm: z.number().positive(),
  }).optional(),
  tags: z.array(z.string()).default([]),
  specifications: z.record(z.any()).default({}),
  shipping_info: z.object({
    free_shipping_threshold: RubleAmountSchema.optional(),
    shipping_cost_rub: RubleAmountSchema.optional(),
    estimated_days: z.number().int().positive().optional(),
    countries: z.array(z.string()).default(['RU']),
  }).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  view_count: z.number().int().min(0).default(0),
  favorite_count: z.number().int().min(0).default(0),
  sales_count: z.number().int().min(0).default(0),
});

// Product creation
export const CreateVendorProductSchema = VendorProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  view_count: true,
  favorite_count: true,
  sales_count: true,
});

// Product update
export const UpdateVendorProductSchema = VendorProductSchema.partial().omit({
  id: true,
  vendor_id: true,
  created_at: true,
  updated_at: true,
  view_count: true,
  favorite_count: true,
  sales_count: true,
});

// Product with relations
export const VendorProductWithRelationsSchema = VendorProductSchema.extend({
  vendor: z.object({
    id: z.string().uuid(),
    name: z.string(),
    country: z.string(),
    city: z.string(),
    verified: z.boolean(),
    rating: z.number().min(0).max(5),
    review_count: z.number().int().min(0),
  }),
  category: z.object({
    id: z.string().uuid(),
    name: z.string(),
    slug: z.string(),
  }),
  photos: z.array(FileUploadSchema).optional(),
  reviews: z.object({
    average_rating: z.number().min(0).max(5),
    total_count: z.number().int().min(0),
  }).optional(),
});

// Product search filters
export const ProductFiltersSchema = z.object({
  vendor_id: z.string().uuid().optional(),
  category_id: z.string().uuid().optional(),
  min_price: RubleAmountSchema.optional(),
  max_price: RubleAmountSchema.optional(),
  status: ProductStatusSchema.optional(),
  is_local_stock: z.boolean().optional(),
  is_dropship: z.boolean().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
  min_rating: z.number().min(0).max(5).optional(),
  in_stock: z.boolean().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
});

// Product search response
export const ProductSearchResponseSchema = z.object({
  products: z.array(VendorProductWithRelationsSchema),
  total: z.number().int().min(0),
  filters: ProductFiltersSchema,
  aggregations: z.object({
    price_ranges: z.array(z.object({
      min: z.number(),
      max: z.number(),
      count: z.number().int().min(0),
    })),
    categories: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      count: z.number().int().min(0),
    })),
    vendors: z.array(z.object({
      id: z.string().uuid(),
      name: z.string(),
      count: z.number().int().min(0),
    })),
  }).optional(),
});

// Product variant
export const ProductVariantSchema = BaseRecordSchema.extend({
  product_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  sku: z.string().optional(),
  price_rub: RubleAmountSchema,
  stock_quantity: z.number().int().min(0).default(0),
  attributes: z.record(z.string()).default({}),
  photo_urls: z.array(z.string().url()).default([]),
  is_active: z.boolean().default(true),
});

// Product variant creation
export const CreateProductVariantSchema = ProductVariantSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type VendorProduct = z.infer<typeof VendorProductSchema>;
export type CreateVendorProduct = z.infer<typeof CreateVendorProductSchema>;
export type UpdateVendorProduct = z.infer<typeof UpdateVendorProductSchema>;
export type VendorProductWithRelations = z.infer<typeof VendorProductWithRelationsSchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
export type ProductSearchResponse = z.infer<typeof ProductSearchResponseSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type CreateProductVariant = z.infer<typeof CreateProductVariantSchema>;
