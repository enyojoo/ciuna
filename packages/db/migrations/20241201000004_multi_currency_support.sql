-- Add multi-currency support for international expat marketplace

-- Create currency enum
CREATE TYPE currency_code AS ENUM (
  'USD', 'EUR', 'GBP', 'RUB', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'KRW', 
  'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'TRY',
  'BRL', 'MXN', 'INR', 'ZAR', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'UAH'
);

-- Add currency fields to all price-related tables
ALTER TABLE listings ADD COLUMN currency currency_code DEFAULT 'RUB';
ALTER TABLE listings ADD COLUMN price_original INTEGER; -- Original price in original currency
ALTER TABLE listings ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0; -- Rate used for conversion

ALTER TABLE vendor_products ADD COLUMN currency currency_code DEFAULT 'RUB';
ALTER TABLE vendor_products ADD COLUMN price_original INTEGER;
ALTER TABLE vendor_products ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;

ALTER TABLE services ADD COLUMN currency currency_code DEFAULT 'RUB';
ALTER TABLE services ADD COLUMN price_original INTEGER;
ALTER TABLE services ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;

ALTER TABLE orders ADD COLUMN currency currency_code DEFAULT 'RUB';
ALTER TABLE orders ADD COLUMN total_amount_original INTEGER;
ALTER TABLE orders ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;

-- Alter existing currency column to use currency_code type
-- First, drop the default constraint, then alter the type, then add the new default
ALTER TABLE payments ALTER COLUMN currency DROP DEFAULT;
ALTER TABLE payments ALTER COLUMN currency TYPE currency_code USING currency::currency_code;
ALTER TABLE payments ALTER COLUMN currency SET DEFAULT 'RUB';
ALTER TABLE payments ADD COLUMN amount_original INTEGER;
ALTER TABLE payments ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;

ALTER TABLE service_bookings ADD COLUMN currency currency_code DEFAULT 'RUB';
ALTER TABLE service_bookings ADD COLUMN total_amount_original INTEGER;
ALTER TABLE service_bookings ADD COLUMN escrow_amount_original INTEGER;
ALTER TABLE service_bookings ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;

ALTER TABLE group_buy_deals ADD COLUMN currency currency_code DEFAULT 'RUB';
ALTER TABLE group_buy_deals ADD COLUMN discount_amount_original INTEGER;
ALTER TABLE group_buy_deals ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;

ALTER TABLE group_buy_orders ADD COLUMN currency currency_code DEFAULT 'RUB';
ALTER TABLE group_buy_orders ADD COLUMN price_per_unit_original INTEGER;
ALTER TABLE group_buy_orders ADD COLUMN total_amount_original INTEGER;
ALTER TABLE group_buy_orders ADD COLUMN discount_amount_original INTEGER;
ALTER TABLE group_buy_orders ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;

-- Create exchange rates table for real-time currency conversion
CREATE TABLE exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    from_currency currency_code NOT NULL,
    to_currency currency_code NOT NULL,
    rate DECIMAL(10,6) NOT NULL CHECK (rate > 0),
    source TEXT NOT NULL, -- 'api', 'manual', 'bank'
    is_active BOOLEAN DEFAULT TRUE,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(from_currency, to_currency, valid_from)
);

-- Create user currency preferences table
CREATE TABLE user_currency_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    primary_currency currency_code NOT NULL DEFAULT 'RUB',
    display_currency currency_code NOT NULL DEFAULT 'RUB',
    auto_convert BOOLEAN DEFAULT TRUE,
    exchange_rate_source TEXT DEFAULT 'api',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Add currency to intl_shipment_quotes
ALTER TABLE intl_shipment_quotes ADD COLUMN currency currency_code DEFAULT 'RUB';
ALTER TABLE intl_shipment_quotes ADD COLUMN base_cost_original INTEGER;
ALTER TABLE intl_shipment_quotes ADD COLUMN duty_estimate_original INTEGER;
ALTER TABLE intl_shipment_quotes ADD COLUMN total_cost_original INTEGER;
ALTER TABLE intl_shipment_quotes ADD COLUMN exchange_rate DECIMAL(10,6) DEFAULT 1.0;

-- Create indexes for currency fields
CREATE INDEX idx_listings_currency ON listings(currency);
CREATE INDEX idx_vendor_products_currency ON vendor_products(currency);
CREATE INDEX idx_services_currency ON services(currency);
CREATE INDEX idx_orders_currency ON orders(currency);
CREATE INDEX idx_payments_currency ON payments(currency);

CREATE INDEX idx_exchange_rates_from_to ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_active ON exchange_rates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_exchange_rates_valid_from ON exchange_rates(valid_from);

