'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  Grid, 
  List, 
  Heart,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { UnifiedListingCard } from '@/components/unified-listing-card'

// Category data - in real app, this would come from Supabase
const categories = [
  {
    id: 1,
    name: 'Transport',
    slug: 'transport',
    icon: 'Car',
    color: 'text-blue-600',
    description: 'Cars, motorcycles, trucks, and transportation-related items',
    subcategories: [
      { name: 'Cars', slug: 'cars', count: 1247 },
      { name: 'Motorcycles', slug: 'motorcycles', count: 342 },
      { name: 'Trucks', slug: 'trucks', count: 89 },
      { name: 'Spare Parts', slug: 'spare-parts', count: 156 },
      { name: 'Water Transport', slug: 'water-transport', count: 23 },
    ]
  },
  {
    id: 2,
    name: 'Real Estate',
    slug: 'real-estate',
    icon: 'Home',
    color: 'text-green-600',
    description: 'Apartments, houses, commercial properties, and land',
    subcategories: [
      { name: 'Apartments', slug: 'apartments', count: 892 },
      { name: 'Houses', slug: 'houses', count: 234 },
      { name: 'Commercial', slug: 'commercial', count: 156 },
      { name: 'Land', slug: 'land', count: 78 },
    ]
  },
  {
    id: 3,
    name: 'Jobs',
    slug: 'jobs',
    icon: 'Briefcase',
    color: 'text-purple-600',
    description: 'Employment opportunities across various industries',
    subcategories: [
      { name: 'IT & Tech', slug: 'it-tech', count: 456 },
      { name: 'Finance', slug: 'finance', count: 234 },
      { name: 'Marketing', slug: 'marketing', count: 189 },
      { name: 'Education', slug: 'education', count: 123 },
    ]
  },
  {
    id: 4,
    name: 'Services',
    slug: 'services',
    icon: 'Wrench',
    color: 'text-orange-600',
    description: 'Professional services for the expat community',
    subcategories: [
      { name: 'Legal Services', slug: 'legal', count: 89 },
      { name: 'Language Tutoring', slug: 'language', count: 156 },
      { name: 'Home Services', slug: 'home', count: 234 },
      { name: 'Business Services', slug: 'business', count: 67 },
    ]
  },
  {
    id: 5,
    name: 'Personal Items',
    slug: 'personal-items',
    icon: 'Shirt',
    color: 'text-pink-600',
    description: 'Clothing, accessories, and personal belongings',
    subcategories: [
      { name: 'Clothing', slug: 'clothing', count: 1234 },
      { name: 'Shoes', slug: 'shoes', count: 567 },
      { name: 'Accessories', slug: 'accessories', count: 345 },
      { name: 'Jewelry', slug: 'jewelry', count: 123 },
    ]
  },
  {
    id: 6,
    name: 'Home & Garden',
    slug: 'home-garden',
    icon: 'Sofa',
    color: 'text-green-600',
    description: 'Furniture, appliances, and home improvement items',
    subcategories: [
      { name: 'Furniture', slug: 'furniture', count: 789 },
      { name: 'Appliances', slug: 'appliances', count: 456 },
      { name: 'Garden Tools', slug: 'garden-tools', count: 123 },
      { name: 'Home Decor', slug: 'home-decor', count: 234 },
    ]
  },
  {
    id: 7,
    name: 'Electronics',
    slug: 'electronics',
    icon: 'Smartphone',
    color: 'text-blue-600',
    description: 'Phones, computers, audio equipment, and gadgets',
    subcategories: [
      { name: 'Phones', slug: 'phones', count: 567 },
      { name: 'Computers', slug: 'computers', count: 345 },
      { name: 'Audio', slug: 'audio', count: 234 },
      { name: 'Cameras', slug: 'cameras', count: 123 },
    ]
  },
  {
    id: 8,
    name: 'Hobbies & Recreation',
    slug: 'hobbies-recreation',
    icon: 'Gamepad2',
    color: 'text-yellow-600',
    description: 'Sports, music, books, and recreational activities',
    subcategories: [
      { name: 'Sports', slug: 'sports', count: 456 },
      { name: 'Music', slug: 'music', count: 234 },
      { name: 'Books', slug: 'books', count: 345 },
      { name: 'Collectibles', slug: 'collectibles', count: 123 },
    ]
  },
  {
    id: 9,
    name: 'Animals',
    slug: 'animals',
    icon: 'Cat',
    color: 'text-orange-600',
    description: 'Pets, pet supplies, and animal-related items',
    subcategories: [
      { name: 'Dogs', slug: 'dogs', count: 234 },
      { name: 'Cats', slug: 'cats', count: 189 },
      { name: 'Birds', slug: 'birds', count: 67 },
      { name: 'Fish', slug: 'fish', count: 45 },
    ]
  }
]

