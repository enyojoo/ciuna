-- Seed data for Ciuna platform testing
-- This file contains sample data for testing the platform

-- Insert sample categories
INSERT INTO categories (name, description, parent_id, is_active, sort_order) VALUES
('Electronics', 'Electronic devices and accessories', NULL, true, 1),
('Furniture', 'Home and office furniture', NULL, true, 2),
('Clothing', 'Fashion and apparel', NULL, true, 3),
('Books', 'Books and educational materials', NULL, true, 4),
('Sports', 'Sports equipment and gear', NULL, true, 5),
('Home & Garden', 'Home improvement and gardening', NULL, true, 6),
('Automotive', 'Car parts and accessories', NULL, true, 7),
('Services', 'Professional services', NULL, true, 8),
('Food & Drinks', 'Food and beverages', NULL, true, 9),
('Beauty & Health', 'Beauty and health products', NULL, true, 10);

-- Insert subcategories for Electronics
INSERT INTO categories (name, description, parent_id, is_active, sort_order) VALUES
('Smartphones', 'Mobile phones and accessories', (SELECT id FROM categories WHERE name = 'Electronics'), true, 1),
('Laptops', 'Laptop computers and accessories', (SELECT id FROM categories WHERE name = 'Electronics'), true, 2),
('Audio', 'Headphones, speakers, and audio equipment', (SELECT id FROM categories WHERE name = 'Electronics'), true, 3),
('Gaming', 'Gaming consoles and accessories', (SELECT id FROM categories WHERE name = 'Electronics'), true, 4);

-- Insert subcategories for Services
INSERT INTO categories (name, description, parent_id, is_active, sort_order) VALUES
('Tutoring', 'Educational and language tutoring', (SELECT id FROM categories WHERE name = 'Services'), true, 1),
('Cleaning', 'House and office cleaning services', (SELECT id FROM categories WHERE name = 'Services'), true, 2),
('Repair', 'Repair and maintenance services', (SELECT id FROM categories WHERE name = 'Services'), true, 3),
('Transportation', 'Delivery and transportation services', (SELECT id FROM categories WHERE name = 'Services'), true, 4);

-- Insert sample locations
INSERT INTO locations (name, type, parent_id, latitude, longitude, is_active) VALUES
('Moscow', 'city', NULL, 55.7558, 37.6176, true),
('Saint Petersburg', 'city', NULL, 59.9311, 30.3609, true),
('Novosibirsk', 'city', NULL, 55.0084, 82.9357, true),
('Yekaterinburg', 'city', NULL, 56.8431, 60.6454, true),
('Kazan', 'city', NULL, 55.8304, 49.0661, true);

-- Insert sample districts for Moscow
INSERT INTO locations (name, type, parent_id, latitude, longitude, is_active) VALUES
('Arbat', 'district', (SELECT id FROM locations WHERE name = 'Moscow'), 55.7522, 37.5916, true),
('Tverskoy', 'district', (SELECT id FROM locations WHERE name = 'Moscow'), 55.7658, 37.6176, true),
('Zamoskvorechye', 'district', (SELECT id FROM locations WHERE name = 'Moscow'), 55.7408, 37.6256, true),
('Khamovniki', 'district', (SELECT id FROM locations WHERE name = 'Moscow'), 55.7408, 37.5856, true);

-- Insert sample users (these will be created through Supabase Auth)
-- Note: In a real scenario, users are created through the auth system
-- This is just for reference of what the data structure looks like

