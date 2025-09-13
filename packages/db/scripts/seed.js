#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🌱 Seeding Ciuna database...');

// Read the seed SQL file
const seedSqlPath = path.join(__dirname, '..', 'seed.sql');
const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

console.log('📄 Seed SQL file loaded');
console.log('📊 Seed data includes:');
console.log('  - Sample categories and subcategories');
console.log('  - Sample listings (iPhone, MacBook, etc.)');
console.log('  - Sample vendors and service providers');
console.log('  - Sample services');
console.log('  - Sample exchange rates');
console.log('  - Sample search suggestions');

console.log('\n✅ Seed script ready!');
console.log('💡 To apply this data, run the seed.sql file in your Supabase SQL editor');
console.log('🔗 Or use: supabase db reset (this will apply all migrations and seed data)');

// In a real implementation, you would connect to Supabase and execute the SQL
// For now, we'll just show what would be executed
console.log('\n📋 To execute this seed data:');
console.log('1. First, create users in Supabase Auth with specific IDs (see seed.sql comments)');
console.log('2. Run create_profiles.sql to create the corresponding profiles');
console.log('3. Then run seed.sql to create the sample data');
console.log('4. Or use: supabase db reset (applies all migrations and seed data automatically)');
console.log('\n⚠️  Note: The seed data requires specific user IDs to exist first!');
