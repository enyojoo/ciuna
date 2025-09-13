# 🚀 Ciuna Deployment Guide

This guide will help you deploy the Ciuna platform for testing.

## 📋 Prerequisites

1. **GitHub Account** - For code repository
2. **Vercel Account** - For web app deployment
3. **Supabase Account** - For database and backend services
4. **Expo Account** - For mobile app development (optional)

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `ciuna-platform`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

### 1.2 Run Database Migrations
1. Go to your Supabase dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of each migration file in order:
   - `packages/db/migrations/20241201000001_initial_schema.sql`
   - `packages/db/migrations/20241201000002_user_profiles.sql`
   - `packages/db/migrations/20241201000003_categories_locations.sql`
   - `packages/db/migrations/20241201000004_listings.sql`
   - `packages/db/migrations/20241201000005_conversations.sql`
   - `packages/db/migrations/20241201000006_orders_payments.sql`
   - `packages/db/migrations/20241201000007_reviews.sql`
   - `packages/db/migrations/20241201000008_logistics.sql`
   - `packages/db/migrations/20241201000009_vendors_products.sql`
   - `packages/db/migrations/20241201000010_group_buying.sql`
   - `packages/db/migrations/20241201000011_services.sql`
   - `packages/db/migrations/20241201000012_enhanced_security.sql`
   - `packages/db/migrations/20241201000013_payment_integration.sql`
   - `packages/db/migrations/20241201000014_advanced_search.sql`
   - `packages/db/migrations/20241201000015_business_features.sql`

### 1.3 Seed Database
1. In Supabase SQL Editor, run the seed data:
   - Copy contents of `packages/db/seed.sql`
   - Paste and execute in SQL Editor

### 1.4 Configure Storage
1. Go to "Storage" in Supabase dashboard
2. Create buckets:
   - `listings` (public)
   - `profiles` (public)
   - `products` (public)
   - `services` (public)
   - `documents` (private)

### 1.5 Get API Keys
1. Go to "Settings" → "API"
2. Copy:
   - Project URL
   - Anon public key
   - Service role key (keep secret)

## 🌐 Step 2: Web App Deployment (Vercel)

### 2.1 Push to GitHub
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Complete Ciuna platform"

# Create GitHub repository
# Go to github.com and create new repository named "ciuna"

# Push to GitHub
git remote add origin https://github.com/yourusername/ciuna.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `apps/web`
   - Build Command: `cd ../.. && pnpm build --filter=web`
   - Output Directory: `.next`
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `NEXT_PUBLIC_APP_URL`: `https://ciuna.vercel.app`
   - `NEXT_PUBLIC_APP_NAME`: `Ciuna`
6. Click "Deploy"

### 2.3 Test Web App
1. Visit your Vercel deployment URL
2. Test key features:
   - User registration/login
   - Browse listings
   - Search functionality
   - User dashboard
   - Settings pages

## 📱 Step 3: Mobile App Setup (Expo)

### 3.1 Install Expo CLI
```bash
npm install -g @expo/cli
```

### 3.2 Configure Mobile App
```bash
cd apps/mobile

# Install dependencies
pnpm install

# Create environment file
cp env.example .env

# Edit .env with your Supabase credentials
```

### 3.3 Test Mobile App
```bash
# Start Expo development server
npx expo start

# Scan QR code with Expo Go app on your phone
# Or run on simulator:
# npx expo run:ios
# npx expo run:android
```

## 🔧 Step 4: Environment Configuration

### 4.1 Web App (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://ciuna.vercel.app
NEXT_PUBLIC_APP_NAME=Ciuna
```

### 4.2 Mobile App (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_APP_NAME=Ciuna
EXPO_PUBLIC_APP_URL=https://ciuna.vercel.app
```

## 🧪 Step 5: Testing Checklist

### 5.1 Web App Testing
- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Browse listings page
- [ ] Search functionality
- [ ] User dashboard
- [ ] Settings pages
- [ ] Payment pages (mock)
- [ ] Business dashboard
- [ ] Admin pages

### 5.2 Mobile App Testing
- [ ] App launches successfully
- [ ] User authentication
- [ ] Camera functionality
- [ ] Location services
- [ ] Push notifications
- [ ] Navigation between screens
- [ ] Search and filters

### 5.3 Database Testing
- [ ] Sample data loads correctly
- [ ] User profiles work
- [ ] Listings display properly
- [ ] Search returns results
- [ ] Categories and locations work
- [ ] Business features function

## 🚨 Troubleshooting

### Common Issues

#### Vercel Build Fails
- Check that all dependencies are installed
- Verify TypeScript compilation
- Check environment variables

#### Supabase Connection Issues
- Verify API keys are correct
- Check RLS policies
- Ensure migrations are applied

#### Mobile App Issues
- Clear Expo cache: `npx expo start -c`
- Check environment variables
- Verify device permissions

### Getting Help
1. Check the console for error messages
2. Review Supabase logs
3. Check Vercel deployment logs
4. Create GitHub issues for bugs

## 🎉 Success!

Once deployed, you should have:
- ✅ Web app accessible via Vercel URL
- ✅ Mobile app running on Expo
- ✅ Database with sample data
- ✅ All core features working
- ✅ Ready for live integrations

## 🔄 Next Steps

After successful testing:
1. Set up live payment integrations
2. Configure real notification services
3. Add Google Maps integration
4. Set up analytics tracking
5. Deploy to production domains
6. Submit mobile apps to stores

---

**Happy Testing! 🚀**
