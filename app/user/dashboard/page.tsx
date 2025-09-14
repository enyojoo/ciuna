'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { RoleDashboard } from '@/components/dashboards/role-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ResponsiveGrid } from '@/components/ui/responsive-grid'
import { ResponsiveHeader } from '@/components/ui/responsive-header'
import { 
  Package, 
  ShoppingCart, 
  Heart, 
  TrendingUp, 
  DollarSign,
  Eye,
  Plus,
  Star
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'

export default function UserDashboard() {
  const role: UserRole = 'USER'

  // Mock data - in real app, this would come from Supabase
  const stats = {
    totalListings: 3,
    totalPurchases: 12,
    totalWishlist: 8,
    totalSpent: 125000,
    activeListings: 2,
    soldItems: 1
  }

  const recentActivity = [
    {
      id: 1,
      type: 'purchase',
      title: 'MacBook Pro 16"',
      amount: 45000,
      date: '2024-01-15',
      status: 'delivered'
    },
    {
      id: 2,
      type: 'sale',
      title: 'iPhone 15 Pro',
      amount: 35000,
      date: '2024-01-14',
      status: 'sold'
    },
    {
      id: 3,
      type: 'listing',
      title: 'Gaming Chair',
      amount: 8000,
      date: '2024-01-13',
      status: 'active'
    }
  ]

  // Mock user data - in real app, this would come from Supabase
  const user = {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    location: 'russia',
    onboarding_completed: false,
    completed_steps: ['profile']
  }

  return (
    <RoleLayout role={role}>
      <RoleDashboard role={role} user={user}>
        <div className="space-y-6">
        {/* Header */}
        <ResponsiveHeader
          title="Welcome back!"
          description="Here's what's happening with your marketplace activity"
          mobileStack={true}
        >
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Sell Item
          </Button>
        </ResponsiveHeader>

        {/* Stats Overview */}
        <ResponsiveGrid 
          cols={{ default: 1, sm: 2, md: 2, lg: 4 }}
          gap="lg"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">My Listings</p>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="text-xs">
                  {stats.activeListings} active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Purchases</p>
                  <p className="text-2xl font-bold">{stats.totalPurchases}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+2 this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wishlist</p>
                  <p className="text-2xl font-bold">{stats.totalWishlist}</p>
                </div>
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">Saved items</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">₽{stats.totalSpent.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+15% this month</span>
              </div>
            </CardContent>
          </Card>
        </ResponsiveGrid>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Listings
              </CardTitle>
              <CardDescription>
                Manage your active listings and create new ones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Listings</span>
                <Badge variant="outline">{stats.activeListings}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sold Items</span>
                <Badge variant="default">{stats.soldItems}</Badge>
              </div>
              <Button className="w-full" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View All Listings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Purchases
              </CardTitle>
              <CardDescription>
                Your latest marketplace purchases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₽{item.amount.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button className="w-full" variant="outline">
                View All Purchases
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recommendations
              </CardTitle>
              <CardDescription>
                Items you might be interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Based on your purchase history
                </p>
                <Button variant="outline" className="w-full">
                  Browse Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest marketplace activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {item.type === 'purchase' && <ShoppingCart className="h-4 w-4" />}
                      {item.type === 'sale' && <DollarSign className="h-4 w-4" />}
                      {item.type === 'listing' && <Package className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'purchase' && 'Purchased on '}
                        {item.type === 'sale' && 'Sold on '}
                        {item.type === 'listing' && 'Listed on '}
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₽{item.amount.toLocaleString()}</p>
                    <Badge 
                      variant={
                        item.status === 'delivered' || item.status === 'sold' ? 'default' :
                        item.status === 'active' ? 'secondary' : 'outline'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </RoleDashboard>
    </RoleLayout>
  )
}
