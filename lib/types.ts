export interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  role: 'USER' | 'VENDOR' | 'COURIER' | 'ADMIN'
  country_of_origin: string | null
  city: string | null
  district: string | null
  phone: string | null
  verified_expat: boolean
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED'
  documents: Record<string, unknown> | null
  avatar_url: string | null
  location: 'russia' | 'uk' | 'us' | 'germany' | 'france' | 'canada' | 'australia' | 'other'
  base_currency: 'USD' | 'EUR' | 'GBP' | 'RUB' | 'CAD' | 'AUD' | 'CHF' | 'JPY'
  currency_preferences: Record<string, unknown>
  feature_access: Record<string, unknown>
  created_at: string
  updated_at: string | null
}

export interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
  created_at: string
  updated_at: string | null
}

export interface Listing {
  id: number
  seller_id: string
  title: string
  description: string | null
  category_id: number | null
  price: number
  currency: 'USD' | 'EUR' | 'GBP' | 'RUB' | 'CAD' | 'AUD' | 'CHF' | 'JPY'
  original_price?: number
  original_currency?: string
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR'
  city: string | null
  district: string | null
  photo_urls: string[]
  status: 'ACTIVE' | 'PAUSED' | 'SOLD' | 'PENDING_REVIEW'
  created_at: string
  updated_at: string | null
  seller?: Profile
  category?: Category
}

export interface Vendor {
  id: number
  owner_id: string
  name: string
  description: string | null
  logo_url: string | null
  country: string | null
  city: string | null
  verified: boolean
  type: 'LOCAL' | 'INTERNATIONAL'
  status: 'ACTIVE' | 'SUSPENDED'
  created_at: string
  updated_at: string | null
  owner?: Profile
}

export interface VendorProduct {
  id: number
  vendor_id: number
  name: string
  description: string | null
  category_id: number | null
  price_rub: number
  currency: 'USD' | 'EUR' | 'GBP' | 'RUB' | 'CAD' | 'AUD' | 'CHF' | 'JPY'
  price_usd?: number
  price_eur?: number
  price_gbp?: number
  price_cad?: number
  price_aud?: number
  stock_quantity: number
  photo_urls: string[]
  is_local_stock: boolean
  is_dropship: boolean
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'DISABLED'
  created_at: string
  updated_at: string | null
  vendor?: Vendor
  category?: Category
}

export interface GroupBuyDeal {
  id: number
  vendor_product_id: number
  min_quantity: number
  discount_percentage: number
  expires_at: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  created_at: string
  updated_at: string | null
  vendor_product?: VendorProduct
}

export interface GroupBuyOrder {
  id: number
  deal_id: number
  buyer_id: string
  quantity: number
  created_at: string
  deal?: GroupBuyDeal
  buyer?: Profile
}

export interface ServiceProvider {
  id: number
  profile_id: string
  name: string | null
  bio: string | null
  skills: string[]
  credentials: Record<string, unknown> | null
  verified: boolean
  status: 'ACTIVE' | 'SUSPENDED'
  created_at: string
  updated_at: string | null
  profile?: Profile
}

export interface Service {
  id: number
  provider_id: number
  title: string
  description: string | null
  category: 'LEGAL' | 'FINANCIAL' | 'PERSONAL' | 'EVENT' | 'HEALTHCARE'
  price: number
  currency: 'USD' | 'EUR' | 'GBP' | 'RUB' | 'CAD' | 'AUD' | 'CHF' | 'JPY'
  duration_minutes: number
  available_slots: Record<string, unknown>[]
  status: 'ACTIVE' | 'PAUSED'
  created_at: string
  updated_at: string | null
  provider?: ServiceProvider
}

export interface ServiceBooking {
  id: number
  service_id: number
  client_id: string
  scheduled_at: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  escrow_status: 'HELD' | 'RELEASED' | 'REFUNDED'
  created_at: string
  updated_at: string | null
  service?: Service
  client?: Profile
}

export interface Conversation {
  id: number
  created_by: string
  created_at: string
  participants?: Profile[]
  messages?: Message[]
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: string
  body: string
  translated_body: string | null
  source_lang: string | null
  target_lang: string | null
  created_at: string
  sender?: Profile
}

export interface Address {
  id: number
  user_id: string
  line1: string | null
  line2: string | null
  city: string | null
  district: string | null
  postal_code: string | null
  country_code: string | null
  note: string | null
  created_at: string
  updated_at: string | null
}

export interface Order {
  id: number
  buyer_id: string
  seller_id: string
  listing_id: number | null
  vendor_product_id: number | null
  service_booking_id: number | null
  escrow_status: 'HELD' | 'RELEASED' | 'REFUNDED'
  payment_id: number | null
  delivery_id: number | null
  status: 'PENDING' | 'PAID' | 'FULFILLING' | 'DELIVERED' | 'CANCELLED'
  created_at: string
  updated_at: string | null
  buyer?: Profile
  seller?: Profile
  listing?: Listing
  vendor_product?: VendorProduct
  service_booking?: ServiceBooking
  payment?: Payment
  delivery?: Delivery
}

export interface Payment {
  id: number
  provider: 'STRIPE' | 'YOOMONEY' | 'FLUTTERWAVE' | 'CASH'
  provider_ref: string | null
  amount: number
  currency: 'USD' | 'EUR' | 'GBP' | 'RUB' | 'CAD' | 'AUD' | 'CHF' | 'JPY'
  exchange_rate: number
  status: 'AUTHORIZED' | 'CAPTURED' | 'CANCELLED' | 'REFUNDED'
  created_at: string
  updated_at: string | null
}

export interface Review {
  id: number
  order_id: number
  reviewer_id: string
  reviewee_id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer?: Profile
  reviewee?: Profile
}

export interface Delivery {
  id: number
  order_id: number
  pickup_address_id: number | null
  dropoff_address_id: number | null
  timeslot_start: string | null
  timeslot_end: string | null
  cod: boolean
  status: 'CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'RETURNED'
  tracking_code: string | null
  created_at: string
  updated_at: string | null
  pickup_address?: Address
  dropoff_address?: Address
}

export interface IntlShipmentQuote {
  id: number
  from_country: string | null
  to_country: string
  volumetric_weight_kg: number | null
  base_cost: number | null
  duty_estimate: number | null
  created_at: string
}

export interface PayoutLedger {
  id: number
  user_id: string
  order_id: number
  amount: number
  type: 'CREDIT' | 'DEBIT'
  created_at: string
}

// New types for location and currency system
export interface CurrencyExchangeRate {
  id: number
  from_currency: string
  to_currency: string
  rate: number
  last_updated: string
  created_at: string
}

export interface ShippingProvider {
  id: number
  name: string
  code: string
  countries: string[]
  supported_currencies: string[]
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface PaymentMethod {
  id: number
  name: string
  code: string
  countries: string[]
  supported_currencies: string[]
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface FeatureAccessRule {
  id: number
  location: string
  feature_name: string
  is_enabled: boolean
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string | null
}

export interface UserFeatureAccess {
  canList: boolean
  canSell: boolean
  canBuy: boolean
  localServices: boolean
  groupBuy: boolean
  paymentMethods: string[]
  shippingProviders: string[]
  maxListings?: number
  maxProducts?: number
  requiresVerification?: boolean
}

export interface CurrencyConversion {
  amount: number
  fromCurrency: string
  toCurrency: string
  convertedAmount: number
  rate: number
  lastUpdated: string
}
