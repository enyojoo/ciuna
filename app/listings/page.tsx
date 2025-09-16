'use client'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Plus, Grid, List } from 'lucide-react'
import Link from 'next/link'

// Mock data - in real app, this would come from Supabase
const mockListings = [
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
  },
  {
    id: 5,
    seller_id: "5",
    title: "Guitar - Acoustic, Great for Beginners",
    description: "Acoustic guitar perfect for beginners. Comes with case and extra strings.",
    category_id: 5,
    price: 15000,
    currency: "RUB" as const,
    condition: "FAIR" as const,
    city: "St. Petersburg",
    district: "Vasileostrovsky",
    photo_urls: ["/api/placeholder/400/300"],
    status: "ACTIVE" as const,
    seller: {
      id: "5",
      email: "david.brown@example.com",
      first_name: "David",
      last_name: "Brown",
      role: "USER" as const,
      country_of_origin: "AU",
      city: "St. Petersburg",
      district: "Vasileostrovsky",
      phone: "+7-999-567-8901",
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
    created_at: "2024-01-11T11:30:00Z",
    updated_at: "2024-01-11T11:30:00Z"
  },
  {
    id: 6,
    seller_id: "6",
    title: "Kitchen Appliances Set - Microwave, Toaster, Coffee Maker",
    description: "Complete kitchen appliance set including microwave, toaster, and coffee maker.",
    category_id: 6,
    price: 18000,
    currency: "RUB" as const,
    condition: "GOOD" as const,
    city: "Moscow",
    district: "Zamoskvorechye",
    photo_urls: ["/api/placeholder/400/300"],
    status: "ACTIVE" as const,
    seller: {
      id: "6",
      email: "emma.davis@example.com",
      first_name: "Emma",
      last_name: "Davis",
      role: "USER" as const,
      country_of_origin: "NZ",
      city: "Moscow",
      district: "Zamoskvorechye",
      phone: "+7-999-678-9012",
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
    created_at: "2024-01-10T16:45:00Z",
    updated_at: "2024-01-10T16:45:00Z"
  }
]

const categories = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Furniture", slug: "furniture" },
  { id: 3, name: "Clothing", slug: "clothing" },
  { id: 4, name: "Books", slug: "books" },
  { id: 5, name: "Sports", slug: "sports" },
  { id: 6, name: "Automotive", slug: "automotive" },
  { id: 7, name: "Home & Garden", slug: "home-garden" },
  { id: 8, name: "Toys & Games", slug: "toys-games" }
]

export default function ListingsPage() {

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Listings for You</h1>
            <p className="text-muted-foreground mt-2">
              A curated mix of used items from expats and new products from trusted vendors
            </p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link href="/sell/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Link>
          </Button>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Main Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for items, brands, or sellers..."
                  className="pl-12 pr-4 py-3 text-lg border-2 focus:border-primary"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Search
                </Button>
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <Select>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        <div className="flex items-center space-x-2">
                          <span>📱</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Condition Filter */}
                <Select>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All Conditions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">🆕 New</SelectItem>
                    <SelectItem value="like_new">✨ Like New</SelectItem>
                    <SelectItem value="good">👍 Good</SelectItem>
                    <SelectItem value="fair">⚠️ Fair</SelectItem>
                  </SelectContent>
                </Select>

                {/* Price Range */}
                <Select>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Price</SelectItem>
                    <SelectItem value="under-10000">Under 10,000₽</SelectItem>
                    <SelectItem value="10000-50000">10,000₽ - 50,000₽</SelectItem>
                    <SelectItem value="50000-100000">50,000₽ - 100,000₽</SelectItem>
                    <SelectItem value="over-100000">Over 100,000₽</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">🕒 Newest First</SelectItem>
                    <SelectItem value="price_low">💰 Price: Low to High</SelectItem>
                    <SelectItem value="price_high">💎 Price: High to Low</SelectItem>
                    <SelectItem value="distance">📍 Distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  Electronics ×
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  Moscow ×
                </Badge>
                <Badge variant="secondary" className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors">
                  Under 50,000₽ ×
                </Badge>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Clear all filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">
              {mockListings.length} listings found
            </span>
            <Badge variant="outline" className="text-sm">
              in Moscow
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" className="h-9">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-9">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {mockListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockListings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                item={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  currency: listing.currency,
                  condition: listing.condition,
                  type: 'listing' as const,
                  city: listing.city,
                  district: listing.district,
                  photo_urls: listing.photo_urls,
                  seller: {
                    first_name: listing.seller.first_name,
                    last_name: listing.seller.last_name,
                    verified_expat: listing.seller.verified_expat,
                    country_of_origin: listing.seller.country_of_origin
                  },
                  created_at: listing.created_at
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold mb-3">No listings found</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Try adjusting your search criteria or create a new listing
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/sell/new">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Listing
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Load More */}
        {mockListings.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Listings
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
