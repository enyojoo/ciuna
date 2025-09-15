import { notFound } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Flag, 
  MapPin, 
  Calendar,
  Shield,
  Star
} from 'lucide-react'
import { formatPrice, getConditionLabel, getInitials, formatDate } from '@/lib/utils'
import Image from 'next/image'

// Mock data - in real app, this would come from Supabase
const mockListing = {
  id: 1,
  title: "MacBook Pro 13-inch M2 Chip - Excellent Condition",
  description: "Selling my MacBook Pro 13-inch with M2 chip. It's in excellent condition, barely used. Comes with original charger and box. Perfect for students or professionals. No scratches or dents. Battery health is at 98%. I'm selling because I'm upgrading to a larger model.",
  price: 120000,
  condition: "LIKE_NEW" as const,
  city: "Moscow",
  district: "Arbat",
  photo_urls: [
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600",
    "/api/placeholder/800/600"
  ],
  status: "ACTIVE" as const,
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-15T10:30:00Z",
  seller: {
    id: "1",
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@example.com",
    verified_expat: true,
    avatar_url: null,
    country_of_origin: "United States",
    city: "Moscow",
    created_at: "2023-06-15T10:30:00Z"
  },
  category: {
    id: 1,
    name: "Electronics",
    slug: "electronics"
  }
}

const mockReviews = [
  {
    id: 1,
    rating: 5,
    comment: "Great seller! Item was exactly as described and shipped quickly.",
    reviewer: {
      first_name: "Maria",
      last_name: "Garcia"
    },
    created_at: "2024-01-10T14:30:00Z"
  },
  {
    id: 2,
    rating: 4,
    comment: "Good communication and fast delivery. Would buy again.",
    reviewer: {
      first_name: "Alex",
      last_name: "Johnson"
    },
    created_at: "2024-01-08T09:15:00Z"
  }
]

interface ListingPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params
  const listingId = parseInt(id)
  
  // In real app, fetch from Supabase
  if (listingId !== 1) {
    notFound()
  }

  const listing = mockListing
  const reviews = mockReviews
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-foreground">Listings</Link>
          <span>/</span>
          <span className="text-foreground">{listing.category.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden">
                  {listing.photo_urls && listing.photo_urls.length > 0 ? (
                    <Image
                      src={listing.photo_urls[0]}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image available</span>
                    </div>
                  )}
                  
                  {/* Image Counter */}
                  {listing.photo_urls && listing.photo_urls.length > 1 && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        1 of {listing.photo_urls.length}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Navigation */}
                {listing.photo_urls && listing.photo_urls.length > 1 && (
                  <div className="p-4 bg-muted/30">
                    <div className="flex space-x-2 overflow-x-auto">
                      {listing.photo_urls.map((url, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-20 h-20 relative rounded-lg border-2 border-transparent cursor-pointer hover:border-primary transition-colors"
                        >
                          <Image
                            src={url}
                            alt={`${listing.title} ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {listing.description}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Reviews ({reviews.length})
                  {averageRating > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {averageRating.toFixed(1)}/5
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(review.reviewer.first_name, review.reviewer.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {review.reviewer.first_name} {review.reviewer.last_name}
                            </p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Actions */}
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {formatPrice(listing.price)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-sm">
                        {getConditionLabel(listing.condition)}
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {listing.category.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button className="w-full" size="lg" className="h-12 text-base font-semibold">
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Seller
                    </Button>
                    <Button variant="outline" className="w-full h-12">
                      <Heart className="h-5 w-5 mr-2" />
                      Save to Favorites
                    </Button>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1 h-10">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="icon" className="h-10">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Located in {listing.city}, {listing.district}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Posted {formatDate(listing.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={listing.seller.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(listing.seller.first_name, listing.seller.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {listing.seller.first_name} {listing.seller.last_name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {listing.seller.verified_expat && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified Expat
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          From {listing.seller.country_of_origin}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{listing.seller.city}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Member since {formatDate(listing.seller.created_at)}</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{listing.city}</span>
                    {listing.district && <span>, {listing.district}</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• Local pickup available</p>
                    <p>• Delivery within 10km</p>
                    <p>• Shipping available nationwide</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Meet in public places</p>
                  <p>• Inspect items before payment</p>
                  <p>• Use secure payment methods</p>
                  <p>• Trust your instincts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
