'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Grid, 
  List,
  Heart,
  Shield
} from 'lucide-react'
import Image from 'next/image'
import { ListingCard } from '@/components/listing-card'

// Mock data - in real app, this would come from Supabase
const mockServices = [
  {
    id: 1,
    title: 'Immigration Consultation',
    price: 5000,
    currency: 'RUB',
    condition: 'NEW',
    city: 'Moscow',
    category: 'legal',
    photo_urls: ['/api/placeholder/300/200'],
    provider: {
      name: 'Sarah Wilson Legal Services',
      verified: true,
      rating: 4.9,
      city: 'Moscow',
      profile_image: '/api/placeholder/300/200'
    },
    duration: '1 hour',
    created_at: '2024-01-15T10:30:00Z',
    type: 'service' as const
  },
  {
    id: 2,
    title: 'Financial Planning Session',
    price: 4000,
    currency: 'RUB',
    condition: 'NEW',
    city: 'Moscow',
    category: 'business',
    photo_urls: ['/api/placeholder/300/200'],
    provider: {
      name: 'Michael Brown Financial Consulting',
      verified: true,
      rating: 4.7,
      city: 'Moscow',
      profile_image: '/api/placeholder/300/200'
    },
    duration: '1.5 hours',
    created_at: '2024-01-14T15:45:00Z',
    type: 'service' as const
  },
  {
    id: 3,
    title: 'Russian Language Tutoring',
    price: 2500,
    currency: 'RUB',
    condition: 'NEW',
    city: 'St. Petersburg',
    category: 'language',
    photo_urls: ['/api/placeholder/300/200'],
    provider: {
      name: 'Elena Petrov Language School',
      verified: false,
      rating: 4.8,
      city: 'St. Petersburg',
      profile_image: '/api/placeholder/300/200'
    },
    duration: '1 hour',
    created_at: '2024-01-13T09:20:00Z',
    type: 'service' as const
  },
  {
    id: 4,
    title: 'Event Planning & Coordination',
    price: 15000,
    currency: 'RUB',
    condition: 'NEW',
    city: 'Moscow',
    category: 'business',
    photo_urls: ['/api/placeholder/300/200'],
    provider: {
      name: 'Expat Events Moscow',
      verified: true,
      rating: 4.6,
      city: 'Moscow',
      profile_image: '/api/placeholder/300/200'
    },
    duration: '2 hours',
    created_at: '2024-01-12T14:30:00Z',
    type: 'service' as const
  },
  {
    id: 5,
    title: 'Health Check-up & Consultation',
    price: 8000,
    currency: 'RUB',
    condition: 'NEW',
    city: 'Moscow',
    category: 'business',
    photo_urls: ['/api/placeholder/300/200'],
    provider: {
      name: 'International Medical Center',
      verified: true,
      rating: 4.9,
      city: 'Moscow',
      profile_image: '/api/placeholder/300/200'
    },
    duration: '45 minutes',
    created_at: '2024-01-11T11:15:00Z',
    type: 'service' as const
  },
  {
    id: 6,
    title: 'Home Cleaning Service',
    price: 3000,
    currency: 'RUB',
    condition: 'NEW',
    city: 'Moscow',
    category: 'home',
    photo_urls: ['/api/placeholder/300/200'],
    provider: {
      name: 'Clean Home Services',
      verified: true,
      rating: 4.5,
      city: 'Moscow',
      profile_image: '/api/placeholder/300/200'
    },
    duration: '2 hours',
    created_at: '2024-01-10T16:00:00Z',
    type: 'service' as const
  }
]

const categories = [
  { value: 'LEGAL', label: 'Legal Services' },
  { value: 'FINANCIAL', label: 'Financial Services' },
  { value: 'PERSONAL', label: 'Personal Services' },
  { value: 'EVENT', label: 'Event Planning' },
  { value: 'HEALTHCARE', label: 'Healthcare' },
  { value: 'CLEANING', label: 'Cleaning Services' }
]

export default function ServicesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

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

  // Filter services based on selected filters
  const filteredServices = mockServices.filter(service => {
    // Category filter
    if (selectedCategory !== 'all' && service.category !== selectedCategory) {
      return false
    }
    
    // Price filter
    if (minPrice && service.price < parseInt(minPrice)) {
      return false
    }
    if (maxPrice && service.price > parseInt(maxPrice)) {
      return false
    }
    
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Professional Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find trusted service providers for all your expat needs in Russia
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
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
                        <label className="text-xs text-muted-foreground mb-1 block">Min Price</label>
                        <Input
                          type="number"
                          placeholder="From"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Max Price</label>
                        <Input
                          type="number"
                          placeholder="To"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        setSelectedCategory('all')
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
                  placeholder="Search services..."
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
                    <SelectItem value="rating">Highest Rated</SelectItem>
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
                  Showing {mockServices.length} services
                </p>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredServices.map((service) => (
                    <ListingCard 
                      key={service.id} 
                      item={service} 
                      onFavorite={handleFavorite}
                      isFavorite={favorites.has(service.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredServices.map((service) => (
                    <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-6">
                        <div className="flex space-x-6">
                          {/* Image */}
                          <div className="relative w-32 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                            <Image
                              src={service.photo_urls?.[0] || '/api/placeholder/300/200'}
                              alt={service.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Date and Location */}
                            <div className="flex items-center space-x-1 mb-2">
                              <span className="text-xs text-muted-foreground">
                                {service.created_at ? new Date(service.created_at).toLocaleDateString() : ''}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {service.city}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {service.title}
                            </h3>

                            {/* Price */}
                            <div className="text-xl font-bold text-primary mb-3">
                              <span className="text-sm font-normal text-black">From </span>{service.price.toLocaleString()}₽
                            </div>

                            {/* Provider Info */}
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
                                {service.provider?.profile_image ? (
                                  <Image
                                    src={service.provider.profile_image}
                                    alt={service.provider.name}
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Image
                                    src="/placeholder-user.jpg"
                                    alt="Provider placeholder"
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <span className="text-sm font-medium truncate">
                                {service.provider?.name}
                              </span>
                              {service.provider?.verified && (
                                <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Right Side - Favorite, Action Button */}
                          <div className="flex flex-col items-end space-y-3">
                            {/* Favorite Icon */}
                            <div
                              className="h-6 w-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-200"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleFavorite(service.id)
                              }}
                            >
                              <Heart className={`h-5 w-5 transition-all duration-200 ${favorites.has(service.id) ? 'fill-primary text-primary' : 'text-gray-500 hover:text-primary'}`} />
                            </div>

                            {/* Action Button */}
                            <Button size="sm">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
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
