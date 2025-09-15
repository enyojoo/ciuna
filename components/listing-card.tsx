'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, MapPin, Eye, Clock, Shield, Star } from 'lucide-react'
import { formatPrice, getConditionLabel, getInitials } from '@/lib/utils'
import type { Listing } from '@/lib/types'

interface ListingCardProps {
  listing: Listing
  onFavorite?: (listingId: number) => void
  isFavorite?: boolean
  variant?: 'default' | 'compact' | 'featured'
}

export function ListingCard({ listing, onFavorite, isFavorite, variant = 'default' }: ListingCardProps) {
  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'

  if (isCompact) {
    return (
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="flex">
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden">
            {listing.photo_urls && listing.photo_urls.length > 0 ? (
              <Image
                src={listing.photo_urls[0]}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">No image</span>
              </div>
            )}
            <div className="absolute top-1 left-1">
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {getConditionLabel(listing.condition)}
              </Badge>
            </div>
          </div>
          <CardContent className="p-3 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors text-sm">
                <Link href={`/listings/${listing.id}`}>
                  {listing.title}
                </Link>
              </h3>
              <div className="text-lg font-bold text-primary mt-1">
                {formatPrice(listing.price)}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{listing.city}</span>
              </div>
              <Button size="sm" variant="outline" className="h-7 px-2">
                <MessageCircle className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isFeatured ? 'ring-2 ring-primary/20' : ''}`}>
      <div className="relative aspect-square overflow-hidden">
        {listing.photo_urls && listing.photo_urls.length > 0 ? (
          <Image
            src={listing.photo_urls[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <span className="text-sm text-muted-foreground">No image</span>
            </div>
          </div>
        )}
        
        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant="secondary" 
            className={`text-xs font-medium ${isFeatured ? 'bg-primary/90 text-primary-foreground' : 'bg-background/90'}`}
          >
            {getConditionLabel(listing.condition)}
          </Badge>
        </div>

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-medium">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-9 w-9 bg-background/90 hover:bg-background backdrop-blur-sm"
          onClick={() => onFavorite?.(listing.id)}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'hover:text-red-500'}`} 
          />
        </Button>

        {/* Photo Count */}
        {listing.photo_urls && listing.photo_urls.length > 1 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur-sm">
              <Eye className="h-3 w-3 mr-1" />
              +{listing.photo_urls.length - 1}
            </Badge>
          </div>
        )}

        {/* Time Since Posted */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur-sm">
            <Clock className="h-3 w-3 mr-1" />
            {new Date(listing.created_at).toLocaleDateString()}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <h3 className={`font-semibold line-clamp-2 group-hover:text-primary transition-colors ${isFeatured ? 'text-lg' : ''}`}>
            <Link href={`/listings/${listing.id}`}>
              {listing.title}
            </Link>
          </h3>

          {/* Price */}
          <div className={`font-bold text-primary ${isFeatured ? 'text-2xl' : 'text-xl'}`}>
            {formatPrice(listing.price)}
          </div>

          {/* Location */}
          {listing.city && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="font-medium">{listing.city}</span>
              {listing.district && <span className="ml-1">, {listing.district}</span>}
            </div>
          )}

          {/* Seller Info */}
          {listing.seller && (
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Avatar className="h-7 w-7">
                <AvatarImage src={listing.seller.avatar_url || undefined} />
                <AvatarFallback className="text-xs font-medium">
                  {getInitials(listing.seller.first_name, listing.seller.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium truncate">
                    {listing.seller.first_name} {listing.seller.last_name}
                  </span>
                  {listing.seller.verified_expat && (
                    <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  From {listing.seller.country_of_origin}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/listings/${listing.id}`}>
                View Details
              </Link>
            </Button>
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/listings/${listing.id}?action=message`}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Contact
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
