-- Minimal seed file with only independent data
-- This file can be run without foreign key constraint issues

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

-- Insert international shipment quotes
INSERT INTO intl_shipment_quotes (from_country, to_country, volumetric_weight_kg, base_cost, duty_estimate) VALUES
('US', 'RU', 2.5, 3500, 500),
('UK', 'RU', 1.8, 2800, 400),
('DE', 'RU', 1.2, 2200, 300),
('FR', 'RU', 1.5, 2500, 350),
('CN', 'RU', 3.0, 1800, 200);
