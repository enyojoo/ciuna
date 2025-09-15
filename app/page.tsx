'use client'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ListingCard } from '@/components/listing-card'
import { 
  Search, 
  MapPin, 
  Star, 
  Shield, 
  TrendingUp,
  Clock,
  Users,
  ShoppingBag,
  Heart,
  MessageCircle,
  Filter,
  Grid3X3,
  List,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {

  // Mock data for featured listings
  const featuredListings = [
    {
      id: 1,
      seller_id: "1",
      title: "MacBook Pro 13-inch M2 Chip - Excellent Condition",
      description: "Excellent condition MacBook Pro with M2 chip. Barely used, comes with original charger and box.",
      category_id: 1,
      price: 120000,
      currency: "RUB" as const,
      condition: "LIKE_NEW" as const,
      city: "Moscow",
      district: "Arbat",
      photo_urls: ["/api/placeholder/400/300"],
      status: "ACTIVE" as const,
      seller: {
        id: "1",
        email: "john.smith@example.com",
        first_name: "John",
        last_name: "Smith",
        role: "USER" as const,
        country_of_origin: "US",
        city: "Moscow",
        district: "Arbat",
        phone: "+7-999-123-4567",
        verified_expat: true,
        verification_status: "APPROVED" as const,
        documents: null,
        avatar_url: null,
        location: "russia" as const,
        base_currency: "RUB" as const,
        currency_preferences: {},
        feature_access: {},
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      seller_id: "2",
      title: "IKEA Dining Table - White, 4 chairs included",
      description: "White IKEA dining table with 4 matching chairs. Perfect for small apartments.",
      category_id: 2,
      price: 25000,
      currency: "RUB" as const,
      condition: "GOOD" as const,
      city: "St. Petersburg",
      district: "Nevsky Prospekt",
      photo_urls: ["/api/placeholder/400/300"],
      status: "ACTIVE" as const,
      seller: {
        id: "2",
        email: "maria.garcia@example.com",
        first_name: "Maria",
        last_name: "Garcia",
        role: "USER" as const,
        country_of_origin: "ES",
        city: "St. Petersburg",
        district: "Nevsky Prospekt",
        phone: "+7-999-234-5678",
        verified_expat: false,
        verification_status: "PENDING" as const,
        documents: null,
        avatar_url: null,
        location: "russia" as const,
        base_currency: "RUB" as const,
        currency_preferences: {},
        feature_access: {},
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      created_at: "2024-01-14T15:45:00Z",
      updated_at: "2024-01-14T15:45:00Z"
    },
    {
      id: 3,
      seller_id: "3",
      title: "Russian Language Books - Complete Set",
      description: "Complete set of Russian language learning books for beginners and intermediate learners.",
      category_id: 3,
      price: 5000,
      currency: "RUB" as const,
      condition: "NEW" as const,
      city: "Moscow",
      district: "Khamovniki",
      photo_urls: ["/api/placeholder/400/300"],
      status: "ACTIVE" as const,
      seller: {
        id: "3",
        email: "alex.johnson@example.com",
        first_name: "Alex",
        last_name: "Johnson",
        role: "USER" as const,
        country_of_origin: "CA",
        city: "Moscow",
        district: "Khamovniki",
        phone: "+7-999-345-6789",
        verified_expat: true,
        verification_status: "APPROVED" as const,
        documents: null,
        avatar_url: null,
        location: "russia" as const,
        base_currency: "RUB" as const,
        currency_preferences: {},
        feature_access: {},
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      created_at: "2024-01-13T09:20:00Z",
      updated_at: "2024-01-13T09:20:00Z"
    },
    {
      id: 4,
      seller_id: "4",
      title: "Winter Coat - Size M, Perfect for Russian Winter",
      description: "Warm winter coat perfect for Russian winters. Size M, excellent condition.",
      category_id: 4,
      price: 8000,
      currency: "RUB" as const,
      condition: "GOOD" as const,
      city: "Moscow",
      district: "Tverskaya",
      photo_urls: ["/api/placeholder/400/300"],
      status: "ACTIVE" as const,
      seller: {
        id: "4",
        email: "sarah.wilson@example.com",
        first_name: "Sarah",
        last_name: "Wilson",
        role: "USER" as const,
        country_of_origin: "GB",
        city: "Moscow",
        district: "Tverskaya",
        phone: "+7-999-456-7890",
        verified_expat: true,
        verification_status: "APPROVED" as const,
        documents: null,
        avatar_url: null,
        location: "russia" as const,
        base_currency: "RUB" as const,
        currency_preferences: {},
        feature_access: {},
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      created_at: "2024-01-12T14:10:00Z",
      updated_at: "2024-01-12T14:10:00Z"
    }
  ]

  const categories = [
    { name: "Electronics", icon: "📱", color: "bg-blue-500", count: "1,234" },
    { name: "Furniture", icon: "🪑", color: "bg-green-500", count: "856" },
    { name: "Clothing", icon: "👕", color: "bg-pink-500", count: "2,109" },
    { name: "Books", icon: "📚", color: "bg-purple-500", count: "743" },
    { name: "Sports", icon: "⚽", color: "bg-orange-500", count: "567" },
    { name: "Automotive", icon: "🚗", color: "bg-gray-500", count: "432" },
    { name: "Home & Garden", icon: "🏠", color: "bg-teal-500", count: "891" },
    { name: "Toys & Games", icon: "🎮", color: "bg-red-500", count: "324" }
  ]

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Listings', value: '50,000+', icon: ShoppingBag },
    { label: 'Cities', value: '50+', icon: MapPin },
    { label: 'Languages', value: '6', icon: MessageCircle }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance mb-6">
              Find Everything You Need
              <span className="block text-primary">In Your Community</span>
            </h1>
            <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto text-balance mb-8">
              The marketplace for expats in Russia. Buy, sell, and discover amazing items from your neighbors.
            </p>
          </div>

          {/* Main Search Bar */}
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="p-2 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for items, brands, or categories..."
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-full sm:w-48 h-12">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name.toLowerCase()}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full sm:w-32 h-12">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moscow">Moscow</SelectItem>
                    <SelectItem value="st-petersburg">St. Petersburg</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="lg" className="h-12 px-8">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="font-semibold text-foreground">{stat.value}</span>
                  <span>{stat.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Listings</h2>
              <p className="text-muted-foreground mt-2">Discover trending items in your community</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/listings">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-muted-foreground">
              Find exactly what you&apos;re looking for
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <Link key={category.name} href={`/listings?category=${category.name.toLowerCase()}`}>
                <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center text-2xl mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <div className="font-semibold text-sm mb-1">{category.name}</div>
                    <div className="text-xs text-muted-foreground">{category.count} items</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Safe & Secure Marketplace
            </h2>
            <p className="text-lg text-muted-foreground">
              Your safety and security are our top priorities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Sellers</h3>
              <p className="text-muted-foreground">
                All sellers are verified expats with proper documentation
              </p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Messaging</h3>
              <p className="text-muted-foreground">
                Communicate safely through our built-in messaging system
              </p>
            </Card>
            
            <Card className="text-center p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Reviews</h3>
              <p className="text-muted-foreground">
                Read reviews from other expats before making purchases
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-lg text-white/90 text-balance mb-8 max-w-2xl mx-auto">
            Join thousands of expats who are already buying, selling, and connecting in their communities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link href="/user/auth/sign-up">
                Start Selling
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              <Link href="/listings">
                Browse Listings
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-sm" />
                <span className="text-2xl font-bold">Ciuna</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                The trusted marketplace for expats in Russia. Buy, sell, and discover amazing items from your community.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Support
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Shield className="h-4 w-4 mr-2" />
                  Safety
                </Button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Marketplace</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/listings" className="hover:text-white transition-colors">Browse Listings</Link></li>
                <li><Link href="/sell/new" className="hover:text-white transition-colors">Sell Items</Link></li>
                <li><Link href="/vendors" className="hover:text-white transition-colors">Vendors</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/safety" className="hover:text-white transition-colors">Safety Guidelines</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">&copy; 2024 Ciuna. All rights reserved.</p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Available in:</span>
                  <div className="flex space-x-1">
                    {['EN', 'RU', 'FR', 'ZH', 'AR', 'ES'].map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}