-- Insert sample listings
INSERT INTO listings (
    user_id, 
    title, 
    description, 
    category_id, 
    price, 
    currency, 
    condition, 
    location_id, 
    status,
    images,
    tags
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'iPhone 13 Pro Max 256GB',
    'Excellent condition iPhone 13 Pro Max in Space Gray. Used for 6 months, no scratches or damage. Comes with original box, charger, and case.',
    (SELECT id FROM categories WHERE name = 'Smartphones'),
    75000,
    'RUB',
    'LIKE_NEW',
    (SELECT id FROM locations WHERE name = 'Arbat'),
    'ACTIVE',
    ARRAY['https://example.com/iphone1.jpg', 'https://example.com/iphone2.jpg'],
    ARRAY['iphone', 'smartphone', 'apple', 'mobile']
),
(
    '00000000-0000-0000-0000-000000000001',
    'MacBook Pro 14" M1 Pro',
    'MacBook Pro 14-inch with M1 Pro chip, 16GB RAM, 512GB SSD. Perfect for developers and designers. Barely used, like new condition.',
    (SELECT id FROM categories WHERE name = 'Laptops'),
    150000,
    'RUB',
    'LIKE_NEW',
    (SELECT id FROM locations WHERE name = 'Tverskoy'),
    'ACTIVE',
    ARRAY['https://example.com/macbook1.jpg', 'https://example.com/macbook2.jpg'],
    ARRAY['macbook', 'laptop', 'apple', 'm1', 'pro']
),
(
    '00000000-0000-0000-0000-000000000002',
    'Sony WH-1000XM4 Headphones',
    'Noise-canceling wireless headphones in excellent condition. Great sound quality and battery life. Original packaging included.',
    (SELECT id FROM categories WHERE name = 'Audio'),
    25000,
    'RUB',
    'GOOD',
    (SELECT id FROM locations WHERE name = 'Zamoskvorechye'),
    'ACTIVE',
    ARRAY['https://example.com/sony1.jpg'],
    ARRAY['sony', 'headphones', 'wireless', 'noise-canceling']
),
(
    '00000000-0000-0000-0000-000000000002',
    'English Tutoring Services',
    'Professional English tutoring for all levels. Native speaker with 5 years experience. Online or in-person sessions available.',
    (SELECT id FROM categories WHERE name = 'Tutoring'),
    2000,
    'RUB',
    'NEW',
    (SELECT id FROM locations WHERE name = 'Khamovniki'),
    'ACTIVE',
    ARRAY['https://example.com/tutor1.jpg'],
    ARRAY['english', 'tutoring', 'education', 'language']
);

-- Insert sample vendors
INSERT INTO vendors (
    user_id,
    business_name,
    business_type,
    description,
    location_id,
    contact_email,
    contact_phone,
    website,
    rating,
    is_verified,
    is_active
) VALUES
(
    '00000000-0000-0000-0000-000000000003',
    'TechStore Moscow',
    'SMALL_BUSINESS',
    'Leading electronics retailer in Moscow. Specializing in smartphones, laptops, and accessories. Authorized dealer for major brands.',
    (SELECT id FROM locations WHERE name = 'Moscow'),
    'info@techstore-moscow.ru',
    '+7 (495) 123-4567',
    'https://techstore-moscow.ru',
    4.8,
    true,
    true
),
(
    '00000000-0000-0000-0000-000000000004',
    'Furniture Plus',
    'SMALL_BUSINESS',
    'Modern furniture store offering contemporary and classic designs. Custom orders available. Free delivery in Moscow.',
    (SELECT id FROM locations WHERE name = 'Moscow'),
    'orders@furniture-plus.ru',
    '+7 (495) 987-6543',
    'https://furniture-plus.ru',
    4.6,
    true,
    true
);

-- Insert sample products for vendors
INSERT INTO products (
    vendor_id,
    name,
    description,
    category_id,
    price,
    currency,
    sku,
    stock_quantity,
    is_active
) VALUES
(
    (SELECT id FROM vendors WHERE business_name = 'TechStore Moscow'),
    'Samsung Galaxy S23 Ultra',
    'Latest Samsung flagship smartphone with 200MP camera and S Pen. 256GB storage, 12GB RAM.',
    (SELECT id FROM categories WHERE name = 'Smartphones'),
    85000,
    'RUB',
    'SAMSUNG-S23U-256',
    10,
    true
),
(
    (SELECT id FROM vendors WHERE business_name = 'TechStore Moscow'),
    'Dell XPS 13 Laptop',
    'Ultra-thin laptop with 13.4" 4K display, Intel i7 processor, 16GB RAM, 512GB SSD.',
    (SELECT id FROM categories WHERE name = 'Laptops'),
    120000,
    'RUB',
    'DELL-XPS13-512',
    5,
    true
),
(
    (SELECT id FROM vendors WHERE business_name = 'Furniture Plus'),
    'Modern Office Chair',
    'Ergonomic office chair with lumbar support and adjustable height. Black leather upholstery.',
    (SELECT id FROM categories WHERE name = 'Furniture'),
    25000,
    'RUB',
    'CHAIR-OFFICE-001',
    15,
    true
);

