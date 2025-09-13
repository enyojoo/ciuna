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
console.log('  - Sample locations (Moscow, St. Petersburg, etc.)');
console.log('  - Sample listings (iPhone, MacBook, etc.)');
console.log('  - Sample vendors and products');
console.log('  - Sample services');
console.log('  - Sample exchange rates');
console.log('  - Sample search suggestions');
console.log('  - Sample business goals and notifications');

console.log('\n✅ Seed script ready!');
console.log('💡 To apply this data, run the seed.sql file in your Supabase SQL editor');
console.log('🔗 Or use: supabase db reset (this will apply all migrations and seed data)');

// In a real implementation, you would connect to Supabase and execute the SQL
// For now, we'll just show what would be executed
console.log('\n📋 To execute this seed data:');
console.log('1. Go to your Supabase dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the contents of seed.sql');
console.log('4. Click "Run" to execute the seed data');
