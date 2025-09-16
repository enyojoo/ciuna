'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Shield, MapPin, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ListingCardProps {
  item: {
    id: number
    title: string
    price: number
    currency: string
    condition: string
    type: 'listing' | 'product' | 'job' | 'service'
    // For listings (used items, job ads, services)
    city?: string
    district?: string
    photo_urls?: string[]
    seller?: {
      first_name: string
      last_name: string
      verified_expat: boolean
      country_of_origin: string
      profile_image?: string
    }
    created_at?: string
    // For products
    image?: string
    vendor?: {
      name: string
      verified: boolean
      rating: number
      city: string
      profile_image?: string
    }
    inStock?: boolean
    // For jobs
    company?: string
    employment_type?: string
    company_logo?: string
    // For services
    provider?: {
      name: string
      verified: boolean
      rating: number
      city: string
      profile_image?: string
    }
    duration?: string
  }
  onFavorite?: (itemId: number) => void
  isFavorite?: boolean
}

export function ListingCard({ item, onFavorite, isFavorite }: ListingCardProps) {
  const isListing = item.type === 'listing'
  const isProduct = item.type === 'product'
  const isJob = item.type === 'job'
  const isService = item.type === 'service'
  
  const imageUrl = isListing || isJob || isService ? item.photo_urls?.[0] : item.image
  const imageAlt = item.title

  // All items use the listings route
  const getItemLink = () => {
    return `/listings/${item.id}`
  }

  return (
    <Link href={getItemLink()} className="block">
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl || '/api/placeholder/300/200'}
            alt={imageAlt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Type Badge - Hide for services */}
          {!isService && (
            <div className="absolute top-2 right-12">
              <Badge 
                variant={isProduct ? "secondary" : "outline"} 
                className="text-xs"
              >
                {isProduct ? 'New' : isJob ? 'Job' : 'Used'}
              </Badge>
          </div>
        )}
        
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
          className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background/90 hover:scale-110 transition-all duration-200"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onFavorite?.(item.id)
            }}
          >
            <Heart className={`h-4 w-4 transition-all duration-200 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'}`} />
        </Button>
      </div>

        <CardContent className="p-4 flex flex-col flex-1">
          <div className="space-y-3 flex-1">
          {/* Date and Location */}
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {item.city}
            </span>
          </div>

          {/* Title */}
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors text-sm">
              {item.title}
          </h3>

          {/* Price */}
          <div className="text-lg font-bold text-primary">
              {isService ? <span className="text-sm font-normal text-black">From </span> : ''}{item.price.toLocaleString()}₽
          </div>

            {/* Seller/Vendor/Provider Info */}
            <div className="space-y-1">
              {isProduct ? (
                // Product vendor info
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
                    {item.vendor?.profile_image ? (
                      <Image
                        src={item.vendor.profile_image}
                        alt={item.vendor.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/placeholder-user.jpg"
                        alt="User placeholder"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {item.vendor?.name}
                  </span>
                  {item.vendor?.verified && (
                    <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
                  )}
            </div>
              ) : isService ? (
                // Service provider info
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
                    {item.provider?.profile_image ? (
                      <Image
                        src={item.provider.profile_image}
                        alt={item.provider.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/placeholder-user.jpg"
                        alt="User placeholder"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {item.provider?.name}
                  </span>
                  {item.provider?.verified && (
                    <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ) : isJob ? (
                // Job company info
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
                    {item.company_logo ? (
                      <Image
                        src={item.company_logo}
                        alt={item.company || 'Company'}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/placeholder-user.jpg"
                        alt="Company placeholder"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {item.company}
                  </span>
                </div>
              ) : (
                // Listing seller info
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
                    {item.seller?.profile_image ? (
                      <Image
                        src={item.seller.profile_image}
                        alt={`${item.seller.first_name} ${item.seller.last_name}`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/placeholder-user.jpg"
                        alt="User placeholder"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="text-sm font-medium truncate">
                    {item.seller?.first_name} {item.seller?.last_name}
              </span>
                  {item.seller?.verified_expat && (
                    <Shield className="h-3 w-3 text-green-500 flex-shrink-0" />
              )}
            </div>
          )}
            </div>
          </div>

          {/* Actions - Always at bottom */}
          <div className="pt-4 mt-auto">
            <Button 
              size="sm" 
              className="w-full h-8"
              disabled={isProduct && !item.inStock}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {isProduct ? (item.inStock ? 'Add to Cart' : 'Out of Stock') : 
               isJob ? 'Apply Now' : 
               isService ? 'Book Now' : 
               'Contact Seller'}
            </Button>
        </div>
      </CardContent>
    </Card>
    </Link>
  )
}