// Mock listings data for the category
const mockListings = [
  {
    id: 1,
    title: "MacBook Pro M2 - Like New",
    price: 120000,
    currency: "RUB",
    condition: "LIKE_NEW",
    city: "Moscow",
    district: "Arbat",
    photo_urls: ["/api/placeholder/300/200"],
    seller: {
      first_name: "John",
      last_name: "Smith",
      verified_expat: true,
      country_of_origin: "US"
    },
    created_at: "2024-01-15T10:30:00Z",
    type: "listing" as const
  },
  {
    id: 2,
    title: "iPhone 15 Pro Max - 256GB",
    price: 120000,
    currency: "RUB",
    condition: "NEW",
    image: "/api/placeholder/300/200",
    vendor: {
      name: "Expat Electronics Store",
      verified: true,
      rating: 4.8,
      city: "Moscow"
    },
    category: "Electronics",
    inStock: true,
    type: "product" as const
  },
  {
    id: 3,
    title: "IKEA Dining Set - White",
    price: 25000,
    currency: "RUB",
    condition: "GOOD",
    city: "St. Petersburg",
    district: "Nevsky Prospekt",
    photo_urls: ["/api/placeholder/300/200"],
    seller: {
      first_name: "Maria",
      last_name: "Garcia",
      verified_expat: true,
      country_of_origin: "ES"
    },
    created_at: "2024-01-14T15:45:00Z",
    type: "listing" as const
  },
  {
    id: 4,
    title: "MacBook Air M2 - 512GB",
    price: 150000,
    currency: "RUB",
    condition: "NEW",
    image: "/api/placeholder/300/200",
    vendor: {
      name: "Expat Electronics Store",
      verified: true,
      rating: 4.8,
      city: "Moscow"
    },
    category: "Electronics",
    inStock: true,
    type: "product" as const
  },
  {
    id: 5,
    title: "Russian Language Books Set",
    price: 5000,
    currency: "RUB",
    condition: "NEW",
    city: "Moscow",
    district: "Khamovniki",
    photo_urls: ["/api/placeholder/300/200"],
    seller: {
      first_name: "Alex",
      last_name: "Johnson",
      verified_expat: true,
      country_of_origin: "CA"
    },
    created_at: "2024-01-13T09:20:00Z",
    type: "listing" as const
  },
  {
    id: 6,
    title: "IKEA HEMNES Dresser - White",
    price: 25000,
    currency: "RUB",
    condition: "NEW",
    image: "/api/placeholder/300/200",
    vendor: {
      name: "Moscow Furniture Hub",
      verified: true,
      rating: 4.6,
      city: "Moscow"
    },
    category: "Furniture",
    inStock: true,
    type: "product" as const
  }
]

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState('all')

  // Find the category by slug
  const category = categories.find(cat => cat.slug === params.slug)
  
  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-8">The category you&apos;re looking for doesn&apos;t exist.</p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4 mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <Link href="/categories" className="text-muted-foreground hover:text-primary transition-colors">
              All Categories
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{category.name}</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">{category.name}</h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                {category.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{mockListings.length} items available</span>
                <span>•</span>
                <span>Updated daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            {/* Subcategories */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Subcategories</h3>
                <div className="space-y-2">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/categories/${category.slug}/${sub.slug}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">{sub.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {sub.count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Filters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Price Range</label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="0-10000">Under 10,000₽</SelectItem>
                        <SelectItem value="10000-50000">10,000₽ - 50,000₽</SelectItem>
                        <SelectItem value="50000-100000">50,000₽ - 100,000₽</SelectItem>
                        <SelectItem value="100000+">Over 100,000₽</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search in ${category.name.toLowerCase()}...`}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {mockListings.length} results
                </p>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {mockListings.map((item) => (
                    <UnifiedListingCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {mockListings.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="flex space-x-4">
                        <div className="w-24 h-24 bg-muted rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                          <p className="text-2xl font-bold text-primary mb-2">
                            {item.price.toLocaleString()}₽
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{item.condition.replace('_', ' ')}</span>
                            {item.type === 'listing' ? (
                              <span>{item.city}, {item.district}</span>
                            ) : (
                              <span>{item.vendor?.name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button size="sm">
                            {item.type === 'listing' ? 'Contact' : 'Add to Cart'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
