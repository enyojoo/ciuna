-- Seed data for Ciuna platform testing
-- This file contains sample data for testing the platform

-- Insert sample categories
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
('Electronics', 'electronics', 'Electronic devices and accessories', NULL, true, 1),
('Furniture', 'furniture', 'Home and office furniture', NULL, true, 2),
('Clothing', 'clothing', 'Fashion and apparel', NULL, true, 3),
('Books', 'books', 'Books and educational materials', NULL, true, 4),
('Sports', 'sports', 'Sports equipment and gear', NULL, true, 5),
('Home & Garden', 'home-garden', 'Home improvement and gardening', NULL, true, 6),
('Automotive', 'automotive', 'Car parts and accessories', NULL, true, 7),
('Services', 'services', 'Professional services', NULL, true, 8),
('Food & Drinks', 'food-drinks', 'Food and beverages', NULL, true, 9),
('Beauty & Health', 'beauty-health', 'Beauty and health products', NULL, true, 10);

-- Insert subcategories for Electronics
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
('Smartphones', 'smartphones', 'Mobile phones and accessories', (SELECT id FROM categories WHERE name = 'Electronics'), true, 1),
('Laptops', 'laptops', 'Laptop computers and accessories', (SELECT id FROM categories WHERE name = 'Electronics'), true, 2),
('Audio', 'audio', 'Headphones, speakers, and audio equipment', (SELECT id FROM categories WHERE name = 'Electronics'), true, 3),
('Gaming', 'gaming', 'Gaming consoles and accessories', (SELECT id FROM categories WHERE name = 'Electronics'), true, 4);

-- Insert subcategories for Services
INSERT INTO categories (name, slug, description, parent_id, is_active, sort_order) VALUES
('Tutoring', 'tutoring', 'Educational and language tutoring', (SELECT id FROM categories WHERE name = 'Services'), true, 1),
('Cleaning', 'cleaning', 'House and office cleaning services', (SELECT id FROM categories WHERE name = 'Services'), true, 2),
('Repair', 'repair', 'Repair and maintenance services', (SELECT id FROM categories WHERE name = 'Services'), true, 3),
('Transportation', 'transportation', 'Delivery and transportation services', (SELECT id FROM categories WHERE name = 'Services'), true, 4);

-- Locations table doesn't exist in current schema - using city/district as text fields

-- IMPORTANT: This seed file requires profiles to exist first!
-- 
-- Before running this seed file, you must:
-- 1. Create users in Supabase Auth with these specific IDs:
--    - 9e8a6b85-0587-4106-b5d8-21506fb88d85 (john.doe@example.com)
--    - a0c13f9c-885a-4378-a024-0ab7008ef135 (maria.smith@example.com)
--    - 564fe5f9-0cac-4b21-94f7-04c553c0df3a (alex.tech@example.com)
--    - cb6afb44-8e6b-43ee-94f5-bcd9b82054ff (furniture.plus@example.com)
--    - 978f5857-dff2-43d3-8c24-d2b2d6226055 (anna.tutor@example.com)
--    - 77348c6e-22a6-4094-8d7a-bf5dec674a1f (maria.clean@example.com)
--    - 3ee90f5f-bf22-4d1b-873f-c85de644c3b1 (alex.repair@example.com)
-- 2. Run create_profiles.sql to create the corresponding profiles
-- 3. Then run this seed.sql file
--
-- Alternative: Use supabase db reset to apply all migrations and seed data automatically

-- Insert sample listings
INSERT INTO listings (
    seller_id, 
    title, 
    description, 
    category_id, 
    price_rub, 
    condition, 
    city, 
    district, 
    status,
    photo_urls,
    tags
) VALUES
(
    '9e8a6b85-0587-4106-b5d8-21506fb88d85',
    'iPhone 13 Pro Max 256GB',
    'Excellent condition iPhone 13 Pro Max in Space Gray. Used for 6 months, no scratches or damage. Comes with original box, charger, and case.',
    (SELECT id FROM categories WHERE name = 'Smartphones'),
    75000,
    'LIKE_NEW',
    'Moscow',
    'Arbat',
    'ACTIVE',
    ARRAY['https://example.com/iphone1.jpg', 'https://example.com/iphone2.jpg'],
    ARRAY['iphone', 'smartphone', 'apple', 'mobile']
),
(
    '9e8a6b85-0587-4106-b5d8-21506fb88d85',
    'MacBook Pro 14" M1 Pro',
    'MacBook Pro 14-inch with M1 Pro chip, 16GB RAM, 512GB SSD. Perfect for developers and designers. Barely used, like new condition.',
    (SELECT id FROM categories WHERE name = 'Laptops'),
    150000,
    'LIKE_NEW',
    'Moscow',
    'Tverskoy',
    'ACTIVE',
    ARRAY['https://example.com/macbook1.jpg', 'https://example.com/macbook2.jpg'],
    ARRAY['macbook', 'laptop', 'apple', 'm1', 'pro']
),
(
    'a0c13f9c-885a-4378-a024-0ab7008ef135',
    'Sony WH-1000XM4 Headphones',
    'Noise-canceling wireless headphones in excellent condition. Great sound quality and battery life. Original packaging included.',
    (SELECT id FROM categories WHERE name = 'Audio'),
    25000,
    'GOOD',
    'Moscow',
    'Zamoskvorechye',
    'ACTIVE',
    ARRAY['https://example.com/sony1.jpg'],
    ARRAY['sony', 'headphones', 'wireless', 'noise-canceling']
),
(
    'a0c13f9c-885a-4378-a024-0ab7008ef135',
    'English Tutoring Services',
    'Professional English tutoring for all levels. Native speaker with 5 years experience. Online or in-person sessions available.',
    (SELECT id FROM categories WHERE name = 'Tutoring'),
    2000,
    'NEW',
    'Moscow',
    'Khamovniki',
    'ACTIVE',
    ARRAY['https://example.com/tutor1.jpg'],
    ARRAY['english', 'tutoring', 'education', 'language']
);

