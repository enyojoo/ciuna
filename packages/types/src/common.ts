import { z } from 'zod';

// Common enums
export const UserRoleSchema = z.enum(['USER', 'VENDOR', 'COURIER', 'ADMIN']);
export const VerificationStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export const ConditionSchema = z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']);
export const ListingStatusSchema = z.enum(['ACTIVE', 'PAUSED', 'SOLD', 'PENDING_REVIEW']);
export const OrderStatusSchema = z.enum(['PENDING', 'PAID', 'FULFILLING', 'DELIVERED', 'CANCELLED']);
export const EscrowStatusSchema = z.enum(['HELD', 'RELEASED', 'REFUNDED']);
export const PaymentProviderSchema = z.enum(['MOCKPAY', 'YOOMONEY', 'SBER', 'TINKOFF']);
export const PaymentStatusSchema = z.enum(['AUTHORIZED', 'CAPTURED', 'CANCELLED', 'REFUNDED']);
export const DeliveryStatusSchema = z.enum(['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED']);
export const VendorTypeSchema = z.enum(['LOCAL', 'INTERNATIONAL']);
export const VendorStatusSchema = z.enum(['ACTIVE', 'SUSPENDED']);
export const ProductStatusSchema = z.enum(['ACTIVE', 'OUT_OF_STOCK', 'DISABLED']);
export const GroupBuyStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']);
export const ServiceCategorySchema = z.enum(['LEGAL', 'FINANCIAL', 'PERSONAL', 'EVENT', 'HEALTHCARE']);
export const BookingStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
export const ProviderStatusSchema = z.enum(['ACTIVE', 'SUSPENDED']);

// Common types
export const UUIDSchema = z.string().uuid();
export const TimestampSchema = z.string().datetime();
export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
export const EmailSchema = z.string().email();
export const RubleAmountSchema = z.number().int().min(0);
export const RatingSchema = z.number().int().min(1).max(5);

// Base database record
export const BaseRecordSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      total_pages: z.number(),
    }),
  });

// Address
export const AddressSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['PICKUP', 'DROPOFF']),
  street: z.string(),
  city: z.string(),
  district: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().default('RU'),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  is_default: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// File upload
export const FileUploadSchema = z.object({
  url: z.string().url(),
  filename: z.string(),
  size: z.number().int().positive(),
  mime_type: z.string(),
});

// Translation
export const TranslationSchema = z.object({
  original_text: z.string(),
  translated_text: z.string(),
  source_language: z.string(),
  target_language: z.string(),
  confidence: z.number().min(0).max(1).optional(),
});

// Export types
export type UserRole = z.infer<typeof UserRoleSchema>;
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type ListingStatus = z.infer<typeof ListingStatusSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type EscrowStatus = z.infer<typeof EscrowStatusSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type DeliveryStatus = z.infer<typeof DeliveryStatusSchema>;
export type VendorType = z.infer<typeof VendorTypeSchema>;
export type VendorStatus = z.infer<typeof VendorStatusSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type GroupBuyStatus = z.infer<typeof GroupBuyStatusSchema>;
export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;
export type BookingStatus = z.infer<typeof BookingStatusSchema>;
export type ProviderStatus = z.infer<typeof ProviderStatusSchema>;
export type UUID = z.infer<typeof UUIDSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
export type Phone = z.infer<typeof PhoneSchema>;
export type Email = z.infer<typeof EmailSchema>;
export type RubleAmount = z.infer<typeof RubleAmountSchema>;
export type Rating = z.infer<typeof RatingSchema>;
export type BaseRecord = z.infer<typeof BaseRecordSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type FileUpload = z.infer<typeof FileUploadSchema>;
export type Translation = z.infer<typeof TranslationSchema>;
