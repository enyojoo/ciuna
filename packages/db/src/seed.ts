import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Seed data schemas
const CategorySeedSchema = z.object({
  name: z.string(),
  slug: z.string(),
  parent_id: z.number().nullable(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

const ProfileSeedSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['USER', 'VENDOR', 'COURIER', 'ADMIN']),
  country_of_origin: z.string(),
  city: z.string(),
  district: z.string().optional(),
  phone: z.string().optional(),
  verified_expat: z.boolean(),
  verification_status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  avatar_url: z.string().optional(),
});

const VendorSeedSchema = z.object({
  owner_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  country: z.string(),
  city: z.string(),
  type: z.enum(['LOCAL', 'INTERNATIONAL']),
  verified: z.boolean(),
});

const ListingSeedSchema = z.object({
  seller_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category_id: z.number(),
  price_rub: z.number(),
  currency: z.string().optional(),
  price_original: z.number().optional(),
  exchange_rate: z.number().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  city: z.string(),
  district: z.string().optional(),
  photo_urls: z.array(z.string()).optional(),
});

const ServiceProviderSeedSchema = z.object({
  profile_id: z.string().uuid(),
  name: z.string(),
  bio: z.string(),
  skills: z.array(z.string()),
  verified: z.boolean(),
});

const ServiceSeedSchema = z.object({
  provider_id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['LEGAL', 'FINANCIAL', 'PERSONAL', 'EVENT', 'HEALTHCARE']),
  price_rub: z.number(),
  duration_minutes: z.number(),
  is_online: z.boolean(),
  is_in_person: z.boolean(),
  location: z.string().optional(),
});

// Seed data
const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    parent_id: null,
    description: 'Electronic devices and accessories',
    icon: '📱',
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    parent_id: null,
    description: 'Home and office furniture',
    icon: '🪑',
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    parent_id: null,
    description: 'Fashion and apparel',
    icon: '👕',
  },
  {
    name: 'Books',
    slug: 'books',
    parent_id: null,
    description: 'Books and educational materials',
    icon: '📚',
  },
  {
    name: 'Sports',
    slug: 'sports',
    parent_id: null,
    description: 'Sports equipment and gear',
    icon: '⚽',
  },
  {
    name: 'Home & Garden',
    slug: 'home-garden',
    parent_id: null,
    description: 'Home improvement and gardening',
    icon: '🏠',
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    parent_id: null,
    description: 'Toys and board games',
    icon: '🎮',
  },
  {
    name: 'Vehicles',
    slug: 'vehicles',
    parent_id: null,
    description: 'Cars, bikes, and transportation',
    icon: '🚗',
  },
  // Electronics subcategories
  {
    name: 'Smartphones',
    slug: 'smartphones',
    parent_id: 1,
    description: 'Mobile phones and accessories',
  },
  {
    name: 'Laptops',
    slug: 'laptops',
    parent_id: 1,
    description: 'Laptop computers and accessories',
  },
  {
    name: 'Audio',
    slug: 'audio',
    parent_id: 1,
    description: 'Headphones, speakers, and audio equipment',
  },
];

const profiles = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@ciuna.com',
    role: 'ADMIN' as const,
    country_of_origin: 'Russia',
    city: 'Moscow',
    district: 'Central',
    phone: '+7-999-123-4567',
    verified_expat: true,
    verification_status: 'APPROVED' as const,
    first_name: 'Admin',
    last_name: 'User',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'john.doe@example.com',
    role: 'USER' as const,
    country_of_origin: 'USA',
    city: 'Moscow',
    district: 'Arbat',
    phone: '+7-999-234-5678',
    verified_expat: true,
    verification_status: 'APPROVED' as const,
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'maria.garcia@example.com',
    role: 'USER' as const,
    country_of_origin: 'Spain',
    city: 'St. Petersburg',
    district: 'Nevsky',
    phone: '+7-999-345-6789',
    verified_expat: true,
    verification_status: 'APPROVED' as const,
    first_name: 'Maria',
    last_name: 'Garcia',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'vendor@techstore.com',
    role: 'VENDOR' as const,
    country_of_origin: 'Germany',
    city: 'Moscow',
    district: 'Tverskoy',
    phone: '+7-999-456-7890',
    verified_expat: true,
    verification_status: 'APPROVED' as const,
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'courier@ciuna.com',
    role: 'COURIER' as const,
    country_of_origin: 'Russia',
    city: 'Moscow',
    district: 'All',
    phone: '+7-999-567-8901',
    verified_expat: false,
    verification_status: 'APPROVED' as const,
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'lawyer@legal.com',
    role: 'USER' as const,
    country_of_origin: 'UK',
    city: 'Moscow',
    district: 'Khamovniki',
    phone: '+7-999-678-9012',
    verified_expat: true,
    verification_status: 'APPROVED' as const,
  },
];

const vendors = [
  {
    owner_id: '44444444-4444-4444-4444-444444444444',
    name: 'TechStore Moscow',
    description: 'Premium electronics and gadgets for expats in Moscow. We specialize in international brands and provide English-speaking support.',
    country: 'RU',
    city: 'Moscow',
    type: 'LOCAL' as const,
    verified: true,
  },
  {
    owner_id: '22222222-2222-2222-2222-222222222222',
    name: 'Expat Essentials',
    description: 'Everything you need as an expat in Russia. From household items to cultural guides.',
    country: 'RU',
    city: 'Moscow',
    type: 'LOCAL' as const,
    verified: true,
  },
];

