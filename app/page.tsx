'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  MessageCircle, 
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  Globe,
  Users,
  ShoppingBag,
  Wrench,
  Filter,
  Grid3X3,
  List,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { UnifiedListingCard } from '@/components/unified-listing-card'

export default function HomePage() {

  // Unified listings data - mixing both ads and products
  const unifiedListings: Array<{
    id: number
    title: string
    price: number
    currency: string
    condition: string
    type: 'listing' | 'product'
    // For listings
    city?: string
    district?: string
    photo_urls?: string[]
    seller?: {
      first_name: string
      last_name: string
      verified_expat: boolean
      country_of_origin: string
    }
    created_at?: string
    // For products
    image?: string
    vendor?: {
      name: string
      verified: boolean
      rating: number
      city: string
    }
    category?: string
    inStock?: boolean
  }> = [
    // Used items (ads)
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
      type: "listing"
    },
    // New product from vendor
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
      type: "product"
    },
    // Used item (ad)
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
      type: "listing"
    },
    // New product from vendor
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
      type: "product"
    },
    // Used item (ad)
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
      type: "listing"
    },
    // New product from vendor
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
      type: "product"
    },
    // Used item (ad)
    {
      id: 7,
      title: "Winter Coat - Size M",
      price: 8000,
      currency: "RUB",
      condition: "GOOD",
      city: "Moscow",
      district: "Tverskaya",
      photo_urls: ["/api/placeholder/300/200"],
      seller: {
        first_name: "Sarah",
        last_name: "Wilson",
        verified_expat: true,
        country_of_origin: "GB"
      },
      created_at: "2024-01-12T14:10:00Z",
      type: "listing"
    },
    // New product from vendor
    {
      id: 8,
      title: "Designer Winter Coat - Size M",
      price: 18000,
      currency: "RUB",
      condition: "NEW",
      image: "/api/placeholder/300/200",
      vendor: {
        name: "Fashion Forward",
        verified: true,
        rating: 4.7,
        city: "Moscow"
      },
      category: "Clothing",
      inStock: true,
      type: "product"
    },
    // Used item (ad)
    {
      id: 9,
      title: "Gaming Chair - Black",
      price: 15000,
      currency: "RUB",
      condition: "EXCELLENT",
      city: "Moscow",
      district: "Zamoskvorechye",
      photo_urls: ["/api/placeholder/300/200"],
      seller: {
        first_name: "Tom",
        last_name: "Wilson",
        verified_expat: true,
        country_of_origin: "Canada"
      },
      created_at: "2024-01-11T11:30:00Z",
      type: "listing"
    },
    // New product from vendor
    {
      id: 10,
      title: "Russian Language Learning Set",
      price: 3500,
      currency: "RUB",
      condition: "NEW",
      image: "/api/placeholder/300/200",
      vendor: {
        name: "International Books & Media",
        verified: false,
        rating: 4.9,
        city: "St. Petersburg"
      },
      category: "Books",
      inStock: true,
      type: "product"
    },
    // Used item (ad)
    {
      id: 11,
      title: "Samsung Galaxy S23 - 128GB",
      price: 45000,
      currency: "RUB",
      condition: "LIKE_NEW",
      city: "Moscow",
      district: "Presnensky",
      photo_urls: ["/api/placeholder/300/200"],
      seller: {
        first_name: "Sarah",
        last_name: "Brown",
        verified_expat: true,
        country_of_origin: "Australia"
      },
      created_at: "2024-01-10T14:15:00Z",
      type: "listing"
    },
    // New product from vendor
    {
      id: 12,
      title: "Samsung Galaxy S24 Ultra",
      price: 95000,
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
      inStock: false,
      type: "product"
    }
  ]


  // Featured services mock data
  const featuredServices = [
    {
      id: 1,
      title: "Immigration Consultation",
      description: "Professional help with visa extensions, work permits, and residency issues.",
      category: "LEGAL",
      price: 5000,
      duration: "60 min",
      provider: {
        name: "Sarah Wilson Legal Services",
        verified: true,
        rating: 4.9,
        reviews: 47,
        city: "Moscow"
      }
    },
    {
      id: 2,
      title: "Russian Language Tutoring",
      description: "One-on-one Russian language lessons tailored for expats. All levels welcome.",
      category: "PERSONAL",
      price: 2500,
      duration: "60 min",
      provider: {
        name: "Elena Petrov Language School",
        verified: true,
        rating: 4.8,
        reviews: 89,
        city: "St. Petersburg"
      }
    },
    {
      id: 3,
      title: "Financial Planning Session",
      description: "Personal financial planning for expats in Russia. Help with banking and investments.",
      category: "FINANCIAL",
      price: 4000,
      duration: "90 min",
      provider: {
        name: "Michael Brown Financial Consulting",
        verified: true,
        rating: 4.7,
        reviews: 32,
        city: "Moscow"
      }
    },
    {
      id: 4,
      title: "Event Planning & Coordination",
      description: "Full-service event planning for expat community events and parties.",
      category: "EVENT",
      price: 15000,
      duration: "120 min",
      provider: {
        name: "Expat Events Moscow",
        verified: true,
        rating: 4.6,
        reviews: 23,
        city: "Moscow"
      }
    }
  ]



  const stats = [
    { label: 'Active Expats', value: '12,500+', icon: Users },
    { label: 'Live Listings', value: '8,900+', icon: ShoppingBag },
    { label: 'Cities', value: '15+', icon: MapPin },
    { label: 'Languages', value: '6', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance mb-6">
              Your <span className="text-primary">Expat Marketplace</span> in Russia
            </h1>
            <p className="text-xl leading-8 text-muted-foreground max-w-3xl mx-auto text-balance mb-8">
              Buy, sell, and discover amazing items from fellow expats. Connect with trusted vendors and find the services you need.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for items, services, or vendors..."
                  className="pl-12 pr-4 py-6 text-lg border-2 focus:border-primary"
                />
                <Button size="lg" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  Search
              </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Icon className="h-6 w-6 text-primary mr-2" />
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Listings for You Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                Listings for You
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-balance">
                A curated mix of used items from expats and new products from trusted vendors
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/listings">
                View All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {/* First Row - 6 items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
            {unifiedListings.slice(0, 6).map((item) => (
              <UnifiedListingCard key={item.id} item={item} />
            ))}
          </div>

          {/* Second Row - 6 items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {unifiedListings.slice(6, 12).map((item) => (
              <UnifiedListingCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>


      {/* Featured Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                Featured Services
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
                Professional services from trusted providers in your expat community
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/services">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Service Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                          {service.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                      {service.provider.verified && (
                        <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>

                    {/* Provider Info */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {service.provider.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{service.provider.name}</p>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-muted-foreground">
                              {service.provider.rating} ({service.provider.reviews})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{service.provider.city}</span>
                      </div>
                    </div>

                    {/* Price and Duration */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <div className="text-xl font-bold text-primary">
                          {service.price.toLocaleString()}₽
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {service.duration}
                        </div>
                      </div>
                      <Button size="sm" className="h-8">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-background to-secondary/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            Join the Expat Community
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Connect with fellow expats, buy and sell items, and find the services you need in Russia
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/user/auth/sign-up">
                Start Selling
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/listings">
                Browse Listings
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/services">
                Find Services
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}