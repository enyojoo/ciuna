-- Create sample profiles for testing
-- This file should be run AFTER creating users through Supabase Auth
-- 
-- To use this file:
-- 1. First, create users in Supabase Auth with the following IDs:
--    - 9e8a6b85-0587-4106-b5d8-21506fb88d85 (john.doe@example.com)
--    - a0c13f9c-885a-4378-a024-0ab7008ef135 (maria.smith@example.com)
--    - 564fe5f9-0cac-4b21-94f7-04c553c0df3a (alex.tech@example.com)
--    - cb6afb44-8e6b-43ee-94f5-bcd9b82054ff (furniture.plus@example.com)
--    - 978f5857-dff2-43d3-8c24-d2b2d6226055 (anna.tutor@example.com)
--    - 77348c6e-22a6-4094-8d7a-bf5dec674a1f (maria.clean@example.com)
--    - 3ee90f5f-bf22-4d1b-873f-c85de644c3b1 (alex.repair@example.com)
-- 2. Then run this SQL file to create the corresponding profiles

INSERT INTO profiles (
    id,
    email,
    role,
    country_of_origin,
    city,
    district,
    phone,
    verified_expat,
    verification_status,
    bio,
    languages
) VALUES
(
    '9e8a6b85-0587-4106-b5d8-21506fb88d85',
    'john.doe@example.com',
    'USER',
    'US',
    'Moscow',
    'Arbat',
    '+7 (495) 123-4567',
    true,
    'APPROVED',
    'Expat from the US living in Moscow. Love technology and gadgets.',
    ARRAY['English', 'Russian']
),
(
    'a0c13f9c-885a-4378-a024-0ab7008ef135',
    'maria.smith@example.com',
    'USER',
    'UK',
    'Moscow',
    'Tverskoy',
    '+7 (495) 234-5678',
    true,
    'APPROVED',
    'British expat in Moscow. Professional tutor and language enthusiast.',
    ARRAY['English', 'Russian', 'French']
),
(
    '564fe5f9-0cac-4b21-94f7-04c553c0df3a',
    'alex.tech@example.com',
    'VENDOR',
    'RU',
    'Moscow',
    'Central',
    '+7 (495) 345-6789',
    false,
    'APPROVED',
    'Tech entrepreneur and electronics retailer.',
    ARRAY['Russian', 'English']
),
(
    'cb6afb44-8e6b-43ee-94f5-bcd9b82054ff',
    'furniture.plus@example.com',
    'VENDOR',
    'RU',
    'Moscow',
    'Central',
    '+7 (495) 456-7890',
    false,
    'APPROVED',
    'Modern furniture store owner with 10 years experience.',
    ARRAY['Russian', 'English']
),
(
    '978f5857-dff2-43d3-8c24-d2b2d6226055',
    'anna.tutor@example.com',
    'USER',
    'RU',
    'Moscow',
    'Khamovniki',
    '+7 (495) 567-8901',
    false,
    'APPROVED',
    'Professional Russian language tutor with 5 years experience.',
    ARRAY['Russian', 'English']
),
(
    '77348c6e-22a6-4094-8d7a-bf5dec674a1f',
    'maria.clean@example.com',
    'USER',
    'RU',
    'Moscow',
    'Zamoskvorechye',
    '+7 (495) 678-9012',
    false,
    'APPROVED',
    'Professional cleaning service provider.',
    ARRAY['Russian', 'English']
),
(
    '3ee90f5f-bf22-4d1b-873f-c85de644c3b1',
    'alex.repair@example.com',
    'USER',
    'RU',
    'Moscow',
    'Tverskoy',
    '+7 (495) 789-0123',
    false,
    'APPROVED',
    'Computer repair specialist with 8 years experience.',
    ARRAY['Russian', 'English']
)
ON CONFLICT (id) DO NOTHING;
