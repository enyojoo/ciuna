'use client'

import { useTranslations } from 'next-intl'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Package, 
  Store, 
  Wrench, 
  ShoppingCart, 
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  MessageCircle
} from 'lucide-react'
import { formatPrice, formatDate, getStatusLabel } from '@/lib/utils'

// Mock data - in real app, this would come from Supabase
const mockStats = {
  totalUsers: 1247,
  totalListings: 3421,
  totalVendors: 156,
  totalServices: 89,
  totalOrders: 2893,
  totalRevenue: 12500000,
  pendingApprovals: 23,
  activeConversations: 156
}

const mockPendingApprovals = [
  {
    id: 1,
    type: 'listing' as const,
    title: 'iPhone 15 Pro Max - Brand New',
    user: {
      first_name: 'John',
      last_name: 'Smith',
      email: 'john.smith@example.com'
    },
    created_at: '2024-01-15T10:30:00Z',
    status: 'PENDING_REVIEW' as const
  },
  {
    id: 2,
    type: 'vendor' as const,
    title: 'Tech Gadgets Store',
    user: {
      first_name: 'Maria',
      last_name: 'Garcia',
      email: 'maria.garcia@example.com'
    },
    created_at: '2024-01-14T15:45:00Z',
    status: 'PENDING' as const
  },
  {
    id: 3,
    type: 'service' as const,
    title: 'Legal Consultation Services',
    user: {
      first_name: 'David',
      last_name: 'Wilson',
      email: 'david.wilson@example.com'
    },
    created_at: '2024-01-13T09:20:00Z',
    status: 'PENDING' as const
  }
]

const mockRecentActivity = [
  {
    id: 1,
    type: 'order' as const,
    description: 'New order #1234 - MacBook Pro sale',
    user: 'John Smith',
    amount: 120000,
    created_at: '2024-01-15T14:30:00Z'
  },
  {
    id: 2,
    type: 'listing' as const,
    description: 'New listing created - Winter Coat',
    user: 'Maria Garcia',
    amount: 8000,
    created_at: '2024-01-15T12:15:00Z'
  },
  {
    id: 3,
    type: 'vendor' as const,
    description: 'New vendor registered - Electronics Store',
    user: 'David Wilson',
    amount: null,
    created_at: '2024-01-15T10:45:00Z'
  },
  {
    id: 4,
    type: 'service' as const,
    description: 'Service booking - Legal Consultation',
    user: 'Sarah Brown',
    amount: 5000,
    created_at: '2024-01-15T09:30:00Z'
  }
]

const mockUsers = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    role: 'USER' as const,
    verified_expat: true,
    created_at: '2024-01-10T10:30:00Z',
    last_active: '2024-01-15T14:30:00Z',
    total_orders: 5,
    total_spent: 150000
  },
  {
    id: 2,
    first_name: 'Maria',
    last_name: 'Garcia',
    email: 'maria.garcia@example.com',
    role: 'VENDOR' as const,
    verified_expat: true,
    created_at: '2024-01-08T15:45:00Z',
    last_active: '2024-01-15T12:15:00Z',
    total_orders: 12,
    total_spent: 250000
  },
  {
    id: 3,
    first_name: 'David',
    last_name: 'Wilson',
    email: 'david.wilson@example.com',
    role: 'USER' as const,
    verified_expat: false,
    created_at: '2024-01-12T09:20:00Z',
    last_active: '2024-01-15T10:45:00Z',
    total_orders: 2,
    total_spent: 15000
  }
]

export default function AdminPage() {
  const t = useTranslations('admin')

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            Manage your marketplace platform
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
                  <p className="text-2xl font-bold">{mockStats.totalListings.toLocaleString()}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+8% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatPrice(mockStats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+15% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                  <p className="text-2xl font-bold">{mockStats.pendingApprovals}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2">
                <Clock className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-sm text-orange-500">Requires attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    {t('pending_approvals')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPendingApprovals.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.user.first_name} {item.user.last_name} • {item.user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            item.status === 'PENDING' ? 'secondary' : 'destructive'
                          }>
                            {getStatusLabel(item.status)}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            {activity.type === 'order' && <ShoppingCart className="h-4 w-4" />}
                            {activity.type === 'listing' && <Package className="h-4 w-4" />}
                            {activity.type === 'vendor' && <Store className="h-4 w-4" />}
                            {activity.type === 'service' && <Wrench className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.user} • {formatDate(activity.created_at)}
                            </p>
                          </div>
                        </div>
                        {activity.amount && (
                          <span className="text-sm font-medium text-primary">
                            {formatPrice(activity.amount)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  All Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {user.first_name[0]}{user.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {user.first_name} {user.last_name}
                          </h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                            {user.verified_expat && (
                              <Badge variant="outline" className="text-xs">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {user.total_orders} orders • {formatPrice(user.total_spent)} spent
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last active: {formatDate(user.last_active)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would be implemented similarly */}
          <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>Listings Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Listings management interface would go here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Vendors Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Vendors management interface would go here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Services management interface would go here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