-- Insert sample services
INSERT INTO services (
    provider_id,
    title,
    description,
    category_id,
    price,
    currency,
    location_id,
    is_active
) VALUES
(
    '00000000-0000-0000-0000-000000000005',
    'Russian Language Tutoring',
    'Learn Russian with a native speaker. All levels welcome. Flexible scheduling and personalized approach.',
    (SELECT id FROM categories WHERE name = 'Tutoring'),
    1500,
    'RUB',
    (SELECT id FROM locations WHERE name = 'Moscow'),
    true
),
(
    '00000000-0000-0000-0000-000000000006',
    'Home Cleaning Service',
    'Professional house cleaning service. Weekly, bi-weekly, or one-time cleaning available. Insured and bonded.',
    (SELECT id FROM categories WHERE name = 'Cleaning'),
    3000,
    'RUB',
    (SELECT id FROM locations WHERE name = 'Moscow'),
    true
),
(
    '00000000-0000-0000-0000-000000000007',
    'Computer Repair Service',
    'Expert computer and laptop repair. Hardware and software issues. Same-day service available.',
    (SELECT id FROM categories WHERE name = 'Repair'),
    2000,
    'RUB',
    (SELECT id FROM locations WHERE name = 'Moscow'),
    true
);

-- Insert sample exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate, provider, valid_from) VALUES
('USD', 'RUB', 95.50, 'MANUAL', NOW()),
('EUR', 'RUB', 103.20, 'MANUAL', NOW()),
('GBP', 'RUB', 118.75, 'MANUAL', NOW()),
('RUB', 'USD', 0.0105, 'MANUAL', NOW()),
('RUB', 'EUR', 0.0097, 'MANUAL', NOW()),
('RUB', 'GBP', 0.0084, 'MANUAL', NOW());

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

-- Insert sample business goals
INSERT INTO business_goals (
    user_id,
    title,
    description,
    goal_type,
    target_value,
    current_value,
    unit,
    start_date,
    end_date,
    status,
    progress_percentage
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Monthly Revenue Target',
    'Achieve 500,000 RUB in monthly revenue',
    'REVENUE',
    500000,
    350000,
    'RUB',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month',
    'ACTIVE',
    70.0
),
(
    '00000000-0000-0000-0000-000000000002',
    'Customer Acquisition',
    'Reach 100 new customers this quarter',
    'CUSTOMERS',
    100,
    75,
    'customers',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '3 months',
    'ACTIVE',
    75.0
);

-- Insert sample business notifications
INSERT INTO business_notifications (
    user_id,
    notification_type,
    title,
    message,
    priority,
    is_read
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'REVENUE_MILESTONE',
    'Revenue Milestone Reached!',
    'Congratulations! You have reached 70% of your monthly revenue goal.',
    'MEDIUM',
    false
),
(
    '00000000-0000-0000-0000-000000000002',
    'GOAL_AT_RISK',
    'Goal Progress Alert',
    'Your customer acquisition goal is at risk. Consider increasing marketing efforts.',
    'HIGH',
    false
);

-- Update search vectors for full-text search
UPDATE listings SET search_vector = to_tsvector('english', title || ' ' || description);
UPDATE vendors SET search_vector = to_tsvector('english', business_name || ' ' || description);
UPDATE services SET search_vector = to_tsvector('english', title || ' ' || description);
UPDATE products SET search_vector = to_tsvector('english', name || ' ' || description);