const listings = [
  {
    seller_id: '22222222-2222-2222-2222-222222222222',
    title: 'MacBook Pro 13" 2022 - Excellent Condition',
    description: 'Selling my MacBook Pro 13" from 2022. Used for work, excellent condition. Comes with original charger and box. Perfect for expats who need reliable tech.',
    category_id: 10, // Laptops
    price_rub: 120000,
    currency: 'RUB',
    condition: 'LIKE_NEW' as const,
    city: 'Moscow',
    district: 'Arbat',
    photo_urls: ['https://example.com/macbook1.jpg', 'https://example.com/macbook2.jpg'],
  },
  {
    seller_id: '33333333-3333-3333-3333-333333333333',
    title: 'IKEA Dining Table - White',
    description: 'White IKEA dining table, seats 4 people. Great for small apartments. Moving out of Russia, need to sell quickly.',
    category_id: 2, // Furniture
    price_rub: 15000,
    currency: 'RUB',
    condition: 'GOOD' as const,
    city: 'St. Petersburg',
    district: 'Nevsky',
    photo_urls: ['https://example.com/table1.jpg'],
  },
  {
    seller_id: '22222222-2222-2222-2222-222222222222',
    title: 'Winter Coat - Size M',
    description: 'Warm winter coat, perfect for Russian winters. Barely used, excellent condition. Brand: Uniqlo.',
    category_id: 3, // Clothing
    price_rub: 8000,
    condition: 'LIKE_NEW' as const,
    city: 'Moscow',
    district: 'Arbat',
    photo_urls: ['https://example.com/coat1.jpg'],
  },
  {
    seller_id: '33333333-3333-3333-3333-333333333333',
    title: 'Russian Language Books - Set of 5',
    description: 'Complete set of Russian language learning books. Perfect for beginners. Includes workbooks and audio CDs.',
    category_id: 4, // Books
    price_rub: 3000,
    condition: 'GOOD' as const,
    city: 'St. Petersburg',
    district: 'Nevsky',
    photo_urls: ['https://example.com/books1.jpg'],
  },
];

const serviceProviders = [
  {
    profile_id: '66666666-6666-6666-6666-666666666666',
    name: 'Legal Services Moscow',
    bio: 'Experienced lawyer specializing in immigration law and business registration for expats in Russia. Fluent in English and Russian.',
    skills: ['Immigration Law', 'Business Registration', 'Contract Review', 'Legal Consultation'],
    verified: true,
  },
  {
    profile_id: '22222222-2222-2222-2222-222222222222',
    name: 'Expat Financial Advisor',
    bio: 'Certified financial advisor helping expats navigate Russian banking, taxes, and investment opportunities.',
    skills: ['Financial Planning', 'Tax Consultation', 'Banking', 'Investment Advice'],
    verified: true,
  },
];

const services = [
  {
    provider_id: 1,
    title: 'Immigration Consultation',
    description: 'One-on-one consultation about Russian immigration laws, visa requirements, and residency permits. Perfect for new expats.',
    category: 'LEGAL' as const,
    price_rub: 5000,
    duration_minutes: 60,
    is_online: true,
    is_in_person: true,
    location: 'Moscow, Tverskoy District',
  },
  {
    provider_id: 1,
    title: 'Business Registration Assistance',
    description: 'Complete assistance with registering a business in Russia. Includes document preparation and government liaison.',
    category: 'LEGAL' as const,
    price_rub: 25000,
    duration_minutes: 120,
    is_online: false,
    is_in_person: true,
    location: 'Moscow, Tverskoy District',
  },
  {
    provider_id: 2,
    title: 'Tax Filing for Expats',
    description: 'Professional tax filing service specifically for expats. We handle both Russian and international tax obligations.',
    category: 'FINANCIAL' as const,
    price_rub: 8000,
    duration_minutes: 90,
    is_online: true,
    is_in_person: false,
  },
  {
    provider_id: 2,
    title: 'Banking Setup Consultation',
    description: 'Help with opening bank accounts, understanding Russian banking system, and setting up international transfers.',
    category: 'FINANCIAL' as const,
    price_rub: 3000,
    duration_minutes: 45,
    is_online: true,
    is_in_person: true,
    location: 'Moscow, Arbat District',
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Insert categories
    console.log('📁 Inserting categories...');
    for (const category of categories) {
      const { error } = await supabase
        .from('categories')
        .insert(category);
      
      if (error) {
        console.error('Error inserting category:', error);
      }
    }

    // Insert profiles
    console.log('👥 Inserting profiles...');
    for (const profile of profiles) {
      const { error } = await supabase
        .from('profiles')
        .insert(profile);
      
      if (error) {
        console.error('Error inserting profile:', error);
      }
    }

    // Insert vendors
    console.log('🏪 Inserting vendors...');
    for (const vendor of vendors) {
      const { error } = await supabase
        .from('vendors')
        .insert(vendor);
      
      if (error) {
        console.error('Error inserting vendor:', error);
      }
    }

    // Insert listings
    console.log('📋 Inserting listings...');
    for (const listing of listings) {
      const { error } = await supabase
        .from('listings')
        .insert(listing);
      
      if (error) {
        console.error('Error inserting listing:', error);
      }
    }

    // Insert service providers
    console.log('🔧 Inserting service providers...');
    for (const provider of serviceProviders) {
      const { error } = await supabase
        .from('service_providers')
        .insert(provider);
      
      if (error) {
        console.error('Error inserting service provider:', error);
      }
    }

    // Insert services
    console.log('⚡ Inserting services...');
    for (const service of services) {
      const { error } = await supabase
        .from('services')
        .insert(service);
      
      if (error) {
        console.error('Error inserting service:', error);
      }
    }

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
