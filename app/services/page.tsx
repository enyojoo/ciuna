'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  Shield, 
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { getInitials, formatPrice, getServiceCategoryLabel } from '@/lib/utils'

// Mock data - in real app, this would come from Supabase
const mockServices = [
  {
    id: 1,
    title: 'Immigration Consultation',
    description: 'Professional help with visa extensions, work permits, and residency issues. Experienced lawyer specializing in expat legal matters.',
    category: 'LEGAL' as const,
    price: 5000,
    duration_minutes: 60,
    status: 'ACTIVE' as const,
    provider: {
      id: 1,
      name: 'Sarah Wilson Legal Services',
      verified: true,
      profile: {
        first_name: 'Sarah',
        last_name: 'Wilson',
        verified_expat: true,
        city: 'Moscow'
      }
    },
    rating: 4.9,
    review_count: 47
  },
  {
    id: 2,
    title: 'Financial Planning Session',
    description: 'Personal financial planning for expats in Russia. Help with banking, investments, and tax optimization.',
    category: 'FINANCIAL' as const,
    price: 4000,
    duration_minutes: 90,
    status: 'ACTIVE' as const,
    provider: {
      id: 2,
      name: 'Michael Brown Financial Consulting',
      verified: true,
      profile: {
        first_name: 'Michael',
        last_name: 'Brown',
        verified_expat: true,
        city: 'Moscow'
      }
    },
    rating: 4.7,
    review_count: 32
  },
  {
    id: 3,
    title: 'Russian Language Tutoring',
    description: 'One-on-one Russian language lessons tailored for expats. All levels welcome.',
    category: 'PERSONAL' as const,
    price: 2500,
    duration_minutes: 60,
    status: 'ACTIVE' as const,
    provider: {
      id: 3,
      name: 'Elena Petrov Language School',
      verified: false,
      profile: {
        first_name: 'Elena',
        last_name: 'Petrov',
        verified_expat: false,
        city: 'St. Petersburg'
      }
    },
    rating: 4.8,
    review_count: 89
  },
  {
    id: 4,
    title: 'Event Planning & Coordination',
    description: 'Full-service event planning for expat community events, parties, and corporate functions.',
    category: 'EVENT' as const,
    price: 15000,
    duration_minutes: 120,
    status: 'ACTIVE' as const,
    provider: {
      id: 4,
      name: 'Expat Events Moscow',
      verified: true,
      profile: {
        first_name: 'Anna',
        last_name: 'Kozlova',
        verified_expat: true,
        city: 'Moscow'
      }
    },
    rating: 4.6,
    review_count: 23
  },
  {
    id: 5,
    title: 'Health Check-up & Consultation',
    description: 'Comprehensive health check-up with English-speaking doctor. Perfect for expats.',
    category: 'HEALTHCARE' as const,
    price: 8000,
    duration_minutes: 45,
    status: 'ACTIVE' as const,
    provider: {
      id: 5,
      name: 'International Medical Center',
      verified: true,
      profile: {
        first_name: 'Dr. Maria',
        last_name: 'Volkova',
        verified_expat: false,
        city: 'Moscow'
      }
    },
    rating: 4.9,
    review_count: 156
  }
]

const categories = [
  { value: 'LEGAL', label: 'Legal Services' },
  { value: 'FINANCIAL', label: 'Financial Services' },
  { value: 'PERSONAL', label: 'Personal Services' },
  { value: 'EVENT', label: 'Event Planning' },
  { value: 'HEALTHCARE', label: 'Healthcare' }
]

export default function ServicesPage() {

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-2">
            Find professional services from verified providers in your community
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under-5000">Under 5,000₽</SelectItem>
                  <SelectItem value="5000-10000">5,000₽ - 10,000₽</SelectItem>
                  <SelectItem value="over-10000">Over 10,000₽</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="duration">Shortest Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Services */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Featured Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockServices.slice(0, 3).map((service) => (
              <Card key={service.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`/api/placeholder/100/100`} />
                        <AvatarFallback>
                          {getInitials(service.provider.profile.first_name, service.provider.profile.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getServiceCategoryLabel(service.category)}
                          </Badge>
                          {service.provider.verified && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(service.price)}
                      </span>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{service.provider.profile.city}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                      <span className="font-medium">{service.rating}</span>
                      <span className="text-muted-foreground ml-1">({service.review_count} reviews)</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button asChild className="flex-1">
                      <Link href={`/services/${service.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Services */}
        <div>
          <h2 className="text-2xl font-bold mb-4">All Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockServices.map((service) => (
              <Card key={service.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`/api/placeholder/100/100`} />
                        <AvatarFallback>
                          {getInitials(service.provider.profile.first_name, service.provider.profile.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{service.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getServiceCategoryLabel(service.category)}
                          </Badge>
                          {service.provider.verified && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(service.price)}
                      </span>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-2" />
                      <span>{service.provider.profile.city}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                      <span className="font-medium text-sm">{service.rating}</span>
                      <span className="text-muted-foreground ml-1 text-xs">({service.review_count})</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/services/${service.id}`}>
                        Book Service
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Services
          </Button>
        </div>
      </div>
    </div>
  )
}
