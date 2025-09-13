'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@ciuna/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ciuna/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { Avatar } from '@ciuna/ui';
import { 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Settings, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Star,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { formatPrice, formatPriceWithConversion, formatRelativeTime } from '@/lib/utils';
import { CurrencySettings } from '@/components/currency-settings';
import Link from 'next/link';

interface UserListing {
  id: number;
  title: string;
  price_rub: number;
  condition: string;
  status: string;
  city: string;
  district: string;
  photo_urls: string[];
  created_at: string;
  view_count: number;
}

interface UserOrder {
  id: number;
  type: 'buying' | 'selling';
  title: string;
  price_rub: number;
  status: string;
  created_at: string;
  buyer_name?: string;
  seller_name?: string;
  photo_url?: string;
}

interface UserMessage {
  id: number;
  conversation_id: number;
  other_user_name: string;
  other_user_avatar?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [listings, setListings] = useState<UserListing[]>([]);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user's listings
      const listingsResponse = await fetch('/api/user/listings');
      const listingsData = await listingsResponse.json();
      setListings(listingsData || []);

      // Load user's orders
      const ordersResponse = await fetch('/api/user/orders');
      const ordersData = await ordersResponse.json();
      setOrders(ordersData || []);

      // Load user's messages
      const messagesResponse = await fetch('/api/user/messages');
      const messagesData = await messagesResponse.json();
      setMessages(messagesData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'New';
      case 'LIKE_NEW': return 'Like New';
      case 'GOOD': return 'Good';
      case 'FAIR': return 'Fair';
      default: return condition;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
              <p className="text-gray-600 mb-4">You need to be signed in to access your dashboard.</p>
              <Link href="/signin">
                <Button className="w-full">Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {(profile as any)?.first_name || user.email}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sell/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {messages.reduce((sum, msg) => sum + msg.unread_count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Listings */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Recent Listings
                  </CardTitle>
                  <CardDescription>Your latest marketplace listings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {listings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {listing.photo_urls?.[0] ? (
                            <img 
                              src={listing.photo_urls[0]} 
                              alt={listing.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {listing.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(listing.price_rub)} • {listing.city}
                          </p>
                        </div>
                        <Badge className={getStatusColor(listing.status)}>
                          {listing.status}
                        </Badge>
                      </div>
                    ))}
                    {listings.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No listings yet</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard?tab=listings">
                      <Button variant="outline" className="w-full">
                        View All Listings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription>Your latest purchases and sales</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          {order.photo_url ? (
                            <img 
                              src={order.photo_url} 
                              alt={order.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ShoppingCart className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {order.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(order.price_rub)} • {order.type === 'buying' ? 'Buying from' : 'Selling to'} {order.type === 'buying' ? order.seller_name : order.buyer_name}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No orders yet</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <Link href="/dashboard?tab=orders">
                      <Button variant="outline" className="w-full">
                        View All Orders
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Messages */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Recent Messages
                </CardTitle>
                <CardDescription>Your latest conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.slice(0, 5).map((message) => (
                    <div key={message.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <Avatar 
                        className="w-10 h-10"
                        src={message.other_user_avatar}
                        fallback={message.other_user_name.charAt(0).toUpperCase()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {message.other_user_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(message.last_message_at)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {message.last_message}
                        </p>
                      </div>
                      {message.unread_count > 0 && (
                        <Badge className="bg-blue-600 text-white">
                          {message.unread_count}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No messages yet</p>
                  )}
                </div>
                <div className="mt-4">
                  <Link href="/dashboard?tab=messages">
                    <Button variant="outline" className="w-full">
                      View All Messages
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>
              <Link href="/sell/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Listing
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                  <div className="aspect-square bg-gray-200 relative">
                    {listing.photo_urls?.[0] ? (
                      <img 
                        src={listing.photo_urls[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(listing.status)}>
                        {listing.status}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate mb-2">
                      {listing.title}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(listing.price_rub)}
                      </span>
                      <Badge variant="outline">
                        {getConditionLabel(listing.condition)}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.city}, {listing.district}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{listing.view_count} views</span>
                      <span>{formatRelativeTime(listing.created_at)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {listings.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Listings Yet</h3>
                  <p className="text-gray-500 mb-6">Start selling by creating your first listing</p>
                  <Link href="/sell/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Listing
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        {order.photo_url ? (
                          <img 
                            src={order.photo_url} 
                            alt={order.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingCart className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {order.title}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              {order.type === 'buying' ? 'Buying from' : 'Selling to'} {order.type === 'buying' ? order.seller_name : order.buyer_name}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatRelativeTime(order.created_at)}
                              </span>
                              <span className="flex items-center">
                                <CreditCard className="w-4 h-4 mr-1" />
                                {formatPrice(order.price_rub)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusColor(order.status)} mb-2`}>
                              {order.status}
                            </Badge>
                            <p className="text-2xl font-bold text-gray-900">
                              {formatPrice(order.price_rub)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {order.status === 'pending' && (
                            <Button size="sm" variant="outline">
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                          {order.status === 'in_transit' && (
                            <Button size="sm" variant="outline">
                              <Truck className="w-4 h-4 mr-1" />
                              Track Package
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {orders.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                  <p className="text-gray-500 mb-6">Your orders will appear here when you make purchases or sales</p>
                  <Link href="/listings">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Browse Listings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Avatar 
                        className="w-12 h-12"
                        src={message.other_user_avatar}
                        fallback={message.other_user_name.charAt(0).toUpperCase()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {message.other_user_name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {formatRelativeTime(message.last_message_at)}
                            </span>
                            {message.unread_count > 0 && (
                              <Badge className="bg-blue-600 text-white">
                                {message.unread_count}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 truncate">
                          {message.last_message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {messages.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                  <p className="text-gray-500 mb-6">Start conversations by viewing listings or making purchases</p>
                  <Link href="/listings">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Browse Listings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar 
                    className="w-20 h-20"
                    src={profile?.avatar_url}
                    fallback={(profile as any)?.first_name?.[0] || user.email[0]}
                  />
                  <div>
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue={(profile as any)?.first_name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue={(profile as any)?.last_name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue={profile?.phone || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country of Origin
                  </label>
                  <select
                    defaultValue={profile?.country_of_origin || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="JP">Japan</option>
                    <option value="KR">South Korea</option>
                    <option value="CN">China</option>
                    <option value="IN">India</option>
                    <option value="BR">Brazil</option>
                    <option value="MX">Mexico</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      defaultValue={profile?.city || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      defaultValue={profile?.district || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="verified_expat"
                    defaultChecked={profile?.verified_expat || false}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="verified_expat" className="text-sm font-medium text-gray-700">
                    I am a verified expat
                  </label>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                </div>
              </CardContent>
            </Card>

            {/* Currency Settings */}
            <CurrencySettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


                <div className="mt-4">

                  <Link href="/dashboard?tab=messages">

                    <Button variant="outline" className="w-full">

                      View All Messages

                    </Button>

                  </Link>

                </div>

              </CardContent>

            </Card>

          </TabsContent>



          {/* My Listings Tab */}

          <TabsContent value="listings" className="space-y-6">

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-bold text-gray-900">My Listings</h2>

              <Link href="/sell/new">

                <Button className="bg-blue-600 hover:bg-blue-700">

                  <Plus className="w-4 h-4 mr-2" />

                  Create New Listing

                </Button>

              </Link>

            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {listings.map((listing) => (

                <Card key={listing.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">

                  <div className="aspect-square bg-gray-200 relative">

                    {listing.photo_urls?.[0] ? (

                      <img 

                        src={listing.photo_urls[0]} 

                        alt={listing.title}

                        className="w-full h-full object-cover"

                      />

                    ) : (

                      <div className="w-full h-full flex items-center justify-center">

                        <Package className="w-16 h-16 text-gray-400" />

                      </div>

                    )}

                    <div className="absolute top-2 right-2">

                      <Badge className={getStatusColor(listing.status)}>

                        {listing.status}

                      </Badge>

                    </div>

                  </div>

                  <CardContent className="p-4">

                    <h3 className="font-semibold text-gray-900 truncate mb-2">

                      {listing.title}

                    </h3>

                    <div className="flex items-center justify-between mb-2">

                      <span className="text-2xl font-bold text-blue-600">

                        {formatPrice(listing.price_rub)}

                      </span>

                      <Badge variant="outline">

                        {getConditionLabel(listing.condition)}

                      </Badge>

                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-3">

                      <MapPin className="w-4 h-4 mr-1" />

                      {listing.city}, {listing.district}

                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">

                      <span>{listing.view_count} views</span>

                      <span>{formatRelativeTime(listing.created_at)}</span>

                    </div>

                    <div className="flex space-x-2">

                      <Button size="sm" variant="outline" className="flex-1">

                        <Eye className="w-4 h-4 mr-1" />

                        View

                      </Button>

                      <Button size="sm" variant="outline" className="flex-1">

                        <Edit className="w-4 h-4 mr-1" />

                        Edit

                      </Button>

                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">

                        <Trash2 className="w-4 h-4" />

                      </Button>

                    </div>

                  </CardContent>

                </Card>

              ))}

            </div>



            {listings.length === 0 && (

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">

                <CardContent className="text-center py-12">

                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Listings Yet</h3>

                  <p className="text-gray-500 mb-6">Start selling by creating your first listing</p>

                  <Link href="/sell/new">

                    <Button className="bg-blue-600 hover:bg-blue-700">

                      <Plus className="w-4 h-4 mr-2" />

                      Create Your First Listing

                    </Button>

                  </Link>

                </CardContent>

              </Card>

            )}

          </TabsContent>



          {/* Orders Tab */}

          <TabsContent value="orders" className="space-y-6">

            <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>

            

            <div className="space-y-4">

              {orders.map((order) => (

                <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">

                  <CardContent className="p-6">

                    <div className="flex items-start space-x-4">

                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">

                        {order.photo_url ? (

                          <img 

                            src={order.photo_url} 

                            alt={order.title}

                            className="w-full h-full object-cover rounded-lg"

                          />

                        ) : (

                          <ShoppingCart className="w-8 h-8 text-gray-400" />

                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between">

                          <div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-1">

                              {order.title}

                            </h3>

                            <p className="text-gray-600 mb-2">

                              {order.type === 'buying' ? 'Buying from' : 'Selling to'} {order.type === 'buying' ? order.seller_name : order.buyer_name}

                            </p>

                            <div className="flex items-center space-x-4 text-sm text-gray-500">

                              <span className="flex items-center">

                                <Calendar className="w-4 h-4 mr-1" />

                                {formatRelativeTime(order.created_at)}

                              </span>

                              <span className="flex items-center">

                                <CreditCard className="w-4 h-4 mr-1" />

                                {formatPrice(order.price_rub)}

                              </span>

                            </div>

                          </div>

                          <div className="text-right">

                            <Badge className={`${getStatusColor(order.status)} mb-2`}>

                              {order.status}

                            </Badge>

                            <p className="text-2xl font-bold text-gray-900">

                              {formatPrice(order.price_rub)}

                            </p>

                          </div>

                        </div>

                        <div className="mt-4 flex space-x-2">

                          <Button size="sm" variant="outline">

                            <Eye className="w-4 h-4 mr-1" />

                            View Details

                          </Button>

                          {order.status === 'pending' && (

                            <Button size="sm" variant="outline">

                              <CreditCard className="w-4 h-4 mr-1" />

                              Pay Now

                            </Button>

                          )}

                          {order.status === 'in_transit' && (

                            <Button size="sm" variant="outline">

                              <Truck className="w-4 h-4 mr-1" />

                              Track Package

                            </Button>

                          )}

                        </div>

                      </div>

                    </div>

                  </CardContent>

                </Card>

              ))}

            </div>



            {orders.length === 0 && (

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">

                <CardContent className="text-center py-12">

                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>

                  <p className="text-gray-500 mb-6">Your orders will appear here when you make purchases or sales</p>

                  <Link href="/listings">

                    <Button className="bg-blue-600 hover:bg-blue-700">

                      Browse Listings

                    </Button>

                  </Link>

                </CardContent>

              </Card>

            )}

          </TabsContent>



          {/* Messages Tab */}

          <TabsContent value="messages" className="space-y-6">

            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>

            

            <div className="space-y-4">

              {messages.map((message) => (

                <Card key={message.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">

                  <CardContent className="p-6">

                    <div className="flex items-center space-x-4">

                      <Avatar 

                        className="w-12 h-12"

                        src={message.other_user_avatar}

                        fallback={message.other_user_name.charAt(0).toUpperCase()}

                      />

                      <div className="flex-1 min-w-0">

                        <div className="flex items-center justify-between mb-1">

                          <h3 className="text-lg font-semibold text-gray-900">

                            {message.other_user_name}

                          </h3>

                          <div className="flex items-center space-x-2">

                            <span className="text-sm text-gray-500">

                              {formatRelativeTime(message.last_message_at)}

                            </span>

                            {message.unread_count > 0 && (

                              <Badge className="bg-blue-600 text-white">

                                {message.unread_count}

                              </Badge>

                            )}

                          </div>

                        </div>

                        <p className="text-gray-600 truncate">

                          {message.last_message}

                        </p>

                      </div>

                    </div>

                  </CardContent>

                </Card>

              ))}

            </div>



            {messages.length === 0 && (

              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">

                <CardContent className="text-center py-12">

                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages Yet</h3>

                  <p className="text-gray-500 mb-6">Start conversations by viewing listings or making purchases</p>

                  <Link href="/listings">

                    <Button className="bg-blue-600 hover:bg-blue-700">

                      Browse Listings

                    </Button>

                  </Link>

                </CardContent>

              </Card>

            )}

          </TabsContent>



          {/* Profile Tab */}

          <TabsContent value="profile" className="space-y-6">

            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

            

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">

              <CardHeader>

                <CardTitle>Account Information</CardTitle>

                <CardDescription>Manage your account details and preferences</CardDescription>

              </CardHeader>

              <CardContent className="space-y-6">

                <div className="flex items-center space-x-4">

                  <Avatar 

                    className="w-20 h-20"

                    src={profile?.avatar_url}

                    fallback={(profile as any)?.first_name?.[0] || user.email[0]}

                  />

                  <div>

                    <Button variant="outline" size="sm">

                      Change Photo

                    </Button>

                    <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 2MB</p>

                  </div>

                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                      First Name

                    </label>

                    <input

                      type="text"

                      defaultValue={(profile as any)?.first_name || ''}

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                      Last Name

                    </label>

                    <input

                      type="text"

                      defaultValue={(profile as any)?.last_name || ''}

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                    />

                  </div>

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Email

                  </label>

                  <input

                    type="email"

                    defaultValue={user.email}

                    disabled

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"

                  />

                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Phone

                  </label>

                  <input

                    type="tel"

                    defaultValue={profile?.phone || ''}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  />

                </div>



                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">

                    Country of Origin

                  </label>

                  <select

                    defaultValue={profile?.country_of_origin || ''}

                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                  >

                    <option value="">Select Country</option>

                    <option value="US">United States</option>

                    <option value="UK">United Kingdom</option>

                    <option value="DE">Germany</option>

                    <option value="FR">France</option>

                    <option value="IT">Italy</option>

                    <option value="ES">Spain</option>

                    <option value="CA">Canada</option>

                    <option value="AU">Australia</option>

                    <option value="JP">Japan</option>

                    <option value="KR">South Korea</option>

                    <option value="CN">China</option>

                    <option value="IN">India</option>

                    <option value="BR">Brazil</option>

                    <option value="MX">Mexico</option>

                    <option value="other">Other</option>

                  </select>

                </div>



                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                      City

                    </label>

                    <input

                      type="text"

                      defaultValue={profile?.city || ''}

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-700 mb-1">

                      District

                    </label>

                    <input

                      type="text"

                      defaultValue={profile?.district || ''}

                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"

                    />

                  </div>

                </div>



                <div className="flex items-center space-x-2">

                  <input

                    type="checkbox"

                    id="verified_expat"

                    defaultChecked={profile?.verified_expat || false}

                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"

                  />

                  <label htmlFor="verified_expat" className="text-sm font-medium text-gray-700">

                    I am a verified expat

                  </label>

                </div>



                <div className="flex justify-end space-x-4">

                  <Button variant="outline">Cancel</Button>

                  <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>

                </div>

              </CardContent>

            </Card>



            {/* Currency Settings */}

            <CurrencySettings />

          </TabsContent>

        </Tabs>

      </div>

    </div>

  );

}


