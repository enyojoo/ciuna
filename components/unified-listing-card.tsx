'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Star, Shield, Clock, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface UnifiedListingCardProps {
  item: {
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
  }
  onFavorite?: (itemId: number) => void
  isFavorite?: boolean
}

export function UnifiedListingCard({ item, onFavorite, isFavorite }: UnifiedListingCardProps) {
  const isListing = item.type === 'listing'
  const imageUrl = isListing ? item.photo_urls?.[0] : item.image
  const imageAlt = item.title

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imageUrl || '/api/placeholder/300/200'}
          alt={imageAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Condition Badge */}
        <div className="absolute top-2 left-2">
          <Badge 
            variant={isListing ? "secondary" : "default"} 
            className="text-xs"
          >
            {item.condition}
          </Badge>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 right-12">
          <Badge 
            variant={isListing ? "outline" : "secondary"} 
            className="text-xs"
          >
            {isListing ? 'Used' : 'New'}
          </Badge>
        </div>

        {/* Out of Stock Overlay for Products */}
        {!isListing && !item.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
          onClick={() => onFavorite?.(item.id)}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors text-sm">
            {item.title}
          </h3>

          {/* Price */}
          <div className="text-lg font-bold text-primary">
            {item.price.toLocaleString()}₽
          </div>

          {/* Category for Products */}
          {!isListing && item.category && (
            <Badge variant="outline" className="text-xs">
              {item.category}
            </Badge>
          )}

          {/* Seller/Vendor Info */}
          <div className="space-y-1">
            {isListing ? (
              // Listing seller info
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium truncate">
                  {item.seller?.first_name} {item.seller?.last_name}
                </span>
                {item.seller?.verified_expat && (
                  <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
                )}
              </div>
            ) : (
              // Product vendor info
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium truncate">
                  {item.vendor?.name}
                </span>
                {item.vendor?.verified && (
                  <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
                )}
              </div>
            )}

            {/* Rating and Location */}
            <div className="flex items-center space-x-1">
              {isListing ? (
                // Listing info
                <>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {item.city}, {item.district}
                  </span>
                </>
              ) : (
                // Product info
                <>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-muted-foreground">
                    {item.vendor?.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {item.vendor?.city}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1 h-8"
              disabled={!isListing && !item.inStock}
            >
              {isListing ? 'Contact Seller' : (item.inStock ? 'Add to Cart' : 'Out of Stock')}
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <MessageCircle className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
