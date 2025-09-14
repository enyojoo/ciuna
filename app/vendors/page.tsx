'use client'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Star, 
  MapPin, 
  Shield, 
  Store, 
  Package,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'

// Mock data - in real app, this would come from Supabase
const mockVendors = [
  {
    id: 1,
    name: "Expat Electronics Store",
    description: "Your one-stop shop for electronics and gadgets. We specialize in bringing international brands to Russia.",
    logo_url: "/api/placeholder/100/100",
    country: "United States",
    city: "Moscow",
    verified: true,
    type: "INTERNATIONAL" as const,
    status: "ACTIVE" as const,
    owner: {
      id: "1",
      first_name: "John",
      last_name: "Smith",
      verified_expat: true
    },
    product_count: 45,
    rating: 4.8,
    review_count: 128
  },
  {
    id: 2,
    name: "Moscow Furniture Hub",
    description: "Quality furniture for expats. From IKEA to custom pieces, we have everything for your home.",
    logo_url: "/api/placeholder/100/100",
    country: "Russia",
    city: "Moscow",
    verified: true,
    type: "LOCAL" as const,
    status: "ACTIVE" as const,
    owner: {
      id: "2",
      first_name: "Maria",
      last_name: "Petrova",
      verified_expat: false
    },
    product_count: 32,
    rating: 4.6,
    review_count: 89
  },
  {
    id: 3,
    name: "International Books & Media",
    description: "Books, magazines, and media in multiple languages. Perfect for expats missing home.",
    logo_url: "/api/placeholder/100/100",
    country: "United Kingdom",
    city: "St. Petersburg",
    verified: false,
    type: "INTERNATIONAL" as const,
    status: "ACTIVE" as const,
    owner: {
      id: "3",
      first_name: "David",
      last_name: "Wilson",
      verified_expat: true
    },
    product_count: 156,
    rating: 4.9,
    review_count: 203
  },
  {
    id: 4,
    name: "Fashion Forward",
    description: "Trendy clothing and accessories for the modern expat. International styles, local prices.",
    logo_url: "/api/placeholder/100/100",
    country: "France",
    city: "Moscow",
    verified: true,
    type: "INTERNATIONAL" as const,
    status: "ACTIVE" as const,
    owner: {
      id: "4",
      first_name: "Sophie",
      last_name: "Martin",
      verified_expat: true
    },
    product_count: 78,
    rating: 4.7,
    review_count: 156
  }
]

export default function VendorsPage() {

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            Discover trusted vendors in your community
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
                  placeholder="Search vendors..."
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_vendors')}</SelectItem>
                  <SelectItem value="local">{t('local_vendors')}</SelectItem>
                  <SelectItem value="international">{t('international_vendors')}</SelectItem>
                  <SelectItem value="verified">{t('verified_vendors')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Location Filter */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="moscow">Moscow</SelectItem>
                  <SelectItem value="st-petersburg">St. Petersburg</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="products">Most Products</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Vendors */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('featured_vendors')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVendors.slice(0, 3).map((vendor) => (
              <Card key={vendor.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={vendor.logo_url} />
                        <AvatarFallback>
                          <Store className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{vendor.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {vendor.verified && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant={vendor.type === 'LOCAL' ? 'secondary' : 'default'} className="text-xs">
                            {vendor.type === 'LOCAL' ? 'Local' : 'International'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {vendor.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{vendor.city}, {vendor.country}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Package className="h-4 w-4 mr-2" />
                      <span>{vendor.product_count} products</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                      <span className="font-medium">{vendor.rating}</span>
                      <span className="text-muted-foreground ml-1">({vendor.review_count} reviews)</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button asChild className="flex-1">
                      <Link href={`/vendors/${vendor.id}`}>
                        {t('view_store')}
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

        {/* All Vendors */}
        <div>
          <h2 className="text-2xl font-bold mb-4">{t('all_vendors')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockVendors.map((vendor) => (
              <Card key={vendor.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={vendor.logo_url} />
                        <AvatarFallback>
                          <Store className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{vendor.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          {vendor.verified && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant={vendor.type === 'LOCAL' ? 'secondary' : 'default'} className="text-xs">
                            {vendor.type === 'LOCAL' ? 'Local' : 'International'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {vendor.description}
                  </p>
                  
                  <div className="space-y-1 mb-3 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-2" />
                      <span>{vendor.city}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Package className="h-3 w-3 mr-2" />
                      <span>{vendor.product_count} products</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
                      <span className="font-medium text-sm">{vendor.rating}</span>
                      <span className="text-muted-foreground ml-1 text-xs">({vendor.review_count})</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/vendors/${vendor.id}`}>
                        {t('view_store')}
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
            Load More Vendors
          </Button>
        </div>
      </div>
    </div>
  )
}
