-- Insert parent categories with explicit IDs
INSERT INTO categories (id, name, slug, parent_id) VALUES
(1, 'Electronics', 'electronics', NULL),
(2, 'Furniture', 'furniture', NULL),
(3, 'Clothing', 'clothing', NULL),
(4, 'Books', 'books', NULL),
(5, 'Sports', 'sports', NULL),
(6, 'Automotive', 'automotive', NULL),
(7, 'Home & Garden', 'home-garden', NULL),
(8, 'Toys & Games', 'toys-games', NULL),
(9, 'Services', 'services', NULL),
(10, 'Food & Beverages', 'food-beverages', NULL);

-- Insert subcategories for Electronics
INSERT INTO categories (name, slug, parent_id) VALUES
('Computers & Laptops', 'computers-laptops', 1),
('Phones & Accessories', 'phones-accessories', 1),
('Audio & Video', 'audio-video', 1),
('Gaming', 'gaming', 1);

-- Insert subcategories for Furniture
INSERT INTO categories (name, slug, parent_id) VALUES
('Living Room', 'living-room', 2),
('Bedroom', 'bedroom', 2),
('Kitchen & Dining', 'kitchen-dining', 2),
('Office', 'office', 2);

-- Insert subcategories for Clothing
INSERT INTO categories (name, slug, parent_id) VALUES
('Men''s Clothing', 'mens-clothing', 3),
('Women''s Clothing', 'womens-clothing', 3),
('Children''s Clothing', 'childrens-clothing', 3),
('Shoes', 'shoes', 3);

-- Insert subcategories for Services
INSERT INTO categories (name, slug, parent_id) VALUES
('Legal Services', 'legal-services', 9),
('Financial Services', 'financial-services', 9),
('Personal Services', 'personal-services', 9),
('Event Planning', 'event-planning', 9),
('Healthcare', 'healthcare', 9);

-- NOTE: Profile insertions are temporarily commented out due to foreign key constraints
-- The profiles table has a foreign key constraint to auth.users which requires users to exist first
-- To create test data, you can either:
-- 1. Create users manually through the Supabase Dashboard
-- 2. Use the Supabase Auth API to create users programmatically
-- 3. Run this seed file first, then create users and profiles separately

-- Uncomment the following lines after creating users in the auth.users table:
/*
INSERT INTO profiles (id, email, first_name, last_name, role, country_of_origin, city, verified_expat, verification_status) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@ciuna.com', 'Admin', 'User', 'ADMIN', 'United States', 'Moscow', true, 'APPROVED'),
('22222222-2222-2222-2222-222222222222', 'john.smith@example.com', 'John', 'Smith', 'VENDOR', 'United States', 'Moscow', true, 'APPROVED'),
('33333333-3333-3333-3333-333333333333', 'maria.garcia@example.com', 'Maria', 'Garcia', 'USER', 'Spain', 'St. Petersburg', true, 'APPROVED'),
('44444444-4444-4444-4444-444444444444', 'david.wilson@example.com', 'David', 'Wilson', 'USER', 'United Kingdom', 'Moscow', true, 'APPROVED'),
('55555555-5555-5555-5555-555555555555', 'sophie.martin@example.com', 'Sophie', 'Martin', 'USER', 'France', 'Moscow', true, 'APPROVED'),
('66666666-6666-6666-6666-666666666666', 'alex.johnson@example.com', 'Alex', 'Johnson', 'USER', 'Canada', 'St. Petersburg', false, 'PENDING'),
('77777777-7777-7777-7777-777777777777', 'sarah.wilson@example.com', 'Sarah', 'Wilson', 'USER', 'Australia', 'Moscow', true, 'APPROVED'),
('88888888-8888-8888-8888-888888888888', 'michael.brown@example.com', 'Michael', 'Brown', 'COURIER', 'Germany', 'Moscow', true, 'APPROVED');
*/

-- NOTE: Vendor insertions are commented out as they depend on profiles
-- Uncomment after creating profiles:
/*
INSERT INTO vendors (owner_id, name, description, country, city, verified, type, status) VALUES
('22222222-2222-2222-2222-222222222222', 'Expat Electronics Store', 'Your one-stop shop for electronics and gadgets. We specialize in bringing international brands to Russia.', 'United States', 'Moscow', true, 'INTERNATIONAL', 'ACTIVE'),
('33333333-3333-3333-3333-333333333333', 'Moscow Furniture Hub', 'Quality furniture for expats. From IKEA to custom pieces, we have everything for your home.', 'Russia', 'Moscow', true, 'LOCAL', 'ACTIVE'),
('44444444-4444-4444-4444-444444444444', 'International Books & Media', 'Books, magazines, and media in multiple languages. Perfect for expats missing home.', 'United Kingdom', 'St. Petersburg', false, 'INTERNATIONAL', 'ACTIVE'),
('55555555-5555-5555-5555-555555555555', 'Fashion Forward', 'Trendy clothing and accessories for the modern expat. International styles, local prices.', 'France', 'Moscow', true, 'INTERNATIONAL', 'ACTIVE');
*/

