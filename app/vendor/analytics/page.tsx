'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
  Download,
  Target,
  Award,
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { formatCurrency } from '@/lib/currency'
import { useState } from 'react'

export default function VendorAnalytics() {
  const role: UserRole = 'VENDOR'
  const [timeFilter, setTimeFilter] = useState('month')

  // Mock data - in real app, this would come from Supabase
  const analyticsData = {
    revenue: {
      current: 125000,
      previous: 98000,
      growth: 27.6
    },
    orders: {
      current: 45,
      previous: 38,
      growth: 18.4
    },
    customers: {
      current: 38,
      previous: 32,
      growth: 18.8
    },
    conversion: {
      current: 3.2,
      previous: 2.8,
      growth: 14.3
    }
  }

  const topProducts = [
    { name: 'MacBook Pro 16"', sales: 12, revenue: 540000, growth: 15.2 },
    { name: 'iPhone 15 Pro', sales: 8, revenue: 280000, growth: 8.7 },
    { name: 'Gaming Chair', sales: 15, revenue: 120000, growth: 22.1 },
    { name: 'Wireless Headphones', sales: 6, revenue: 30000, growth: -5.2 }
  ]


  const customerInsights = {
    newCustomers: 12,
    returningCustomers: 26,
    averageOrderValue: 2778,
    customerLifetimeValue: 8500,
    retentionRate: 68.4
  }

  const trafficSources = [
    { source: 'Direct', visitors: 45, percentage: 35.2 },
    { source: 'Search Engines', visitors: 38, percentage: 29.7 },
    { source: 'Social Media', visitors: 25, percentage: 19.5 },
    { source: 'Referrals', visitors: 20, percentage: 15.6 }
  ]

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-500' : 'text-red-500'
  }

  const GrowthIcon = getGrowthIcon(analyticsData.revenue.growth)

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Track your store performance and insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Time Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Analytics Overview</h3>
              <div className="flex gap-2">
                <Button
                  variant={timeFilter === 'week' ? 'default' : 'outline'}
                  onClick={() => setTimeFilter('week')}
                >
                  This Week
                </Button>
                <Button
                  variant={timeFilter === 'month' ? 'default' : 'outline'}
                  onClick={() => setTimeFilter('month')}
                >
                  This Month
                </Button>
                <Button
                  variant={timeFilter === 'quarter' ? 'default' : 'outline'}
                  onClick={() => setTimeFilter('quarter')}
                >
                  This Quarter
                </Button>
                <Button
                  variant={timeFilter === 'year' ? 'default' : 'outline'}
                  onClick={() => setTimeFilter('year')}
                >
                  This Year
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold">{formatCurrency(analyticsData.revenue.current, 'RUB')}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <GrowthIcon className={`h-4 w-4 mr-1 ${getGrowthColor(analyticsData.revenue.growth)}`} />
                <span className={`text-sm ${getGrowthColor(analyticsData.revenue.growth)}`}>
                  +{analyticsData.revenue.growth}% vs last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold">{analyticsData.orders.current}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">
                  +{analyticsData.orders.growth}% vs last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  <p className="text-3xl font-bold">{analyticsData.customers.current}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">
                  +{analyticsData.customers.growth}% vs last period
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                  <p className="text-3xl font-bold">{analyticsData.conversion.current}%</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">
                  +{analyticsData.conversion.growth}% vs last period
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue Trend
            </CardTitle>
            <CardDescription>
              Your revenue performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Revenue chart would go here</p>
                <p className="text-sm">Interactive chart showing monthly revenue trends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Products & Customer Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top Products
              </CardTitle>
              <CardDescription>
                Your best-selling products by revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => {
                  const ProductGrowthIcon = getGrowthIcon(product.growth)
                  return (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.revenue, 'RUB')}</p>
                        <div className="flex items-center gap-1">
                          <ProductGrowthIcon className={`h-3 w-3 ${getGrowthColor(product.growth)}`} />
                          <span className={`text-xs ${getGrowthColor(product.growth)}`}>
                            {product.growth > 0 ? '+' : ''}{product.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Insights
              </CardTitle>
              <CardDescription>
                Key customer metrics and behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Customers</span>
                  <span className="font-medium">{customerInsights.newCustomers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Returning Customers</span>
                  <span className="font-medium">{customerInsights.returningCustomers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Average Order Value</span>
                  <span className="font-medium">{formatCurrency(customerInsights.averageOrderValue, 'RUB')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer Lifetime Value</span>
                  <span className="font-medium">{formatCurrency(customerInsights.customerLifetimeValue, 'RUB')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Retention Rate</span>
                  <span className="font-medium">{customerInsights.retentionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>
              Where your customers are coming from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{source.visitors} visitors</span>
                    <span className="font-medium">{source.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance Goals
            </CardTitle>
            <CardDescription>
              Track your progress towards monthly targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Revenue Goal</span>
                  <span className="text-sm text-muted-foreground">₽150,000</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: '83%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">83% complete</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Orders Goal</span>
                  <span className="text-sm text-muted-foreground">50 orders</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: '90%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">90% complete</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Customer Goal</span>
                  <span className="text-sm text-muted-foreground">40 customers</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: '95%' }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">95% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  )
}
