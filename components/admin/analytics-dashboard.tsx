'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Globe, 
  TrendingUp, 
  MapPin,
  CreditCard,
  Package
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'

interface AnalyticsData {
  totalUsers: number
  totalRevenue: number
  totalOrders: number
  totalListings: number
  usersByLocation: Array<{ location: string; count: number; percentage: number }>
  revenueByLocation: Array<{ location: string; revenue: number; percentage: number }>
  currencyDistribution: Array<{ currency: string; count: number; percentage: number }>
  featureUsage: Array<{ feature: string; enabled: number; disabled: number }>
  recentActivity: Array<{
    id: number
    type: string
    description: string
    location: string
    amount?: number
    created_at: string
  }>
}

interface AnalyticsDashboardProps {
  className?: string
}

export function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedLocation, setSelectedLocation] = useState('all')


  useEffect(() => {
    loadAnalyticsData()
  }, [timeRange, selectedLocation])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // This would be replaced with actual Supabase queries
      // For now, using mock data that would come from real queries
      const mockData: AnalyticsData = {
        totalUsers: 1247,
        totalRevenue: 12500000,
        totalOrders: 2893,
        totalListings: 3421,
        usersByLocation: [
          { location: 'russia', count: 456, percentage: 36.6 },
          { location: 'uk', count: 234, percentage: 18.8 },
          { location: 'us', count: 189, percentage: 15.2 },
          { location: 'germany', count: 156, percentage: 12.5 },
          { location: 'other', count: 212, percentage: 17.0 }
        ],
        revenueByLocation: [
          { location: 'russia', revenue: 4500000, percentage: 36.0 },
          { location: 'uk', revenue: 2800000, percentage: 22.4 },
          { location: 'us', revenue: 2200000, percentage: 17.6 },
          { location: 'germany', revenue: 1800000, percentage: 14.4 },
          { location: 'other', revenue: 1200000, percentage: 9.6 }
        ],
        currencyDistribution: [
          { currency: 'USD', count: 456, percentage: 36.6 },
          { currency: 'RUB', count: 234, percentage: 18.8 },
          { currency: 'EUR', count: 189, percentage: 15.2 },
          { currency: 'GBP', count: 156, percentage: 12.5 },
          { currency: 'other', count: 212, percentage: 17.0 }
        ],
        featureUsage: [
          { feature: 'can_list', enabled: 3, disabled: 5 },
          { feature: 'can_sell', enabled: 3, disabled: 5 },
          { feature: 'can_buy', enabled: 8, disabled: 0 },
          { feature: 'local_services', enabled: 3, disabled: 5 },
          { feature: 'group_buy', enabled: 3, disabled: 5 }
        ],
        recentActivity: [
          {
            id: 1,
            type: 'user_signup',
            description: 'New user registered from Russia',
            location: 'russia',
            created_at: '2024-01-15T14:30:00Z'
          },
          {
            id: 2,
            type: 'order',
            description: 'Order completed - MacBook Pro sale',
            location: 'uk',
            amount: 120000,
            created_at: '2024-01-15T14:30:00Z'
          },
          {
            id: 3,
            type: 'listing',
            description: 'New listing created - Winter Coat',
            location: 'us',
            amount: 8000,
            created_at: '2024-01-15T12:15:00Z'
          }
        ]
      }

      setData(mockData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLocationName = (location: string) => {
    const names: Record<string, string> = {
      russia: '🇷🇺 Russia',
      uk: '🇬🇧 UK',
      us: '🇺🇸 US',
      germany: '🇩🇪 Germany',
      france: '🇫🇷 France',
      canada: '🇨🇦 Canada',
      australia: '🇦🇺 Australia',
      other: '🌍 Other'
    }
    return names[location] || location
  }

  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      RUB: '₽',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      JPY: '¥'
    }
    return symbols[currency] || currency
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Global marketplace performance and user insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="russia">Russia</SelectItem>
              <SelectItem value="uk">UK</SelectItem>
              <SelectItem value="us">US</SelectItem>
              <SelectItem value="germany">Germany</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.totalRevenue, 'USD')}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{data.totalOrders.toLocaleString()}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Active Listings</p>
                <p className="text-2xl font-bold">{data.totalListings.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+5% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Users by Location
            </CardTitle>
            <CardDescription>
              Distribution of users across different locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.usersByLocation.map((item) => (
                <div key={item.location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{getLocationName(item.location)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue by Location
            </CardTitle>
            <CardDescription>
              Revenue distribution across different locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.revenueByLocation.map((item) => (
                <div key={item.location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{getLocationName(item.location)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-20 text-right">
                      {formatCurrency(item.revenue, 'USD')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currency and Feature Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Currency Distribution
            </CardTitle>
            <CardDescription>
              User preferred currencies across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.currencyDistribution.map((item) => (
                <div key={item.currency} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getCurrencySymbol(item.currency)}</span>
                    <span className="text-sm text-muted-foreground">{item.currency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Feature Usage
            </CardTitle>
            <CardDescription>
              Feature availability across locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.featureUsage.map((item) => (
                <div key={item.feature} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">
                      {item.feature.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {item.enabled} enabled
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {item.disabled} disabled
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest marketplace activity across all locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {activity.type === 'user_signup' && <Users className="h-4 w-4" />}
                    {activity.type === 'order' && <Package className="h-4 w-4" />}
                    {activity.type === 'listing' && <BarChart3 className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {getLocationName(activity.location)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {activity.amount && (
                  <span className="text-sm font-medium text-primary">
                    {formatCurrency(activity.amount, 'USD')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