-- NOTE: Vendor products are commented out as they depend on vendors (which depend on profiles)
-- Uncomment after creating profiles and vendors:
/*
INSERT INTO vendor_products (vendor_id, name, description, category_id, price_rub, stock_quantity, is_local_stock, is_dropship, status) VALUES
-- Electronics Store products
(1, 'MacBook Pro 13-inch M2', 'Latest MacBook Pro with M2 chip, 8GB RAM, 256GB SSD', 11, 120000, 5, true, false, 'ACTIVE'),
(1, 'iPhone 14 Pro', 'Apple iPhone 14 Pro, 128GB, Space Black', 12, 95000, 3, true, false, 'ACTIVE'),
(1, 'Sony WH-1000XM4 Headphones', 'Noise-cancelling wireless headphones', 13, 25000, 8, true, false, 'ACTIVE'),
(1, 'PlayStation 5', 'Sony PlayStation 5 Console', 14, 45000, 2, false, true, 'ACTIVE'),

-- Furniture Hub products
(2, 'IKEA HEMNES Bookcase', 'White bookcase with 5 shelves', 15, 15000, 4, true, false, 'ACTIVE'),
(2, 'IKEA MALM Bed Frame', 'Queen size bed frame in white', 16, 12000, 3, true, false, 'ACTIVE'),
(2, 'IKEA EKTORP Sofa', '3-seat sofa in gray fabric', 15, 25000, 2, true, false, 'ACTIVE'),
(2, 'IKEA ALEX Desk', 'White desk with drawers', 18, 8000, 6, true, false, 'ACTIVE'),

-- Books & Media products
(3, 'English Language Learning Books', 'Complete set of English learning materials', 4, 5000, 10, true, false, 'ACTIVE'),
(3, 'International Magazines', 'Latest issues of Time, National Geographic, etc.', 4, 2000, 20, true, false, 'ACTIVE'),
(3, 'Russian Language Books', 'Books for learning Russian', 4, 3000, 15, true, false, 'ACTIVE'),

-- Fashion Forward products
(4, 'Designer Handbag', 'Luxury handbag from international brand', 19, 35000, 2, false, true, 'ACTIVE'),
(4, 'Winter Coat', 'Warm winter coat perfect for Russian weather', 19, 18000, 5, true, false, 'ACTIVE'),
(4, 'Running Shoes', 'High-quality running shoes', 22, 12000, 8, true, false, 'ACTIVE');

-- Insert group buy deals
INSERT INTO group_buy_deals (vendor_product_id, min_quantity, discount_percentage, expires_at, status) VALUES
(1, 5, 10, NOW() + INTERVAL '7 days', 'ACTIVE'),
(2, 10, 15, NOW() + INTERVAL '14 days', 'ACTIVE'),
(3, 8, 20, NOW() + INTERVAL '10 days', 'ACTIVE');

-- Insert group buy orders
INSERT INTO group_buy_orders (deal_id, buyer_id, quantity) VALUES
(1, '33333333-3333-3333-3333-333333333333', 1),
(1, '44444444-4444-4444-4444-444444444444', 1),
(2, '55555555-5555-5555-5555-555555555555', 2),
(2, '66666666-6666-6666-6666-666666666666', 1);

-- Insert service providers
INSERT INTO service_providers (profile_id, name, bio, skills, verified, status) VALUES
('77777777-7777-7777-7777-777777777777', 'Sarah Wilson Legal Services', 'Experienced lawyer specializing in expat legal issues', ARRAY['Immigration Law', 'Business Law', 'Contract Review'], true, 'ACTIVE'),
('88888888-8888-8888-8888-888888888888', 'Michael Brown Financial Consulting', 'Financial advisor helping expats with Russian banking and investments', ARRAY['Financial Planning', 'Tax Consulting', 'Investment Advice'], true, 'ACTIVE');

-- Insert services
INSERT INTO services (provider_id, title, description, category, price, duration_minutes, status) VALUES
(1, 'Immigration Consultation', 'Help with visa extensions, work permits, and residency issues', 'LEGAL', 5000, 60, 'ACTIVE'),
(1, 'Contract Review', 'Review and explain contracts in English', 'LEGAL', 3000, 30, 'ACTIVE'),
(2, 'Financial Planning Session', 'Personal financial planning for expats in Russia', 'FINANCIAL', 4000, 90, 'ACTIVE'),
(2, 'Tax Preparation Help', 'Assistance with Russian tax filing for foreigners', 'FINANCIAL', 2500, 45, 'ACTIVE');

-- Insert sample listings
INSERT INTO listings (seller_id, title, description, category_id, price, condition, city, district, photo_urls, status) VALUES
('33333333-3333-3333-3333-333333333333', 'MacBook Pro 13-inch M2 Chip - Excellent Condition', 'Selling my MacBook Pro 13-inch with M2 chip. It''s in excellent condition, barely used. Comes with original charger and box.', 11, 120000, 'LIKE_NEW', 'Moscow', 'Arbat', ARRAY['/api/placeholder/400/300'], 'ACTIVE'),
('44444444-4444-4444-4444-444444444444', 'IKEA Dining Table - White, 4 chairs included', 'White IKEA dining table with 4 matching chairs. Perfect condition, no scratches.', 17, 25000, 'GOOD', 'St. Petersburg', 'Nevsky Prospekt', ARRAY['/api/placeholder/400/300'], 'ACTIVE'),
('55555555-5555-5555-5555-555555555555', 'Russian Language Books - Complete Set', 'Complete set of Russian language learning books. Perfect for beginners.', 4, 5000, 'NEW', 'Moscow', 'Khamovniki', ARRAY['/api/placeholder/400/300'], 'ACTIVE'),
('66666666-6666-6666-6666-666666666666', 'Winter Coat - Size M, Perfect for Russian Winter', 'Warm winter coat, size M. Perfect for Russian winter weather. Barely worn.', 19, 8000, 'GOOD', 'Moscow', 'Tverskaya', ARRAY['/api/placeholder/400/300'], 'ACTIVE'),
('77777777-7777-7777-7777-777777777777', 'Guitar - Acoustic, Great for Beginners', 'Acoustic guitar perfect for beginners. Includes case and extra strings.', 5, 15000, 'FAIR', 'St. Petersburg', 'Vasileostrovsky', ARRAY['/api/placeholder/400/300'], 'ACTIVE'),
('33333333-3333-3333-3333-333333333333', 'Kitchen Appliances Set - Microwave, Toaster, Coffee Maker', 'Complete kitchen appliance set. All in working condition.', 7, 18000, 'GOOD', 'Moscow', 'Zamoskvorechye', ARRAY['/api/placeholder/400/300'], 'ACTIVE');

-- Insert conversations
INSERT INTO conversations (created_by) VALUES
('33333333-3333-3333-3333-333333333333'),
('44444444-4444-4444-4444-444444444444');

-- Insert conversation participants
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
(1, '33333333-3333-3333-3333-333333333333'),
(1, '22222222-2222-2222-2222-222222222222'),
(2, '44444444-4444-4444-4444-444444444444'),
(2, '55555555-5555-5555-5555-555555555555');

-- Insert messages
INSERT INTO messages (conversation_id, sender_id, body, source_lang, target_lang) VALUES
(1, '33333333-3333-3333-3333-333333333333', 'Hi! Is the MacBook still available?', 'en', 'ru'),
(1, '22222222-2222-2222-2222-222222222222', 'Yes, it is! Are you interested in buying it?', 'en', 'ru'),
(1, '33333333-3333-3333-3333-333333333333', 'Yes, I would like to see it in person first. When would be convenient?', 'en', 'ru'),
(2, '44444444-4444-4444-4444-444444444444', 'Hello! I saw your furniture listing. Is it still available?', 'en', 'ru'),
(2, '55555555-5555-5555-5555-555555555555', 'Yes, the dining table is still available. Would you like to arrange a viewing?', 'en', 'ru');

-- Insert addresses
INSERT INTO addresses (user_id, line1, city, district, postal_code, country_code) VALUES
('33333333-3333-3333-3333-333333333333', '123 Arbat Street', 'Moscow', 'Arbat', '119002', 'RU'),
('44444444-4444-4444-4444-444444444444', '456 Nevsky Prospekt', 'St. Petersburg', 'Nevsky Prospekt', '191025', 'RU'),
('55555555-5555-5555-5555-555555555555', '789 Tverskaya Street', 'Moscow', 'Tverskaya', '125009', 'RU');

-- Insert international shipment quotes
INSERT INTO intl_shipment_quotes (from_country, to_country, volumetric_weight_kg, base_cost, duty_estimate) VALUES
('US', 'RU', 2.5, 3500, 500),
('UK', 'RU', 1.8, 2800, 400),
('DE', 'RU', 1.2, 2200, 300),
('FR', 'RU', 1.5, 2500, 350),
('CN', 'RU', 3.0, 1800, 200);
