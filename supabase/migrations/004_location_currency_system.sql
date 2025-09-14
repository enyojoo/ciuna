-- Migration: Add location and currency system support
-- This migration adds support for global marketplace features

-- Add new columns to profiles table for location and currency
ALTER TABLE profiles 
ADD COLUMN location TEXT CHECK (location IN ('russia', 'uk', 'us', 'germany', 'france', 'canada', 'australia', 'other')) DEFAULT 'other',
ADD COLUMN base_currency TEXT CHECK (base_currency IN ('USD', 'EUR', 'GBP', 'RUB', 'CAD', 'AUD', 'CHF', 'JPY')) DEFAULT 'USD',
ADD COLUMN currency_preferences JSONB DEFAULT '{}',
ADD COLUMN feature_access JSONB DEFAULT '{}';

-- Add currency support to listings table
ALTER TABLE listings 
ADD COLUMN currency TEXT CHECK (currency IN ('USD', 'EUR', 'GBP', 'RUB', 'CAD', 'AUD', 'CHF', 'JPY')) DEFAULT 'USD',
ADD COLUMN original_price NUMERIC,
ADD COLUMN original_currency TEXT;

-- Add currency support to vendor_products table
ALTER TABLE vendor_products 
ADD COLUMN currency TEXT CHECK (currency IN ('USD', 'EUR', 'GBP', 'RUB', 'CAD', 'AUD', 'CHF', 'JPY')) DEFAULT 'RUB',
ADD COLUMN price_usd NUMERIC,
ADD COLUMN price_eur NUMERIC,
ADD COLUMN price_gbp NUMERIC,
ADD COLUMN price_cad NUMERIC,
ADD COLUMN price_aud NUMERIC;

-- Add currency support to services table
ALTER TABLE services 
ADD COLUMN currency TEXT CHECK (currency IN ('USD', 'EUR', 'GBP', 'RUB', 'CAD', 'AUD', 'CHF', 'JPY')) DEFAULT 'USD';

-- Add currency support to payments table
ALTER TABLE payments 
ADD COLUMN currency TEXT CHECK (currency IN ('USD', 'EUR', 'GBP', 'RUB', 'CAD', 'AUD', 'CHF', 'JPY')) DEFAULT 'USD',
ADD COLUMN exchange_rate NUMERIC DEFAULT 1.0;

-- Create currency exchange rates table
CREATE TABLE currency_exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    from_currency TEXT NOT NULL,
    to_currency TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_currency, to_currency)
);

