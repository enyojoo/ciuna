-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    role TEXT CHECK (role IN ('USER','VENDOR','COURIER','ADMIN')) DEFAULT 'USER',
    country_of_origin TEXT,
    city TEXT,
    district TEXT,
    phone TEXT,
    verified_expat BOOLEAN DEFAULT false,
    verification_status TEXT CHECK (verification_status IN ('PENDING','APPROVED','REJECTED')) DEFAULT 'PENDING',
    documents JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Categories table
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_id BIGINT REFERENCES categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Listings table
CREATE TABLE listings (
    id BIGSERIAL PRIMARY KEY,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(id),
    price INT NOT NULL,
    condition TEXT CHECK (condition IN ('NEW','LIKE_NEW','GOOD','FAIR')) NOT NULL,
    city TEXT,
    district TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    status TEXT CHECK (status IN ('ACTIVE','PAUSED','SOLD','PENDING_REVIEW')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create indexes for listings
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_city_district ON listings(city, district);

-- Vendors table
CREATE TABLE vendors (
    id BIGSERIAL PRIMARY KEY,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    country TEXT,
    city TEXT,
    verified BOOLEAN DEFAULT false,
    type TEXT CHECK (type IN ('LOCAL','INTERNATIONAL')) NOT NULL,
    status TEXT CHECK (status IN ('ACTIVE','SUSPENDED')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Vendor products table
CREATE TABLE vendor_products (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT REFERENCES vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category_id BIGINT REFERENCES categories(id),
    price_rub INT NOT NULL,
    stock_quantity INT DEFAULT 0,
    photo_urls TEXT[] DEFAULT '{}',
    is_local_stock BOOLEAN DEFAULT true,
    is_dropship BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('ACTIVE','OUT_OF_STOCK','DISABLED')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create indexes for vendor_products
CREATE INDEX idx_vendor_products_vendor_status ON vendor_products(vendor_id, status);
CREATE INDEX idx_vendor_products_category_id ON vendor_products(category_id);

-- Group buy deals table
CREATE TABLE group_buy_deals (
    id BIGSERIAL PRIMARY KEY,
    vendor_product_id BIGINT REFERENCES vendor_products(id) ON DELETE CASCADE,
    min_quantity INT NOT NULL,
    discount_percentage INT CHECK (discount_percentage BETWEEN 1 AND 90),
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('ACTIVE','COMPLETED','CANCELLED')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Group buy orders table
CREATE TABLE group_buy_orders (
    id BIGSERIAL PRIMARY KEY,
    deal_id BIGINT REFERENCES group_buy_deals(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    quantity INT CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for group_buy_orders
CREATE INDEX idx_group_buy_orders_deal_id ON group_buy_orders(deal_id);
CREATE INDEX idx_group_buy_orders_buyer_id ON group_buy_orders(buyer_id);

-- Service providers table
CREATE TABLE service_providers (
    id BIGSERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    credentials JSONB,
    verified BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('ACTIVE','SUSPENDED')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Services table
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    provider_id BIGINT REFERENCES service_providers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('LEGAL','FINANCIAL','PERSONAL','EVENT','HEALTHCARE')) NOT NULL,
    price INT NOT NULL,
    duration_minutes INT NOT NULL,
    available_slots JSONB DEFAULT '[]',
    status TEXT CHECK (status IN ('ACTIVE','PAUSED')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Service bookings table
CREATE TABLE service_bookings (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('PENDING','CONFIRMED','COMPLETED','CANCELLED')) DEFAULT 'PENDING',
    escrow_status TEXT CHECK (escrow_status IN ('HELD','RELEASED','REFUNDED')) DEFAULT 'HELD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create indexes for service_bookings
CREATE INDEX idx_service_bookings_client_status ON service_bookings(client_id, status);
CREATE INDEX idx_service_bookings_service_scheduled ON service_bookings(service_id, scheduled_at);

-- Conversations table
CREATE TABLE conversations (
    id BIGSERIAL PRIMARY KEY,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants table
CREATE TABLE conversation_participants (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE (conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    translated_body TEXT,
    source_lang TEXT,
    target_lang TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for messages
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Addresses table
CREATE TABLE addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    line1 TEXT,
    line2 TEXT,
    city TEXT,
    district TEXT,
    postal_code TEXT,
    country_code TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Orders table
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id BIGINT REFERENCES listings(id),
    vendor_product_id BIGINT REFERENCES vendor_products(id),
    service_booking_id BIGINT REFERENCES service_bookings(id),
    escrow_status TEXT CHECK (escrow_status IN ('HELD','RELEASED','REFUNDED')) DEFAULT 'HELD',
    payment_id BIGINT,
    delivery_id BIGINT,
    status TEXT CHECK (status IN ('PENDING','PAID','FULFILLING','DELIVERED','CANCELLED')) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Payments table
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    provider TEXT CHECK (provider IN ('STRIPE','YOOMONEY','FLUTTERWAVE','CASH')) DEFAULT 'YOOMONEY',
    provider_ref TEXT,
    amount INT NOT NULL,
    status TEXT CHECK (status IN ('AUTHORIZED','CAPTURED','CANCELLED','REFUNDED')) DEFAULT 'AUTHORIZED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Reviews table
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliveries table
CREATE TABLE deliveries (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    pickup_address_id BIGINT REFERENCES addresses(id),
    dropoff_address_id BIGINT REFERENCES addresses(id),
    timeslot_start TIMESTAMPTZ,
    timeslot_end TIMESTAMPTZ,
    cod BOOLEAN DEFAULT false,
    status TEXT CHECK (status IN ('CREATED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','RETURNED')) DEFAULT 'CREATED',
    tracking_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- International shipment quotes table
CREATE TABLE intl_shipment_quotes (
    id BIGSERIAL PRIMARY KEY,
    from_country TEXT,
    to_country TEXT DEFAULT 'RU',
    volumetric_weight_kg NUMERIC,
    base_cost INT,
    duty_estimate INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payout ledger table
CREATE TABLE payout_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    type TEXT CHECK (type IN ('CREDIT','DEBIT')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_products_updated_at BEFORE UPDATE ON vendor_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_buy_deals_updated_at BEFORE UPDATE ON group_buy_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_bookings_updated_at BEFORE UPDATE ON service_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
