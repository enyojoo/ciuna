# Ciuna - Expat Marketplace Platform

A next-generation marketplace platform designed for expats living in a foreign country , featuring P2P trading, vendor marketplace, services, and integrated logistics.

## 🚀 Features

### Core Marketplace
- **P2P Listings** - Buy and sell items locally
- **Vendor Marketplace** - Professional sellers with inventory management
- **Services Marketplace** - Verified service providers with booking
- **Group Buying** - Collaborative purchasing for better deals
- **Integrated Logistics** - Local and international shipping

### Platform Features
- **Multi-language Support** - Russian, English, and major international languages
- **Multi-currency** - RUB, USD, EUR, and 30+ currencies
- **Advanced Search** - Full-text search with filters and suggestions
- **Real-time Chat** - In-app messaging system
- **Payment Integration** - YooMoney, Stripe, and cash payments
- **Mobile Apps** - Native iOS and Android applications

### Business Tools
- **Analytics Dashboard** - Comprehensive business insights
- **Inventory Management** - Stock tracking and alerts
- **Subscription Plans** - Flexible pricing for different business needs
- **Reporting** - Custom reports and business intelligence
- **Goal Tracking** - Set and monitor business objectives

### Security & Compliance
- **Two-Factor Authentication** - Enhanced account security
- **KYC Verification** - Identity verification for businesses
- **GDPR Compliance** - Data protection and privacy controls
- **Audit Logging** - Complete activity tracking
- **Rate Limiting** - Protection against abuse

## 🏗️ Architecture

### Monorepo Structure
```
ciuna/
├── apps/
│   ├── web/                 # Next.js 14 web application
│   └── mobile/              # Expo React Native mobile app
├── packages/
│   ├── db/                  # Database migrations and schema
│   ├── sb/                  # Supabase client and services
│   ├── ui/                  # Shared UI components
│   ├── types/               # TypeScript type definitions
│   ├── config/              # Shared configuration
│   └── functions/           # Supabase Edge Functions
```

### Technology Stack
- **Frontend**: Next.js 14, React Native, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Database**: PostgreSQL with Row Level Security
- **Mobile**: Expo with native features
- **Deployment**: Vercel (Web), EAS (Mobile)
- **Monorepo**: Turborepo with pnpm workspaces

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm
- Supabase CLI
- Expo CLI (for mobile development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ciuna.git
cd ciuna
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
cp packages/sb/.env.example packages/sb/.env
```

4. **Configure Supabase**
```bash
# Start Supabase locally
supabase start

# Run migrations
supabase db reset
```

5. **Start development servers**
```bash
# Start web app
pnpm dev:web

# Start mobile app (in another terminal)
pnpm dev:mobile
```

## 📱 Mobile Development

### iOS Development
```bash
cd apps/mobile
npx expo run:ios
```

### Android Development
```bash
cd apps/mobile
npx expo run:android
```

### Expo Go (Quick Testing)
```bash
cd apps/mobile
npx expo start
# Scan QR code with Expo Go app
```

## 🌐 Web Development

### Local Development
```bash
cd apps/web
pnpm dev
# Open http://localhost:3000
```

### Production Build
```bash
cd apps/web
pnpm build
pnpm start
```

## 🗄️ Database

### Running Migrations
```bash
# Apply all migrations
supabase db push

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > packages/types/database.types.ts
```

### Seed Data
```bash
# Run seed script
pnpm db:seed
```

## 🧪 Testing

### Web Testing
```bash
# Unit tests
pnpm test:web

# E2E tests
pnpm test:e2e
```

### Mobile Testing
```bash
# Unit tests
pnpm test:mobile
```

## 🚀 Deployment

### Web Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Mobile Deployment (EAS)
```bash
# Build for production
eas build --platform all

# Submit to app stores
eas submit --platform all
```

## 🔧 Configuration

### Environment Variables

#### Web App (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Mobile App (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Supabase (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Features Overview

### User Features
- User registration and authentication
- Profile management with verification
- Multi-language and currency support
- Advanced search and filtering
- Real-time messaging
- Order management
- Payment processing

### Vendor Features
- Product catalog management
- Inventory tracking
- Order fulfillment
- Analytics dashboard
- Subscription management
- Business reporting

### Admin Features
- User management
- Content moderation
- Analytics and reporting
- System configuration
- Security monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core marketplace functionality
- ✅ User authentication and profiles
- ✅ Basic payment integration
- ✅ Mobile applications

### Phase 2 (Next)
- 🔄 Advanced analytics
- 🔄 AI-powered recommendations
- 🔄 Enhanced mobile features
- 🔄 API marketplace

### Phase 3 (Future)
- 📋 International expansion
- 📋 Blockchain integration
- 📋 Advanced logistics
- 📋 Enterprise features

---

Built with ❤️ for the expat community