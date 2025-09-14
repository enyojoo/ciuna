'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { formatCurrency } from '@/lib/currency'

export default function CourierDashboard() {
  const role: UserRole = 'COURIER'

  // Mock data - in real app, this would come from Supabase
  const stats = {
    totalDeliveries: 156,
    completedDeliveries: 142,
    totalEarnings: 125000,
    averageRating: 4.9,
    activeDeliveries: 3,
    availableJobs: 8,
    weeklyEarnings: 25000,
    completionRate: 91.0
  }

  const recentDeliveries = [
    {
      id: 1,
      from: 'Tech Store, Moscow',
      to: 'John Smith, Arbat St.',
      distance: '12.5 km',
      amount: 1200,
      status: 'completed',
      completedAt: '2024-01-15 14:30'
    },
    {
      id: 2,
      from: 'Electronics Hub, Moscow',
      to: 'Maria Garcia, Tverskaya St.',
      distance: '8.2 km',
      amount: 800,
      status: 'in_progress',
      estimatedTime: '15 min'
    },
    {
      id: 3,
      from: 'Fashion Store, Moscow',
      to: 'David Wilson, Red Square',
      distance: '5.8 km',
      amount: 600,
      status: 'available',
      pickupTime: '16:00'
    }
  ]

  const earningsBreakdown = [
    { period: 'This Week', amount: 25000, deliveries: 12 },
    { period: 'Last Week', amount: 22000, deliveries: 11 },
    { period: 'This Month', amount: 85000, deliveries: 38 }
  ]

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your deliveries and track earnings
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Set Availability
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
                  <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
                </div>
                <Truck className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">{stats.completedDeliveries} completed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings, 'RUB')}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+{formatCurrency(stats.weeklyEarnings, 'RUB')} this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Deliveries</p>
                  <p className="text-2xl font-bold">{stats.activeDeliveries}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <Badge variant="outline" className="text-xs">
                  {stats.availableJobs} available
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating}/5</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">{stats.completionRate}% completion rate</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Current Deliveries
              </CardTitle>
              <CardDescription>
                Your active and available delivery jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDeliveries.slice(0, 2).map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{delivery.from}</p>
                        <p className="text-xs text-muted-foreground">{delivery.to}</p>
                        <p className="text-xs text-muted-foreground">{delivery.distance}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(delivery.amount, 'RUB')}</p>
                      <Badge 
                        variant={
                          delivery.status === 'completed' ? 'default' :
                          delivery.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }
                      >
                        {delivery.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  View All Deliveries
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Earnings Overview
              </CardTitle>
              <CardDescription>
                Your earnings breakdown by period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {earningsBreakdown.map((period) => (
                  <div key={period.period} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{period.period}</p>
                      <p className="text-sm text-muted-foreground">{period.deliveries} deliveries</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(period.amount, 'RUB')}</p>
                    </div>
                  </div>
                ))}
                <Button className="w-full" variant="outline">
                  View Detailed Earnings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest delivery activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {delivery.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {delivery.status === 'in_progress' && <Clock className="h-4 w-4 text-blue-500" />}
                      {delivery.status === 'available' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div>
                      <p className="font-medium">{delivery.from} → {delivery.to}</p>
                      <p className="text-sm text-muted-foreground">
                        {delivery.distance} • {delivery.status === 'completed' ? `Completed at ${delivery.completedAt}` : 
                         delivery.status === 'in_progress' ? `ETA: ${delivery.estimatedTime}` :
                         `Pickup at ${delivery.pickupTime}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(delivery.amount, 'RUB')}</p>
                    <Badge 
                      variant={
                        delivery.status === 'completed' ? 'default' :
                        delivery.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }
                    >
                      {delivery.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.completionRate}%</div>
              <p className="text-sm text-muted-foreground">Deliveries completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(Math.round(stats.totalEarnings / stats.totalDeliveries), 'RUB')}</div>
              <p className="text-sm text-muted-foreground">Per delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageRating}/5</div>
              <p className="text-sm text-muted-foreground">Based on reviews</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleLayout>
  )
}
