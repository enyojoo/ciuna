-- Add missing profile fields for user dashboard
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add price_rub field to orders table for easier querying
ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_rub INTEGER CHECK (price_rub >= 0);

-- Update the price_rub field based on the order type
-- This will be populated by application logic when orders are created
-- For now, we'll set a default value of 0 for existing orders
UPDATE orders SET price_rub = 0 WHERE price_rub IS NULL;

-- Make price_rub NOT NULL after setting defaults
ALTER TABLE orders ALTER COLUMN price_rub SET NOT NULL;

-- Add indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON profiles(last_name);
CREATE INDEX IF NOT EXISTS idx_orders_price_rub ON orders(price_rub);