CREATE INDEX idx_user_currency_preferences_user_id ON user_currency_preferences(user_id);

-- Insert default exchange rates (1:1 for same currency, sample rates for others)
INSERT INTO exchange_rates (from_currency, to_currency, rate, source) VALUES
-- USD to other currencies (sample rates)
('USD', 'USD', 1.0, 'manual'),
('USD', 'EUR', 0.85, 'api'),
('USD', 'GBP', 0.73, 'api'),
('USD', 'RUB', 75.0, 'api'),
('USD', 'JPY', 110.0, 'api'),
('USD', 'CAD', 1.25, 'api'),
('USD', 'AUD', 1.35, 'api'),
('USD', 'CHF', 0.92, 'api'),
('USD', 'CNY', 6.45, 'api'),
('USD', 'KRW', 1200.0, 'api'),

-- EUR to other currencies
('EUR', 'EUR', 1.0, 'manual'),
('EUR', 'USD', 1.18, 'api'),
('EUR', 'GBP', 0.86, 'api'),
('EUR', 'RUB', 88.0, 'api'),
('EUR', 'JPY', 129.0, 'api'),
('EUR', 'CAD', 1.47, 'api'),
('EUR', 'AUD', 1.59, 'api'),
('EUR', 'CHF', 1.08, 'api'),

-- GBP to other currencies
('GBP', 'GBP', 1.0, 'manual'),
('GBP', 'USD', 1.37, 'api'),
('GBP', 'EUR', 1.16, 'api'),
('GBP', 'RUB', 102.0, 'api'),
('GBP', 'JPY', 150.0, 'api'),
('GBP', 'CAD', 1.71, 'api'),
('GBP', 'AUD', 1.85, 'api'),

-- RUB to other currencies
('RUB', 'RUB', 1.0, 'manual'),
('RUB', 'USD', 0.013, 'api'),
('RUB', 'EUR', 0.011, 'api'),
('RUB', 'GBP', 0.010, 'api'),
('RUB', 'JPY', 1.47, 'api'),
('RUB', 'CAD', 0.017, 'api'),
('RUB', 'AUD', 0.018, 'api'),

-- Add reverse rates for remaining pairs (avoiding duplicates)
('JPY', 'USD', 0.009, 'api'),
('CAD', 'USD', 0.80, 'api'),
('AUD', 'USD', 0.74, 'api'),
('CHF', 'USD', 1.09, 'api'),
('CNY', 'USD', 0.155, 'api'),
('KRW', 'USD', 0.00083, 'api');

-- Create function to get current exchange rate
CREATE OR REPLACE FUNCTION get_exchange_rate(
    from_curr currency_code,
    to_curr currency_code,
    rate_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS DECIMAL(10,6) AS $$
DECLARE
    rate DECIMAL(10,6);
BEGIN
    -- If same currency, return 1
    IF from_curr = to_curr THEN
        RETURN 1.0;
    END IF;
    
    -- Get the most recent active rate
    SELECT er.rate INTO rate
    FROM exchange_rates er
    WHERE er.from_currency = from_curr
      AND er.to_currency = to_curr
      AND er.is_active = TRUE
      AND (er.valid_until IS NULL OR er.valid_until > rate_date)
      AND er.valid_from <= rate_date
    ORDER BY er.valid_from DESC
    LIMIT 1;
    
    -- If no direct rate found, try reverse rate
    IF rate IS NULL THEN
        SELECT (1.0 / er.rate) INTO rate
        FROM exchange_rates er
        WHERE er.from_currency = to_curr
          AND er.to_currency = from_curr
          AND er.is_active = TRUE
          AND (er.valid_until IS NULL OR er.valid_until > rate_date)
          AND er.valid_from <= rate_date
        ORDER BY er.valid_from DESC
        LIMIT 1;
    END IF;
    
    -- If still no rate found, return 1 (fallback)
    IF rate IS NULL THEN
        RETURN 1.0;
    END IF;
    
    RETURN rate;
END;
$$ LANGUAGE plpgsql;

-- Create function to convert currency
CREATE OR REPLACE FUNCTION convert_currency(
    amount INTEGER,
    from_curr currency_code,
    to_curr currency_code,
    rate_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS INTEGER AS $$
DECLARE
    rate DECIMAL(10,6);
    converted_amount INTEGER;
BEGIN
    rate := get_exchange_rate(from_curr, to_curr, rate_date);
    converted_amount := ROUND(amount * rate);
    RETURN converted_amount;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for new tables
CREATE TRIGGER update_exchange_rates_updated_at BEFORE UPDATE ON exchange_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_currency_preferences_updated_at BEFORE UPDATE ON user_currency_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
