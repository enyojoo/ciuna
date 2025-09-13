import { z } from "zod"

// User and Profile types
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  language: z.string().default("en"),
  currency: z.string().default("USD"),
  is_verified: z.boolean().default(false),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Profile = z.infer<typeof ProfileSchema>

// Listing types
export const ListingSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  price: z.number().positive(),
  currency: z.string().default("USD"),
  category_id: z.string().uuid(),
  condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
  images: z.array(z.string().url()),
  location: z.string(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Listing = z.infer<typeof ListingSchema>

export const ListingFiltersSchema = z.object({
  category: z.string().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  condition: z.enum(["new", "like_new", "good", "fair", "poor"]).optional(),
  location: z.string().optional(),
  search: z.string().optional(),
})

export type ListingFilters = z.infer<typeof ListingFiltersSchema>

// Service types
export const ServiceSchema = z.object({
  id: z.string().uuid(),
  provider_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  price: z.number().positive(),
  currency: z.string().default("USD"),
  category_id: z.string().uuid(),
  duration: z.number().positive().optional(), // in minutes
  location: z.string(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Service = z.infer<typeof ServiceSchema>

export const ServiceFiltersSchema = z.object({
  category: z.string().optional(),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  location: z.string().optional(),
  search: z.string().optional(),
})

export type ServiceFilters = z.infer<typeof ServiceFiltersSchema>

// Vendor types
export const VendorSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  business_name: z.string(),
  description: z.string(),
  category: z.string(),
  location: z.string(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  rating: z.number().min(0).max(5).default(0),
  review_count: z.number().default(0),
  is_verified: z.boolean().default(false),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Vendor = z.infer<typeof VendorSchema>

// Order types
export const OrderSchema = z.object({
  id: z.string().uuid(),
  buyer_id: z.string().uuid(),
  seller_id: z.string().uuid(),
  listing_id: z.string().uuid().optional(),
  service_id: z.string().uuid().optional(),
  total_amount: z.number().positive(),
  currency: z.string().default("USD"),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  payment_status: z.enum(["pending", "paid", "failed", "refunded"]),
  shipping_address: z.string().optional(),
  notes: z.string().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Order = z.infer<typeof OrderSchema>

// Category types
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  icon: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Category = z.infer<typeof CategorySchema>

// Condition enum
export type Condition = "new" | "like_new" | "good" | "fair" | "poor"

// Notification types
export const NotificationTypeSchema = z.enum([
  "order_created",
  "order_confirmed",
  "order_shipped",
  "order_delivered",
  "order_cancelled",
  "message_received",
  "listing_approved",
  "listing_rejected",
  "payment_received",
  "payment_failed",
])

export type NotificationType = z.infer<typeof NotificationTypeSchema>

export const NotificationChannelSchema = z.enum(["email", "push", "sms"])

export type NotificationChannel = z.infer<typeof NotificationChannelSchema>

export const NotificationStatusSchema = z.enum(["unread", "read", "archived"])

export type NotificationStatus = z.infer<typeof NotificationStatusSchema>

// Search types
export const SearchResultSchema = z.object({
  id: z.string(),
  type: z.enum(["listing", "service", "vendor"]),
  title: z.string(),
  description: z.string(),
  price: z.number().optional(),
  currency: z.string().optional(),
  location: z.string().optional(),
  image: z.string().url().optional(),
  rating: z.number().optional(),
  created_at: z.string().datetime(),
})

export type SearchResult = z.infer<typeof SearchResultSchema>

export const SearchSuggestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  type: z.enum(["category", "location", "keyword"]),
})

export type SearchSuggestion = z.infer<typeof SearchSuggestionSchema>

export const SearchFilterSchema = z.object({
  field: z.string(),
  value: z.string(),
  label: z.string(),
})

export type SearchFilter = z.infer<typeof SearchFilterSchema>

// Message types
export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  content: z.string(),
  message_type: z.enum(["text", "image", "file"]).default("text"),
  is_read: z.boolean().default(false),
  created_at: z.string().datetime(),
})

export type Message = z.infer<typeof MessageSchema>

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  participant_ids: z.array(z.string().uuid()),
  last_message: MessageSchema.optional(),
  unread_count: z.number().default(0),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type Conversation = z.infer<typeof ConversationSchema>

// Currency types
export const CurrencyCodeSchema = z.enum([
  "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "RUB", "BRL", "INR", "KRW", "MXN", "SGD", "HKD", "NOK", "SEK", "DKK", "PLN", "CZK", "HUF", "ILS", "CLP", "PHP", "AED", "SAR", "QAR", "KWD", "BHD", "OMR", "JOD", "LBP", "EGP", "ZAR", "NGN", "KES", "GHS", "MAD", "TND", "DZD", "ETB", "UGX", "TZS", "ZMW", "BWP", "SZL", "LSL", "NAD", "AOA", "MZN", "MGA", "KMF", "SCR", "MUR", "SLL", "GMD", "GNF", "LRD", "CDF", "RWF", "BIF", "DJF", "SOS", "ERN", "STN", "CVE", "XOF", "XAF", "XPF"
])

export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>
