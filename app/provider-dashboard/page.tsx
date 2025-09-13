'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { 
  Plus, 
  Wrench, 
  Calendar, 
  TrendingUp, 
  Users, 
  Star,
  Eye,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import type { ServiceProviderWithProfile, ServiceWithRelations, ServiceBookingWithRelations } from '@ciuna/types';

export default function ProviderDashboardPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [provider, setProvider] = useState<ServiceProviderWithProfile | null>(null);
  const [services, setServices] = useState<ServiceWithRelations[]>([]);
  const [bookings, setBookings] = useState<ServiceBookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    if (!user || !profile?.verified_expat) {
      router.push('/');
      return;
    }
    loadProviderData();
  }, [user, profile, router]);

  const loadProviderData = async () => {
    try {
      setLoading(true);
      
      // Get service provider profile
      // TODO: Implement getByProfileId method or use getAll with filtering
      setProvider(null);

      // Get services
      // TODO: Fix when provider data is available
      setServices([]);

      // Get bookings
      // TODO: Fix when provider data is available
      setBookings([]);

      // Calculate stats
      const activeServices = 0;
      const pendingBookings = 0;
      const completedBookings = 0;
      
      setStats({
        totalServices: 0,
        activeServices,
        totalBookings: 0,
        pendingBookings,
        completedBookings,
        totalRevenue: 0,
        monthlyRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
      });
    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Provider Account Required</h1>
        <p className="text-gray-600 mb-6">You need to create a service provider account to access this dashboard.</p>
        <Button asChild>
          <Link href="/provider-dashboard/setup">Create Provider Account</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {provider.name}
          </h1>
          <p className="text-lg text-gray-600">
            Manage your services and bookings
          </p>
        </div>
        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/provider-dashboard/services/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/provider-dashboard/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="ciuna-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg">
                <Wrench className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm opacity-90">Total Services</p>
                <p className="text-2xl font-bold">{stats.totalServices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm opacity-90">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm opacity-90">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-white/20 rounded-lg">
                <Star className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm opacity-90">Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Services */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Services</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/provider-dashboard/services">
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first service</p>
                    <Button asChild>
                      <Link href="/provider-dashboard/services/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {services.slice(0, 5).map((service) => (
                      <div key={service.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <Wrench className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {service.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(service.price_rub)} • {service.duration_minutes} min
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={service.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {service.status}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/provider-dashboard/services/${service.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Bookings</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/provider-dashboard/bookings">
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600">Bookings will appear here when clients book your services</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {booking.service.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.scheduled_at).toLocaleDateString()} • {booking.client.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            booking.status === 'PENDING' ? 'secondary' :
                            booking.status === 'CONFIRMED' ? 'default' :
                            booking.status === 'COMPLETED' ? 'success' : 'destructive'
                          }>
                            {booking.status}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/provider-dashboard/bookings/${booking.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild className="h-20 flex-col">
                  <Link href="/provider-dashboard/services/new">
                    <Plus className="h-6 w-6 mb-2" />
                    Add New Service
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-20 flex-col">
                  <Link href="/provider-dashboard/analytics">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    View Analytics
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-20 flex-col">
                  <Link href="/provider-dashboard/settings">
                    <Settings className="h-6 w-6 mb-2" />
                    Provider Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Services</CardTitle>
                <Button asChild>
                  <Link href="/provider-dashboard/services/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No services yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first service to begin receiving bookings</p>
                  <Button asChild>
                    <Link href="/provider-dashboard/services/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Service
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <Card key={service.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                            {service.title}
                          </h3>
                          <Badge variant="outline">{service.category}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatPrice(service.price_rub)}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {service.duration_minutes} min
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="font-medium">{service.rating.toFixed(1)}</span>
                            <span className="text-gray-500 ml-1">({service.review_count})</span>
                          </div>
                          <Badge variant={service.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {service.status}
                          </Badge>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/provider-dashboard/services/${service.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link href={`/provider-dashboard/services/${service.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600">Bookings will appear here when clients book your services</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{booking.service.title}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.scheduled_at).toLocaleString()} • {booking.client.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(booking.service.price_rub)} • {booking.service.duration_minutes} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          booking.status === 'PENDING' ? 'secondary' :
                          booking.status === 'CONFIRMED' ? 'default' :
                          booking.status === 'COMPLETED' ? 'success' : 'destructive'
                        }>
                          {booking.status}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/provider-dashboard/bookings/${booking.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-semibold">{formatPrice(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-semibold">{formatPrice(stats.monthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed Bookings</span>
                    <span className="font-semibold">{stats.completedBookings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-semibold flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      {stats.averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Service completed</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">New booking received</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">New review received</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
