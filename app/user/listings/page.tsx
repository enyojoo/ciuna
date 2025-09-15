'use client'

import Image from 'next/image'
import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  Plus, 
  Edit, 
  Eye, 
  MoreHorizontal,
  Filter,
  Search
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { formatCurrency, SupportedCurrency } from '@/lib/currency'

export default function UserListings() {
  const role: UserRole = 'USER'

  // Mock data - in real app, this would come from Supabase
  const listings = [
    {
      id: 1,
      title: 'MacBook Pro 16" M2 Max',
      price: 45000,
      currency: 'RUB',
      status: 'active',
      views: 156,
      createdAt: '2024-01-15',
      image: '/placeholder-laptop.jpg'
    },
    {
      id: 2,
      title: 'iPhone 15 Pro 256GB',
      price: 35000,
      currency: 'RUB',
      status: 'sold',
      views: 89,
      createdAt: '2024-01-10',
      image: '/placeholder-phone.jpg'
    },
    {
      id: 3,
      title: 'Gaming Chair - Ergonomic',
      price: 8000,
      currency: 'RUB',
      status: 'paused',
      views: 23,
      createdAt: '2024-01-08',
      image: '/placeholder-chair.jpg'
    }
  ]

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      sold: 'secondary',
      paused: 'outline',
      pending: 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Listings</h1>
            <p className="text-muted-foreground">
              Manage your marketplace listings
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Listing
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search your listings..."
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(listing.status)}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-medium line-clamp-2">{listing.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {formatCurrency(listing.price, listing.currency as SupportedCurrency)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {listing.views} views
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Listed on {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {listings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-4">
                Start selling by creating your first listing
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Listing
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{listings.length}</div>
              <div className="text-sm text-muted-foreground">Total Listings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {listings.filter(l => l.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {listings.filter(l => l.status === 'sold').length}
              </div>
              <div className="text-sm text-muted-foreground">Sold</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {listings.reduce((sum, l) => sum + l.views, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleLayout>
  )
}