-- Insert sample vendors
INSERT INTO vendors (
    owner_id,
    name,
    description,
    country,
    city,
    district,
    type,
    status,
    contact_email,
    contact_phone,
    website,
    rating,
    verified
) VALUES
(
    '564fe5f9-0cac-4b21-94f7-04c553c0df3a',
    'TechStore Moscow',
    'Leading electronics retailer in Moscow. Specializing in smartphones, laptops, and accessories. Authorized dealer for major brands.',
    'RU',
    'Moscow',
    'Central',
    'LOCAL',
    'ACTIVE',
    'info@techstore-moscow.ru',
    '+7 (495) 123-4567',
    'https://techstore-moscow.ru',
    4.8,
    true
),
(
    'cb6afb44-8e6b-43ee-94f5-bcd9b82054ff',
    'Furniture Plus',
    'Modern furniture store offering contemporary and classic designs. Custom orders available. Free delivery in Moscow.',
    'RU',
    'Moscow',
    'Central',
    'LOCAL',
    'ACTIVE',
    'orders@furniture-plus.ru',
    '+7 (495) 987-6543',
    'https://furniture-plus.ru',
    4.6,
    true
);

-- Products table doesn't exist in current schema - using vendor_products instead

-- Insert sample service providers first
INSERT INTO service_providers (
    profile_id,
    name,
    bio,
    skills,
    verified,
    status,
    rating,
    languages,
    service_areas,
    hourly_rate_rub
) VALUES
(
    '978f5857-dff2-43d3-8c24-d2b2d6226055',
    'Anna Petrov',
    'Professional Russian language tutor with 5 years experience teaching expats.',
    ARRAY['Russian Language', 'Teaching', 'Translation'],
    true,
    'ACTIVE',
    4.9,
    ARRAY['Russian', 'English'],
    ARRAY['Moscow', 'Online'],
    2000
),
(
    '77348c6e-22a6-4094-8d7a-bf5dec674a1f',
    'Maria Clean',
    'Professional cleaning service with 3 years experience. Insured and reliable.',
    ARRAY['House Cleaning', 'Office Cleaning', 'Deep Cleaning'],
    true,
    'ACTIVE',
    4.7,
    ARRAY['Russian', 'English'],
    ARRAY['Moscow'],
    3000
),
(
    '3ee90f5f-bf22-4d1b-873f-c85de644c3b1',
    'Alex Tech',
    'Computer repair specialist with 8 years experience in hardware and software.',
    ARRAY['Computer Repair', 'Laptop Repair', 'Data Recovery'],
    true,
    'ACTIVE',
    4.8,
    ARRAY['Russian', 'English'],
    ARRAY['Moscow'],
    2500
);

-- Insert sample services
INSERT INTO services (
    provider_id,
    title,
    description,
    category,
    price_rub,
    duration_minutes,
    location,
    is_online,
    is_in_person,
    status
) VALUES
(
    (SELECT id FROM service_providers WHERE name = 'Anna Petrov'),
    'Russian Language Tutoring',
    'Learn Russian with a native speaker. All levels welcome. Flexible scheduling and personalized approach.',
    'PERSONAL',
    1500,
    60,
    'Moscow',
    true,
    true,
    'ACTIVE'
),
(
    (SELECT id FROM service_providers WHERE name = 'Maria Clean'),
    'Home Cleaning Service',
    'Professional house cleaning service. Weekly, bi-weekly, or one-time cleaning available. Insured and bonded.',
    'PERSONAL',
    3000,
    120,
    'Moscow',
    false,
    true,
    'ACTIVE'
),
(
    (SELECT id FROM service_providers WHERE name = 'Alex Tech'),
    'Computer Repair Service',
    'Expert computer and laptop repair. Hardware and software issues. Same-day service available.',
    'PERSONAL',
    2000,
    90,
    'Moscow',
    false,
    true,
    'ACTIVE'
);

-- Insert sample exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, source, valid_from) VALUES
('USD', 'RUB', 95.50, 'manual', NOW()),
('EUR', 'RUB', 103.20, 'manual', NOW()),
('GBP', 'RUB', 118.75, 'manual', NOW()),
('RUB', 'USD', 0.0105, 'manual', NOW()),
('RUB', 'EUR', 0.0097, 'manual', NOW()),
('RUB', 'GBP', 0.0084, 'manual', NOW());

-- Insert sample search suggestions
INSERT INTO search_suggestions (suggestion_text, suggestion_type, popularity_score) VALUES
('iPhone', 'POPULAR', 0.9),
('MacBook', 'POPULAR', 0.8),
('Samsung Galaxy', 'POPULAR', 0.7),
('Nike shoes', 'POPULAR', 0.6),
('Adidas', 'POPULAR', 0.5),
('Furniture', 'CATEGORY', 0.8),
('Electronics', 'CATEGORY', 0.9),
('Clothing', 'CATEGORY', 0.7),
('Books', 'CATEGORY', 0.6),
('Moscow', 'LOCATION', 0.9),
('Saint Petersburg', 'LOCATION', 0.8),
('Novosibirsk', 'LOCATION', 0.7);

-- Business goals and notifications tables don't exist in current schema

-- Update search vectors for full-text search
UPDATE listings SET search_vector = to_tsvector('english', title || ' ' || description);
UPDATE vendors SET search_vector = to_tsvector('english', name || ' ' || description);
UPDATE services SET search_vector = to_tsvector('english', title || ' ' || description);
-- Products table doesn't exist - search vector update removed
