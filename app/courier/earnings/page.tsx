'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Target,
  Award
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { formatCurrency } from '@/lib/currency'
import { useState } from 'react'

export default function CourierEarnings() {
  const role: UserRole = 'COURIER'
  const [timeFilter, setTimeFilter] = useState('week')

  // Mock data - in real app, this would come from Supabase
  const earningsData = {
    totalEarnings: 125000,
    thisWeek: 25000,
    lastWeek: 22000,
    thisMonth: 85000,
    lastMonth: 78000,
    averagePerDelivery: 800,
    totalDeliveries: 156,
    completedDeliveries: 142,
    pendingPayout: 15000,
    nextPayoutDate: '2024-01-20'
  }

  const earningsHistory = [
    {
      id: 1,
      date: '2024-01-15',
      deliveries: 5,
      earnings: 4000,
      currency: 'RUB',
      status: 'completed',
      bonus: 500,
      tip: 200
    },
    {
      id: 2,
      date: '2024-01-14',
      deliveries: 3,
      earnings: 2400,
      currency: 'RUB',
      status: 'completed',
      bonus: 0,
      tip: 100
    },
    {
      id: 3,
      date: '2024-01-13',
      deliveries: 4,
      earnings: 3200,
      currency: 'RUB',
      status: 'completed',
      bonus: 200,
      tip: 150
    },
    {
      id: 4,
      date: '2024-01-12',
      deliveries: 2,
      earnings: 1600,
      currency: 'RUB',
      status: 'completed',
      bonus: 0,
      tip: 50
    },
    {
      id: 5,
      date: '2024-01-11',
      deliveries: 6,
      earnings: 4800,
      currency: 'RUB',
      status: 'completed',
      bonus: 300,
      tip: 300
    }
  ]

  const weeklyBreakdown = [
    { day: 'Mon', earnings: 3500, deliveries: 4 },
    { day: 'Tue', earnings: 4200, deliveries: 5 },
    { day: 'Wed', earnings: 3800, deliveries: 4 },
    { day: 'Thu', earnings: 4500, deliveries: 6 },
    { day: 'Fri', earnings: 5200, deliveries: 7 },
    { day: 'Sat', earnings: 4800, deliveries: 6 },
    { day: 'Sun', earnings: 0, deliveries: 0 }
  ]

  const achievements = [
    {
      title: 'Speed Demon',
      description: 'Complete 10 deliveries in under 30 minutes each',
      progress: 8,
      target: 10,
      reward: 1000,
      currency: 'RUB'
    },
    {
      title: 'Customer Favorite',
      description: 'Get 5-star rating from 20 customers',
      progress: 15,
      target: 20,
      reward: 2000,
      currency: 'RUB'
    },
    {
      title: 'Weekend Warrior',
      description: 'Complete 20 deliveries on weekends',
      progress: 12,
      target: 20,
      reward: 1500,
      currency: 'RUB'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'pending': return 'secondary'
      case 'cancelled': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'pending': return Clock
      case 'cancelled': return AlertCircle
      default: return Package
    }
  }

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 100
    return Math.round(((current - previous) / previous) * 100)
  }

  const weekGrowth = getGrowthPercentage(earningsData.thisWeek, earningsData.lastWeek)
  const monthGrowth = getGrowthPercentage(earningsData.thisMonth, earningsData.lastMonth)

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Earnings</h1>
            <p className="text-muted-foreground">
              Track your delivery earnings and performance
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold">{formatCurrency(earningsData.totalEarnings, 'RUB')}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">+{monthGrowth}% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-3xl font-bold">{formatCurrency(earningsData.thisWeek, 'RUB')}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                {weekGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${weekGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {weekGrowth >= 0 ? '+' : ''}{weekGrowth}% vs last week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average per Delivery</p>
                  <p className="text-3xl font-bold">{formatCurrency(earningsData.averagePerDelivery, 'RUB')}</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {earningsData.completedDeliveries} completed deliveries
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Payout</p>
                  <p className="text-3xl font-bold">{formatCurrency(earningsData.pendingPayout, 'RUB')}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  Next payout: {new Date(earningsData.nextPayoutDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Earnings Overview</h3>
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
                  variant={timeFilter === 'year' ? 'default' : 'outline'}
                  onClick={() => setTimeFilter('year')}
                >
                  This Year
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Breakdown Chart */}
        {timeFilter === 'week' && (
          <Card>
            <CardHeader>
              <CardTitle>Daily Earnings Breakdown</CardTitle>
              <CardDescription>Your earnings for each day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyBreakdown.map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min((day.earnings / Math.max(...weeklyBreakdown.map(d => d.earnings))) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(day.earnings, 'RUB')}</div>
                      <div className="text-sm text-muted-foreground">{day.deliveries} deliveries</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>
              Complete challenges to earn bonus rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.target}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Reward: {formatCurrency(achievement.reward, achievement.currency)}
                        </span>
                        {achievement.progress >= achievement.target ? (
                          <Badge variant="default">Completed</Badge>
                        ) : (
                          <Badge variant="outline">In Progress</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Earnings History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Earnings</CardTitle>
            <CardDescription>Your latest delivery earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {earningsHistory.map((earning) => {
                const StatusIcon = getStatusIcon(earning.status)
                return (
                  <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{new Date(earning.date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {earning.deliveries} delivery{earning.deliveries !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(earning.earnings, earning.currency)}</div>
                      <div className="text-sm text-muted-foreground">
                        {earning.bonus > 0 && `+${formatCurrency(earning.bonus, earning.currency)} bonus`}
                        {earning.tip > 0 && ` +${formatCurrency(earning.tip, earning.currency)} tip`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payout Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payout Information</CardTitle>
            <CardDescription>Manage your payment settings and view payout history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Bank Transfer • ****1234
                </p>
                <Button variant="outline" size="sm">
                  Update Payment Method
                </Button>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Payout Schedule</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Weekly payouts every Friday
                </p>
                <p className="text-sm text-muted-foreground">
                  Next payout: {new Date(earningsData.nextPayoutDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  )
}
