'use client'
import { Navigation } from '@/components/navigation'
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
  List
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {

  // Featured listings mock data
  const featuredListings = [
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
      created_at: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
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
      created_at: "2024-01-14T15:45:00Z"
    },
    {
      id: 3,
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
      created_at: "2024-01-13T09:20:00Z"
    },
    {
      id: 4,
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
      created_at: "2024-01-12T14:10:00Z"
    }
  ]

  const categories = [
    { name: "Electronics", icon: "📱", count: 1247, color: "bg-blue-100 text-blue-600" },
    { name: "Furniture", icon: "🪑", count: 892, color: "bg-green-100 text-green-600" },
    { name: "Clothing", icon: "👕", count: 2156, color: "bg-pink-100 text-pink-600" },
    { name: "Books", icon: "📚", count: 543, color: "bg-yellow-100 text-yellow-600" },
    { name: "Sports", icon: "⚽", count: 678, color: "bg-orange-100 text-orange-600" },
    { name: "Automotive", icon: "🚗", count: 234, color: "bg-gray-100 text-gray-600" }
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
      description: "Your one-stop shop for electronics and gadgets. We specialize in bringing international brands to Russia.",
      logo: "🛍️",
      type: "INTERNATIONAL",
      verified: true,
      rating: 4.8,
      reviews: 128,
      products: 45,
      city: "Moscow",
      country: "United States"
    },
    {
      id: 2,
      name: "Moscow Furniture Hub",
      description: "Quality furniture for expats. From IKEA to custom pieces, we have everything for your home.",
      logo: "🪑",
      type: "LOCAL",
      verified: true,
      rating: 4.6,
      reviews: 89,
      products: 32,
      city: "Moscow",
      country: "Russia"
    },
    {
      id: 3,
      name: "International Books & Media",
      description: "Books, magazines, and media in multiple languages. Perfect for expats missing home.",
      logo: "📚",
      type: "INTERNATIONAL",
      verified: false,
      rating: 4.9,
      reviews: 203,
      products: 156,
      city: "St. Petersburg",
      country: "United Kingdom"
    },
    {
      id: 4,
      name: "Fashion Forward",
      description: "Trendy clothing and accessories for the modern expat. International styles, local prices.",
      logo: "👗",
      type: "INTERNATIONAL",
      verified: true,
      rating: 4.7,
      reviews: 156,
      products: 78,
      city: "Moscow",
      country: "France"
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
      <Navigation />
      
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

      {/* Featured Listings Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Listings</h2>
              <p className="text-muted-foreground mt-2">Handpicked items from our expat community</p>
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
              <Card key={listing.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={listing.photo_urls[0]}
                    alt={listing.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {listing.condition.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {listing.title}
                  </h3>
                  <div className="text-xl font-bold text-primary mb-2">
                    {listing.price.toLocaleString()}₽
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{listing.city}, {listing.district}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {listing.seller.first_name[0]}{listing.seller.last_name[0]}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {listing.seller.first_name}
                      </span>
                      {listing.seller.verified_expat && (
                        <Shield className="h-3 w-3 text-green-500" />
                      )}
                    </div>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Browse by Category
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-balance">
              Discover items in your favorite categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Card key={category.name} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <div className="font-semibold text-lg mb-1">{category.name}</div>
                  <div className="text-sm text-muted-foreground">{category.count} items</div>
                </CardContent>
              </Card>
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

      {/* Featured Vendors Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
                Featured Vendors
              </h2>
              <p className="mt-4 text-lg text-muted-foreground text-balance">
                Trusted local and international vendors serving the expat community
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
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Vendor Header */}
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                        {vendor.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                          {vendor.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={vendor.type === 'LOCAL' ? 'secondary' : 'default'} 
                            className="text-xs"
                          >
                            {vendor.type === 'LOCAL' ? 'Local' : 'International'}
                          </Badge>
                          {vendor.verified && (
                            <Shield className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {vendor.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{vendor.rating}</span>
                          <span className="text-muted-foreground">({vendor.reviews})</span>
                        </div>
                        <span className="text-muted-foreground">{vendor.products} products</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{vendor.city}, {vendor.country}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        View Store
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
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

      {/* Footer */}
      <footer className="bg-muted/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-sm" />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Ciuna</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The trusted marketplace for expats living in Russia. Buy, sell, and connect with your community.
              </p>
              <div className="flex space-x-2">
                {['EN', 'RU', 'FR', 'ZH', 'AR', 'ES'].map((lang) => (
                  <Badge key={lang} variant="secondary" className="text-xs">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Marketplace</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/listings" className="hover:text-foreground transition-colors">Browse Listings</Link></li>
                <li><Link href="/sell/new" className="hover:text-foreground transition-colors">Sell Items</Link></li>
                <li><Link href="/vendors" className="hover:text-foreground transition-colors">Vendors</Link></li>
                <li><Link href="/services" className="hover:text-foreground transition-colors">Services</Link></li>
                <li><Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/safety" className="hover:text-foreground transition-colors">Safety Guidelines</Link></li>
                <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Expat Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
                <li><Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">&copy; 2024 Ciuna. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">Made with ❤️ for the expat community</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}