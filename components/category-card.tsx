'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'
import { forwardRef } from 'react'

interface CategoryCardProps {
  category: {
    id: number
    name: string
    slug: string
    icon: LucideIcon
    description?: string
    listingCount?: number
    productCount?: number
    color?: string
  }
  variant?: 'default' | 'compact' | 'featured'
}

export function CategoryCard({ category, variant = 'default' }: CategoryCardProps) {
  const Icon = category.icon
  
  if (variant === 'compact') {
    return (
      <Link href={`/categories/${category.slug}`}>
        <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 rounded-lg flex-shrink-0"
                style={{ backgroundColor: category.color ? `${category.color}15` : '#f3f4f6' }}
              >
                <Icon 
                  className="h-5 w-5" 
                  style={{ color: category.color || '#6b7280' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                  {category.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {category.listingCount || 0} listings
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {category.productCount || 0} products
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link href={`/categories/${category.slug}`}>
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden">
          <CardContent className="p-0">
            <div className="relative">
              <div 
                className="h-32 w-full flex items-center justify-center"
                style={{ 
                  background: category.color 
                    ? `linear-gradient(135deg, ${category.color}20, ${category.color}40)`
                    : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
                }}
              >
                <Icon 
                  className="h-12 w-12" 
                  style={{ color: category.color || '#6b7280' }}
                />
              </div>
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  Featured
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {category.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {category.listingCount || 0} listings
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {category.productCount || 0} products
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Browse →
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-6">
          <div className="text-center">
            <div 
              className="mx-auto w-16 h-16 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: category.color ? `${category.color}15` : '#f3f4f6' }}
            >
              <Icon 
                className="h-8 w-8" 
                style={{ color: category.color || '#6b7280' }}
              />
            </div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {category.description}
              </p>
            )}
            <div className="flex justify-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {category.listingCount || 0} listings
              </Badge>
              <Badge variant="outline" className="text-xs">
                {category.productCount || 0} products
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
