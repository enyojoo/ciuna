'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, MapPin } from 'lucide-react'
import { formatPrice, getConditionLabel, getInitials } from '@/lib/utils'
import type { Listing } from '@/lib/types'

interface ListingCardProps {
  listing: Listing
  onFavorite?: (listingId: number) => void
  isFavorite?: boolean
}

export function ListingCard({ listing, onFavorite, isFavorite }: ListingCardProps) {

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden">
        {listing.photo_urls && listing.photo_urls.length > 0 ? (
          <Image
            src={listing.photo_urls[0]}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image</span>
          </div>
        )}
        
        {/* Condition Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {getConditionLabel(listing.condition)}
          </Badge>
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
          onClick={() => onFavorite?.(listing.id)}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} 
          />
        </Button>

        {/* Photo Count */}
        {listing.photo_urls && listing.photo_urls.length > 1 && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="text-xs">
              +{listing.photo_urls.length - 1}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            <Link href={`/listings/${listing.id}`}>
              {listing.title}
            </Link>
          </h3>

          {/* Price */}
          <div className="text-lg font-bold text-primary">
            {formatPrice(listing.price)}
          </div>

          {/* Location */}
          {listing.city && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{listing.city}</span>
              {listing.district && <span>, {listing.district}</span>}
            </div>
          )}

          {/* Seller Info */}
          {listing.seller && (
            <div className="flex items-center space-x-2 pt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={listing.seller.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(listing.seller.first_name, listing.seller.last_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {listing.seller.first_name} {listing.seller.last_name}
              </span>
              {listing.seller.verified_expat && (
                <Badge variant="outline" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/listings/${listing.id}`}>
                View Details
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/listings/${listing.id}?action=message`}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Contact Seller
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