-- Create shipping providers table
CREATE TABLE shipping_providers (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    countries TEXT[] NOT NULL,
    supported_currencies TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create payment methods table
CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    countries TEXT[] NOT NULL,
    supported_currencies TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Create feature access rules table
CREATE TABLE feature_access_rules (
    id BIGSERIAL PRIMARY KEY,
    location TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(location, feature_name)
);

-- Insert default currency exchange rates (these will be updated by API)
INSERT INTO currency_exchange_rates (from_currency, to_currency, rate) VALUES
('USD', 'USD', 1.0),
('USD', 'EUR', 0.85),
('USD', 'GBP', 0.73),
('USD', 'RUB', 75.0),
('USD', 'CAD', 1.25),
('USD', 'AUD', 1.35),
('USD', 'CHF', 0.92),
('USD', 'JPY', 110.0),
('EUR', 'USD', 1.18),
('EUR', 'EUR', 1.0),
('EUR', 'GBP', 0.86),
('EUR', 'RUB', 88.0),
('GBP', 'USD', 1.37),
('GBP', 'EUR', 1.16),
('GBP', 'GBP', 1.0),
('GBP', 'RUB', 103.0),
('RUB', 'USD', 0.013),
('RUB', 'EUR', 0.011),
('RUB', 'GBP', 0.0097),
('RUB', 'RUB', 1.0);

-- Insert shipping providers
INSERT INTO shipping_providers (name, code, countries, supported_currencies) VALUES
('Russian Post', 'russian_post', ARRAY['RU'], ARRAY['RUB', 'USD', 'EUR']),
('CDEK', 'cdek', ARRAY['RU'], ARRAY['RUB', 'USD', 'EUR']),
('Royal Mail', 'royal_mail', ARRAY['GB'], ARRAY['GBP', 'USD', 'EUR']),
('DPD', 'dpd', ARRAY['GB', 'DE', 'FR'], ARRAY['GBP', 'EUR', 'USD']),
('UPS', 'ups', ARRAY['US', 'GB', 'DE', 'FR', 'CA', 'AU'], ARRAY['USD', 'GBP', 'EUR', 'CAD', 'AUD']),
('FedEx', 'fedex', ARRAY['US', 'GB', 'DE', 'FR', 'CA', 'AU'], ARRAY['USD', 'GBP', 'EUR', 'CAD', 'AUD']),
('DHL', 'dhl', ARRAY['US', 'GB', 'DE', 'FR', 'CA', 'AU'], ARRAY['USD', 'GBP', 'EUR', 'CAD', 'AUD']),
('USPS', 'usps', ARRAY['US'], ARRAY['USD']),
('Hermes', 'hermes', ARRAY['GB'], ARRAY['GBP', 'USD', 'EUR']);

-- Insert payment methods
INSERT INTO payment_methods (name, code, countries, supported_currencies) VALUES
('YooMoney', 'yoomoney', ARRAY['RU'], ARRAY['RUB', 'USD', 'EUR']),
('Stripe', 'stripe', ARRAY['US', 'GB', 'DE', 'FR', 'CA', 'AU', 'RU'], ARRAY['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'RUB']),
('PayPal', 'paypal', ARRAY['US', 'GB', 'DE', 'FR', 'CA', 'AU'], ARRAY['USD', 'GBP', 'EUR', 'CAD', 'AUD']),
('Apple Pay', 'apple_pay', ARRAY['US', 'GB', 'DE', 'FR', 'CA', 'AU'], ARRAY['USD', 'GBP', 'EUR', 'CAD', 'AUD']),
('Venmo', 'venmo', ARRAY['US'], ARRAY['USD']),
('Cash on Delivery', 'cash', ARRAY['RU', 'US', 'GB', 'DE', 'FR', 'CA', 'AU'], ARRAY['RUB', 'USD', 'GBP', 'EUR', 'CAD', 'AUD']);

-- Insert feature access rules
INSERT INTO feature_access_rules (location, feature_name, is_enabled, configuration) VALUES
('russia', 'can_list', true, '{"max_listings": 50, "requires_verification": false}'),
('russia', 'can_sell', true, '{"max_products": 100, "requires_verification": false}'),
('russia', 'can_buy', true, '{}'),
('russia', 'local_services', true, '{"categories": ["LEGAL", "FINANCIAL", "PERSONAL", "EVENT", "HEALTHCARE"]}'),
('russia', 'group_buy', true, '{"max_participants": 100}'),
('uk', 'can_list', true, '{"max_listings": 50, "requires_verification": true}'),
('uk', 'can_sell', true, '{"max_products": 100, "requires_verification": true}'),
('uk', 'can_buy', true, '{}'),
('uk', 'local_services', true, '{"categories": ["LEGAL", "FINANCIAL", "PERSONAL", "EVENT", "HEALTHCARE"]}'),
('uk', 'group_buy', true, '{"max_participants": 100}'),
('us', 'can_list', true, '{"max_listings": 50, "requires_verification": true}'),
('us', 'can_sell', true, '{"max_products": 100, "requires_verification": true}'),
('us', 'can_buy', true, '{}'),
('us', 'local_services', true, '{"categories": ["LEGAL", "FINANCIAL", "PERSONAL", "EVENT", "HEALTHCARE"]}'),
('us', 'group_buy', true, '{"max_participants": 100}'),
('other', 'can_list', false, '{}'),
('other', 'can_sell', false, '{}'),
('other', 'can_buy', true, '{}'),
('other', 'local_services', false, '{}'),
('other', 'group_buy', false, '{}');

-- Create indexes for better performance
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_base_currency ON profiles(base_currency);
CREATE INDEX idx_listings_currency ON listings(currency);
CREATE INDEX idx_vendor_products_currency ON vendor_products(currency);
CREATE INDEX idx_currency_rates_from_to ON currency_exchange_rates(from_currency, to_currency);
CREATE INDEX idx_shipping_providers_countries ON shipping_providers USING GIN(countries);
CREATE INDEX idx_payment_methods_countries ON payment_methods USING GIN(countries);
CREATE INDEX idx_feature_access_rules_location ON feature_access_rules(location);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_currency_exchange_rates_updated_at BEFORE UPDATE ON currency_exchange_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shipping_providers_updated_at BEFORE UPDATE ON shipping_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_access_rules_updated_at BEFORE UPDATE ON feature_access_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
