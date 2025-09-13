'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { Progress } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { BusinessService, BusinessGoal, BusinessNotification, InventoryItem } from '@ciuna/sb';
import { useAuth } from '../lib/auth-context';
import { useI18n } from '../contexts/i18n-context';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Plus
} from 'lucide-react';

interface BusinessDashboardProps {
  userId: string;
}

export default function BusinessDashboard({ userId }: BusinessDashboardProps) {
  const { formatPrice } = useI18n();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [goals, setGoals] = useState<BusinessGoal[]>([]);
  const [notifications, setNotifications] = useState<BusinessNotification[]>([]);
  const [lowInventory, setLowInventory] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await BusinessService.getBusinessDashboard(userId);
      
      setMetrics(dashboardData.metrics);
      setGoals(dashboardData.goals);
      setNotifications(dashboardData.notifications);
      setLowInventory(dashboardData.lowInventory);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await BusinessService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-100';
      case 'HIGH':
        return 'text-orange-600 bg-orange-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getGoalStatusColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Business Dashboard</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="notifications">Alerts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(metrics.total_revenue || 0, 'RUB')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_orders || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total_customers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Unique customers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(metrics.avg_order_value || 0, 'RUB')}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per order
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Active Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Active Goals</CardTitle>
              <CardDescription>Track your business objectives</CardDescription>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No active goals
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Set goals to track your business progress.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.slice(0, 3).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{goal.title}</h4>
                        <span className={`text-sm font-medium ${getGoalStatusColor(goal.progress_percentage)}`}>
                          {goal.progress_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={goal.progress_percentage} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                        <span>{goal.end_date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Important business notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-600">
                    No new notifications at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        !notification.is_read ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {notification.priority === 'URGENT' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <Badge className={getPriorityColor(notification.priority)}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkNotificationAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Goals</CardTitle>
              <CardDescription>Set and track your business objectives</CardDescription>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No goals set
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create goals to track your business progress and stay motivated.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {goals.map((goal) => (
                    <div key={goal.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {goal.title}
                          </h3>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {goal.description}
                            </p>
                          )}
                        </div>
                        <Badge className={getGoalStatusColor(goal.progress_percentage)}>
                          {goal.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">
                            {goal.current_value} / {goal.target_value} {goal.unit}
                          </span>
                        </div>
                        <Progress value={goal.progress_percentage} className="h-3" />
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{goal.progress_percentage.toFixed(1)}% complete</span>
                          <span>Due: {new Date(goal.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>Items running low on stock</CardDescription>
            </CardHeader>
            <CardContent>
              {lowInventory.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All items in stock
                  </h3>
                  <p className="text-gray-600">
                    No low inventory alerts at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            SKU: {item.sku || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-orange-600">
                          {item.quantity} left
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.min_quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>Manage your business alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-600">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border ${
                        !notification.is_read 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {notification.priority === 'URGENT' ? (
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        ) : notification.priority === 'HIGH' ? (
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {!notification.is_read && (
                              <Badge variant="secondary">New</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkNotificationAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
