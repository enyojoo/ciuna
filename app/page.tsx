'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Star, 
  ArrowRight,
  Shield,
  Car,
  Home,
  Briefcase,
  Paintbrush,
  Shirt,
  Sofa,
  Smartphone,
  Gamepad2,
  Cat
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ListingCard } from '@/components/listing-card'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollButtons)
      return () => scrollContainer.removeEventListener('scroll', checkScrollButtons)
    }
  }, [])

  // Categories data - same as navigation
  const categories = [
    {
      id: 1,
      name: 'Transport',
      icon: Car,
      color: 'text-green-600',
      slug: 'transport'
    },
    {
      id: 2,
      name: 'Real Estate',
      icon: Home,
      color: 'text-blue-600',
      slug: 'real-estate'
    },
    {
      id: 3,
      name: 'Jobs',
      icon: Briefcase,
      color: 'text-purple-600',
      slug: 'jobs'
    },
    {
      id: 4,
      name: 'Services',
      icon: Paintbrush,
      color: 'text-orange-600',
      slug: 'services'
    },
    {
      id: 5,
      name: 'Personal Items',
      icon: Shirt,
      color: 'text-pink-600',
      slug: 'personal-items'
    },
    {
      id: 6,
      name: 'Home & Garden',
      icon: Sofa,
      color: 'text-green-600',
      slug: 'home-garden'
    },
    {
      id: 7,
      name: 'Electronics',
      icon: Smartphone,
      color: 'text-blue-600',
      slug: 'electronics'
    },
    {
      id: 8,
      name: 'Hobbies & Recreation',
      icon: Gamepad2,
      color: 'text-yellow-600',
      slug: 'hobbies-recreation'
    },
    {
      id: 9,
      name: 'Animals',
      icon: Cat,
      color: 'text-orange-600',
      slug: 'animals'
    }
  ]

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

  // Featured vendors mock data
  const featuredVendors = [
    {
      id: 1,
      name: "Expat Electronics Store",
      description: "Premium electronics and gadgets for expats in Russia",
      category: "Electronics",
      rating: 4.8,
      reviews: 127,
      city: "Moscow",
      verified: true,
      image: "/api/placeholder/300/200",
      products_count: 45,
      established: "2020"
    },
    {
      id: 2,
      name: "International Books & Media",
      description: "Books, magazines, and educational materials in multiple languages",
      category: "Books & Media",
      rating: 4.9,
      reviews: 89,
      city: "St. Petersburg",
      verified: true,
      image: "/api/placeholder/300/200",
      products_count: 32,
      established: "2019"
    },
    {
      id: 3,
      name: "Moscow Furniture Hub",
      description: "Quality furniture and home decor for expat homes",
      category: "Home & Garden",
      rating: 4.6,
      reviews: 156,
      city: "Moscow",
      verified: true,
      image: "/api/placeholder/300/200",
      products_count: 28,
      established: "2021"
    },
    {
      id: 4,
      name: "Expat Fashion Boutique",
      description: "Trendy clothing and accessories for international residents",
      category: "Fashion",
      rating: 4.7,
      reviews: 203,
      city: "Moscow",
      verified: false,
      image: "/api/placeholder/300/200",
      products_count: 67,
      established: "2022"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-16 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance mb-6">
              #1 <span className="text-primary">Expat Marketplace</span> in Russia
            </h1>
            <p className="text-xl leading-8 text-muted-foreground max-w-3xl mx-auto text-balance mb-8">
              Buy, sell, and discover amazing items from fellow expats. Connect with trusted vendors and find the services you need.
            </p>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <section className="pt-2 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Category Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {/* Left scroll button */}
              {canScrollLeft && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200"
                  onClick={scrollLeft}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              {/* Category badges container */}
              <div 
                ref={scrollContainerRef}
                className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide max-w-4xl"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="group flex-shrink-0"
                    >
                      <Badge 
                        variant="outline" 
                        className="flex items-center space-x-2 px-4 py-2 h-10 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Icon className={`h-4 w-4 ${category.color} group-hover:text-primary-foreground`} />
                        <span className="text-sm font-medium">{category.name}</span>
                      </Badge>
                    </Link>
                  )
                })}
              </div>

              {/* Right scroll button */}
              {canScrollRight && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 bg-white shadow-sm hover:bg-gray-50 border-gray-200"
                  onClick={scrollRight}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* 4 columns x 3 rows grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {unifiedListings.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
          
          {/* View All Listings Button */}
          <div className="text-center">
            <Button variant="outline" asChild>
              <Link href="/listings">
                View All Listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <Card key={service.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Service Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base line-clamp-2 mb-1">
                          {service.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                      {service.provider.verified && (
                        <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>

                    {/* Provider Info */}
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
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

                    {/* Location */}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{service.provider.city}</span>
                    </div>
          
                    {/* Price and Action */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {service.price.toLocaleString()}₽
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {service.duration}
                        </div>
                      </div>
                      <Button size="sm" className="h-8 px-3">
                        Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vendors Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                Featured Vendors
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
                Trusted vendors offering quality products for the expat community
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/vendors">
                View All Vendors
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredVendors.map((vendor) => (
              <Card key={vendor.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Vendor Image */}
                    <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
                      <Image
                        src={vendor.image}
                        alt={vendor.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Vendor Info */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-base line-clamp-1">
                          {vendor.name}
                        </h3>
                        {vendor.verified && (
                          <Shield className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {vendor.description}
                      </p>

                      <Badge variant="outline" className="text-xs w-fit">
                        {vendor.category}
                      </Badge>

                      {/* Rating and Location */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{vendor.rating} ({vendor.reviews})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{vendor.city}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>{vendor.products_count} products</span>
                        <span>Since {vendor.established}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button size="sm" className="w-full h-8">
                      Visit Store
                    </Button>
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