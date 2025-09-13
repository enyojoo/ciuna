-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('USER', 'VENDOR', 'COURIER', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE condition_type AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');
CREATE TYPE listing_status AS ENUM ('ACTIVE', 'PAUSED', 'SOLD', 'PENDING_REVIEW');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'FULFILLING', 'DELIVERED', 'CANCELLED');
CREATE TYPE escrow_status AS ENUM ('HELD', 'RELEASED', 'REFUNDED');
CREATE TYPE payment_provider AS ENUM ('MOCKPAY', 'YOOMONEY', 'SBER', 'TINKOFF');
CREATE TYPE payment_status AS ENUM ('AUTHORIZED', 'CAPTURED', 'CANCELLED', 'REFUNDED');
CREATE TYPE delivery_status AS ENUM ('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED');
CREATE TYPE vendor_type AS ENUM ('LOCAL', 'INTERNATIONAL');
CREATE TYPE vendor_status AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE product_status AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'DISABLED');
CREATE TYPE group_buy_status AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE service_category AS ENUM ('LEGAL', 'FINANCIAL', 'PERSONAL', 'EVENT', 'HEALTHCARE');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE provider_status AS ENUM ('ACTIVE', 'SUSPENDED');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    country_of_origin TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    phone TEXT,
    verified_expat BOOLEAN DEFAULT FALSE,
    verification_status verification_status DEFAULT 'PENDING',
    documents JSONB,
    avatar_url TEXT,
    bio TEXT,
    languages TEXT[] DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addresses table
CREATE TABLE addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('PICKUP', 'DROPOFF')) NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'RU',
    coordinates JSONB,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- P2P Listings table
