'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface VendorCardProps {
  vendor: {
    id: number
    name: string
    description: string
    category: string
    rating: number
    reviews: number
    city: string
    verified: boolean
    image: string
    products_count: number
    established: string
  }
}

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Centered Vendor Logo */}
          <div className="flex justify-center mb-3">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
              <Image
                src={vendor.image}
                alt={vendor.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Vendor Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
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
          </div>

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

          {/* Action Button */}
          <Button size="sm" className="w-full h-8" asChild>
            <Link href={`/vendors/${vendor.id}`}>
              View Store
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
