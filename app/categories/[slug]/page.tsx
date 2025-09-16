'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  Grid, 
  List, 
  Heart,
  ChevronRight,
  ArrowLeft,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ListingCard } from '@/components/listing-card'

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
      country_of_origin: "US",
      profile_image: "/api/placeholder/300/200"
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
      city: "Moscow",
      profile_image: "/api/placeholder/300/200"
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
      country_of_origin: "ES",
      profile_image: "/api/placeholder/300/200"
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
      country_of_origin: "CA",
      profile_image: "/api/placeholder/300/200"
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
      city: "Moscow",
      profile_image: "/api/placeholder/300/200"
    },
    category: "Furniture",
    inStock: true,
    type: "product" as const
  },
  {
    id: 7,
    title: "Senior Software Engineer",
    price: 0,
    currency: "RUB",
    condition: "NEW",
    city: "Moscow",
    company: "TechCorp Russia",
    company_logo: "/api/placeholder/300/200",
    employment_type: "Full-time",
    created_at: "2024-01-12T14:30:00Z",
    type: "job" as const
  },
  {
    id: 8,
    title: "Russian Language Tutoring",
    price: 2000,
    currency: "RUB",
    condition: "NEW",
    city: "Moscow",
    provider: {
      name: "Maria Petrov",
      verified: true,
      rating: 4.9,
      city: "Moscow",
      profile_image: "/api/placeholder/300/200"
    },
    duration: "1 hour",
    created_at: "2024-01-11T09:15:00Z",
    type: "service" as const
  }
]

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filterNew, setFilterNew] = useState(false)
  const [filterUsed, setFilterUsed] = useState(false)
  const [slug, setSlug] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  useEffect(() => {
    const getSlug = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
      setIsLoading(false)
    }
    getSlug()
  }, [params])

  const handleFavorite = (itemId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId)
      } else {
        newFavorites.add(itemId)
      }
      return newFavorites
    })
  }

  // Find the category by slug
  const category = categories.find(cat => cat.slug === slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading category...</p>
          </div>
        </div>
      </div>
    )
  }
  
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
                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Price Range</label>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Min Price (₽)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Max Price (₽)</label>
                        <Input
                          type="number"
                          placeholder="No limit"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Condition Filters */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Condition</label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-new"
                          checked={filterNew}
                          onCheckedChange={(checked) => setFilterNew(checked as boolean)}
                        />
                        <label
                          htmlFor="filter-new"
                          className="text-sm text-foreground cursor-pointer"
                        >
                          New
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-used"
                          checked={filterUsed}
                          onCheckedChange={(checked) => setFilterUsed(checked as boolean)}
                        />
                        <label
                          htmlFor="filter-used"
                          className="text-sm text-foreground cursor-pointer"
                        >
                          Used
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setMinPrice('')
                        setMaxPrice('')
                        setFilterNew(false)
                        setFilterUsed(false)
                      }}
                    >
                      Clear Filters
                    </Button>
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
                    <ListingCard 
                      key={item.id} 
                      item={item} 
                      onFavorite={handleFavorite}
                      isFavorite={favorites.has(item.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {mockListings.map((item) => {
                    const isListing = item.type === 'listing'
                    const isProduct = item.type === 'product'
                    const isJob = item.type === 'job'
                    const isService = item.type === 'service'
                    const imageUrl = isListing || isJob || isService ? item.photo_urls?.[0] : item.image
                    const imageAlt = item.title
                    
                    return (
                      <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-6">
                          <div className="flex space-x-6">
                            {/* Image */}
                            <div className="relative w-32 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                              <Image
                                src={imageUrl || '/api/placeholder/300/200'}
                                alt={imageAlt}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {/* Date and Location */}
                              <div className="flex items-center space-x-1 mb-2">
                                <span className="text-xs text-muted-foreground">
                                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">
                                  {item.city}
                                </span>
                              </div>

                              {/* Title */}
                              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {item.title}
                              </h3>

                              {/* Price */}
                              <div className="text-xl font-bold text-primary mb-3">
                                {isService ? <span className="text-sm font-normal text-black">From </span> : ''}{item.price.toLocaleString()}₽
                              </div>

                              {/* Seller/Vendor/Provider Info */}
                              <div className="flex items-center space-x-2 mb-4">
                                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
                                  {isProduct && item.vendor?.profile_image ? (
                                    <Image
                                      src={item.vendor.profile_image}
                                      alt={item.vendor.name}
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : isService && item.provider?.profile_image ? (
                                    <Image
                                      src={item.provider.profile_image}
                                      alt={item.provider.name}
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : isJob && item.company_logo ? (
                                    <Image
                                      src={item.company_logo}
                                      alt={item.company || 'Company'}
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : isListing && item.seller?.profile_image ? (
                                    <Image
                                      src={item.seller.profile_image}
                                      alt={`${item.seller.first_name} ${item.seller.last_name}`}
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Image
                                      src="/placeholder-user.jpg"
                                      alt="User placeholder"
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                                <span className="text-sm font-medium truncate">
                                  {isProduct ? item.vendor?.name :
                                   isService ? item.provider?.name :
                                   isJob ? item.company :
                                   `${item.seller?.first_name} ${item.seller?.last_name}`}
                                </span>
                                {(isProduct && item.vendor?.verified) || 
                                 (isService && item.provider?.verified) || 
                                 (isListing && item.seller?.verified_expat) ? (
                                  <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
                                ) : null}
                              </div>
                            </div>

                            {/* Right Side - Badge, Favorite, Action Button */}
                            <div className="flex flex-col items-end space-y-3">
                              {/* Type Badge - Hide for services */}
                              {!isService && (
                                <Badge 
                                  className="text-xs bg-primary text-primary-foreground border-primary"
                                >
                                  {isProduct ? 'New' : isJob ? 'Job' : 'Used'}
                                </Badge>
                              )}

                              {/* Favorite Icon */}
                              <div
                                className="h-6 w-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleFavorite(item.id)
                                }}
                              >
                                <Heart className={`h-5 w-5 transition-all duration-200 ${favorites.has(item.id) ? 'fill-primary text-primary' : 'text-gray-500 hover:text-primary'}`} />
                              </div>

                              {/* Action Button */}
                              <Button 
                                size="sm" 
                                disabled={isProduct && !item.inStock}
                              >
                                {isProduct ? (item.inStock ? 'Add to Cart' : 'Out of Stock') : 
                                 isJob ? 'Apply Now' : 
                                 isService ? 'Book Now' : 
                                 'Contact Seller'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