CREATE TABLE listings (
    id BIGSERIAL PRIMARY KEY,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    price_rub INTEGER NOT NULL CHECK (price_rub >= 0),
    condition condition_type NOT NULL,
    city TEXT NOT NULL,
    district TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    status listing_status DEFAULT 'ACTIVE',
    is_negotiable BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    favorite_count INTEGER DEFAULT 0 CHECK (favorite_count >= 0),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE,
    vendor_product_id BIGINT,
    service_id BIGINT,
    last_message_at TIMESTAMPTZ,
    last_message_id UUID,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants table
CREATE TABLE conversation_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    unread_count INTEGER DEFAULT 0 CHECK (unread_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'TEXT' CHECK (message_type IN ('TEXT', 'IMAGE', 'FILE', 'SYSTEM')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER CHECK (file_size > 0),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    translation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors table
CREATE TABLE vendors (
    id BIGSERIAL PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    logo_url TEXT,
    country TEXT NOT NULL CHECK (char_length(country) = 2),
    city TEXT NOT NULL,
    district TEXT,
    verified BOOLEAN DEFAULT FALSE,
    type vendor_type NOT NULL,
    status vendor_status DEFAULT 'ACTIVE',
    business_license TEXT,
    tax_id TEXT,
    bank_details JSONB,
    contact_email TEXT,
    contact_phone TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    total_sales INTEGER DEFAULT 0 CHECK (total_sales >= 0),
    commission_rate DECIMAL(3,2) DEFAULT 0.10 CHECK (commission_rate >= 0 AND commission_rate <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor products table
CREATE TABLE vendor_products (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    price_rub INTEGER NOT NULL CHECK (price_rub >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    photo_urls TEXT[] DEFAULT '{}',
    is_local_stock BOOLEAN DEFAULT TRUE,
    is_dropship BOOLEAN DEFAULT FALSE,
    status product_status DEFAULT 'ACTIVE',
    sku TEXT,
    weight_kg DECIMAL(8,3),
    dimensions JSONB,
    tags TEXT[] DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    shipping_info JSONB,
    seo_title TEXT,
    seo_description TEXT,
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    favorite_count INTEGER DEFAULT 0 CHECK (favorite_count >= 0),
    sales_count INTEGER DEFAULT 0 CHECK (sales_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group buy deals table
CREATE TABLE group_buy_deals (
    id BIGSERIAL PRIMARY KEY,
    vendor_product_id BIGINT REFERENCES vendor_products(id) ON DELETE CASCADE NOT NULL,
    min_quantity INTEGER NOT NULL CHECK (min_quantity >= 2),
    discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    expires_at TIMESTAMPTZ NOT NULL,
    status group_buy_status DEFAULT 'ACTIVE',
    current_quantity INTEGER DEFAULT 0 CHECK (current_quantity >= 0),
    max_quantity INTEGER CHECK (max_quantity > 0),
    description TEXT,
    terms TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group buy orders table
CREATE TABLE group_buy_orders (
    id BIGSERIAL PRIMARY KEY,
    deal_id BIGINT REFERENCES group_buy_deals(id) ON DELETE CASCADE NOT NULL,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_unit_rub INTEGER NOT NULL CHECK (price_per_unit_rub >= 0),
    total_amount_rub INTEGER NOT NULL CHECK (total_amount_rub >= 0),
    discount_amount_rub INTEGER NOT NULL CHECK (discount_amount_rub >= 0),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED')),
    payment_id UUID,
    order_id UUID,
    notes TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service providers table
CREATE TABLE service_providers (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT NOT NULL,
    skills TEXT[] DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    verified BOOLEAN DEFAULT FALSE,
    status provider_status DEFAULT 'ACTIVE',
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    total_bookings INTEGER DEFAULT 0 CHECK (total_bookings >= 0),
    response_time_hours DECIMAL(4,1),
    completion_rate DECIMAL(3,2) DEFAULT 1 CHECK (completion_rate >= 0 AND completion_rate <= 1),
    languages TEXT[] DEFAULT '{}',
    service_areas TEXT[] DEFAULT '{}',
    portfolio_urls TEXT[] DEFAULT '{}',
    social_links JSONB DEFAULT '{}',
    hourly_rate_rub INTEGER CHECK (hourly_rate_rub >= 0),
    min_project_value_rub INTEGER CHECK (min_project_value_rub >= 0),
    max_project_value_rub INTEGER CHECK (max_project_value_rub >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT REFERENCES service_providers(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category service_category NOT NULL,
    price_rub INTEGER NOT NULL CHECK (price_rub >= 0),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    available_slots JSONB DEFAULT '{}',
    is_online BOOLEAN DEFAULT FALSE,
    is_in_person BOOLEAN DEFAULT TRUE,
    location TEXT,
    max_participants INTEGER DEFAULT 1 CHECK (max_participants > 0),
    requirements TEXT[] DEFAULT '{}',
    deliverables TEXT[] DEFAULT '{}',
    cancellation_policy TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    booking_count INTEGER DEFAULT 0 CHECK (booking_count >= 0),
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0 CHECK (review_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service bookings table
CREATE TABLE service_bookings (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    status booking_status DEFAULT 'PENDING',
    escrow_status escrow_status DEFAULT 'HELD',
    total_amount_rub INTEGER NOT NULL CHECK (total_amount_rub >= 0),
    escrow_amount_rub INTEGER NOT NULL CHECK (escrow_amount_rub >= 0),
    payment_id UUID,
    notes TEXT,
    requirements TEXT[] DEFAULT '{}',
    deliverables TEXT[] DEFAULT '{}',
    meeting_link TEXT,
    meeting_location TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    is_in_person BOOLEAN DEFAULT TRUE,
    confirmed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT,
    rescheduled_at TIMESTAMPTZ,
    reschedule_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id BIGINT REFERENCES listings(id) ON DELETE SET NULL,
    vendor_product_id BIGINT REFERENCES vendor_products(id) ON DELETE SET NULL,
    service_booking_id BIGINT REFERENCES service_bookings(id) ON DELETE SET NULL,
    escrow_status escrow_status DEFAULT 'HELD',
    payment_id UUID NOT NULL,
    delivery_id UUID,
    status order_status DEFAULT 'PENDING',
    total_amount_rub INTEGER NOT NULL CHECK (total_amount_rub >= 0),
    escrow_amount_rub INTEGER NOT NULL CHECK (escrow_amount_rub >= 0),
    delivery_amount_rub INTEGER DEFAULT 0 CHECK (delivery_amount_rub >= 0),
    notes TEXT,
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider payment_provider NOT NULL,
    provider_ref TEXT NOT NULL,
    amount_rub INTEGER NOT NULL CHECK (amount_rub >= 0),
    status payment_status DEFAULT 'AUTHORIZED',
    currency TEXT DEFAULT 'RUB',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    failure_reason TEXT,
    processed_at TIMESTAMPTZ,
    refunded_amount_rub INTEGER DEFAULT 0 CHECK (refunded_amount_rub >= 0),
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT CHECK (char_length(comment) <= 1000),
    is_anonymous BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries table
CREATE TABLE deliveries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    pickup_address_id UUID REFERENCES addresses(id) ON DELETE RESTRICT NOT NULL,
    dropoff_address_id UUID REFERENCES addresses(id) ON DELETE RESTRICT NOT NULL,
    timeslot_start TIMESTAMPTZ NOT NULL,
    timeslot_end TIMESTAMPTZ NOT NULL,
    cod BOOLEAN DEFAULT FALSE,
    status delivery_status DEFAULT 'CREATED',
    tracking_code TEXT,
    courier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    courier_notes TEXT,
    delivery_notes TEXT,
    actual_delivery_time TIMESTAMPTZ,
    signature_url TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- International shipment quotes table
CREATE TABLE intl_shipment_quotes (
    id BIGSERIAL PRIMARY KEY,
    from_country TEXT NOT NULL CHECK (char_length(from_country) = 2),
    to_country TEXT NOT NULL DEFAULT 'RU' CHECK (char_length(to_country) = 2),
    volumetric_weight_kg DECIMAL(8,3) NOT NULL CHECK (volumetric_weight_kg > 0),
    base_cost_rub INTEGER NOT NULL CHECK (base_cost_rub >= 0),
    duty_estimate_rub INTEGER NOT NULL CHECK (duty_estimate_rub >= 0),
    total_cost_rub INTEGER NOT NULL CHECK (total_cost_rub >= 0),
    estimated_days INTEGER NOT NULL CHECK (estimated_days > 0),
    carrier TEXT NOT NULL,
    service_level TEXT NOT NULL,
    tracking_available BOOLEAN DEFAULT TRUE,
    insurance_included BOOLEAN DEFAULT FALSE,
    customs_handling BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_city ON profiles(city);
CREATE INDEX idx_profiles_verified_expat ON profiles(verified_expat);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_type ON addresses(type);

CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_price_rub ON listings(price_rub);
CREATE INDEX idx_listings_created_at ON listings(created_at);

CREATE INDEX idx_conversations_listing_id ON conversations(listing_id);
CREATE INDEX idx_conversations_vendor_product_id ON conversations(vendor_product_id);
CREATE INDEX idx_conversations_service_id ON conversations(service_id);

CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_vendors_owner_id ON vendors(owner_id);
CREATE INDEX idx_vendors_type ON vendors(type);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_country ON vendors(country);
CREATE INDEX idx_vendors_city ON vendors(city);

CREATE INDEX idx_vendor_products_vendor_id ON vendor_products(vendor_id);
CREATE INDEX idx_vendor_products_category_id ON vendor_products(category_id);
CREATE INDEX idx_vendor_products_status ON vendor_products(status);
CREATE INDEX idx_vendor_products_price_rub ON vendor_products(price_rub);

CREATE INDEX idx_group_buy_deals_vendor_product_id ON group_buy_deals(vendor_product_id);
CREATE INDEX idx_group_buy_deals_status ON group_buy_deals(status);
CREATE INDEX idx_group_buy_deals_expires_at ON group_buy_deals(expires_at);

CREATE INDEX idx_group_buy_orders_deal_id ON group_buy_orders(deal_id);
CREATE INDEX idx_group_buy_orders_buyer_id ON group_buy_orders(buyer_id);

CREATE INDEX idx_service_providers_profile_id ON service_providers(profile_id);
CREATE INDEX idx_service_providers_status ON service_providers(status);
CREATE INDEX idx_service_providers_verified ON service_providers(verified);

CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_price_rub ON services(price_rub);

CREATE INDEX idx_service_bookings_service_id ON service_bookings(service_id);
CREATE INDEX idx_service_bookings_client_id ON service_bookings(client_id);
CREATE INDEX idx_service_bookings_status ON service_bookings(status);
CREATE INDEX idx_service_bookings_scheduled_at ON service_bookings(scheduled_at);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_payments_provider ON payments(provider);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_courier_id ON deliveries(courier_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversation_participants_updated_at BEFORE UPDATE ON conversation_participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_products_updated_at BEFORE UPDATE ON vendor_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_buy_deals_updated_at BEFORE UPDATE ON group_buy_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_buy_orders_updated_at BEFORE UPDATE ON group_buy_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON service_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_intl_shipment_quotes_updated_at BEFORE UPDATE ON intl_shipment_quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
