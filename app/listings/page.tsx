import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Navigation } from '@/components/navigation'
import { ListingCard } from '@/components/listing-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Filter, Plus, Grid, List } from 'lucide-react'
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

export default async function ListingsPage() {
  const t = await getTranslations('listings')

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground mt-2">
              Discover amazing items from expats in your community
            </p>
          </div>
          <Button asChild className="mt-4 sm:mt-0">
            <Link href="/sell/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('create_listing')}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('search_placeholder')}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter_by_category')} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Condition Filter */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('filter_by_condition')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('sort_by')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('sort_newest')}</SelectItem>
                  <SelectItem value="oldest">{t('sort_oldest')}</SelectItem>
                  <SelectItem value="price_low">{t('sort_price_low')}</SelectItem>
                  <SelectItem value="price_high">{t('sort_price_high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="cursor-pointer">
                Electronics ×
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Moscow ×
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Under 50,000₽ ×
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {mockListings.length} listings found
            </span>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {mockListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">{t('no_listings')}</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or create a new listing
            </p>
            <Button asChild>
              <Link href="/sell/new">
                <Plus className="h-4 w-4 mr-2" />
                {t('create_listing')}
              </Link>
            </Button>
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
