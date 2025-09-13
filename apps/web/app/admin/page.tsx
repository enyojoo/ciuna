'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@ciuna/ui';
import AnalyticsDashboard from '../../components/analytics-dashboard';
import { 
  Users, 
  Store, 
  Wrench, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '../../lib/utils';
import type { Profile, VendorWithOwner, ServiceProviderWithProfile, ListingWithRelations } from '@ciuna/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    totalVendors: 0,
    pendingVendors: 0,
    totalServices: 0,
    pendingServices: 0,
    totalListings: 0,
    pendingListings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [pendingServices, setPendingServices] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load pending verifications
      const verifications = await db.profiles.getAll();
      setPendingVerifications(verifications.filter((p: any) => p.verification_status === 'PENDING'));

      // Load pending vendors
      const vendors = await db.vendors.getAll();
      setPendingVendors(vendors.filter((v: any) => v.status === 'PENDING'));

      // Load pending services
      const services = await db.serviceProviders.getAll();
      setPendingServices(services.filter((s: any) => s.status === 'PENDING'));

      // Load recent listings
      const listings = await db.listings.getAll();
      setRecentListings(listings.filter((l: any) => l.status === 'PENDING_REVIEW'));

      // Calculate stats
      setStats({
        totalUsers: 1250,
        pendingVerifications: verifications.filter((p: any) => p.verification_status === 'PENDING').length,
        totalVendors: 180,
        pendingVendors: vendors.filter((v: any) => v.status === 'PENDING').length,
        totalServices: 420,
        pendingServices: services.filter((s: any) => s.status === 'PENDING').length,
        totalListings: 3400,
        pendingListings: listings.filter((l: any) => l.status === 'PENDING_REVIEW').length,
        totalRevenue: 2500000,
        monthlyRevenue: 450000,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVerification = async (profileId: string) => {
    try {
      await db.profiles.update(profileId, { verification_status: 'APPROVED' });
      loadAdminData();
    } catch (error) {
      console.error('Error approving verification:', error);
    }
  };

  const handleRejectVerification = async (profileId: string) => {
    try {
      await db.profiles.update(profileId, { verification_status: 'REJECTED' });
      loadAdminData();
    } catch (error) {
      console.error('Error rejecting verification:', error);
    }
  };

  const handleApproveVendor = async (vendorId: string) => {
    try {
      await db.vendors.update(vendorId, { status: 'ACTIVE' });
      loadAdminData();
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  const handleRejectVendor = async (vendorId: string) => {
    try {
      await db.vendors.update(vendorId, { status: 'SUSPENDED' });
      loadAdminData();
    } catch (error) {
      console.error('Error rejecting vendor:', error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-lg text-gray-600">
          Manage users, vendors, services, and platform operations
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="ciuna-gradient text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 mr-4" />
              <div>
                <p className="text-sm opacity-90">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 mr-4" />
              <div>
                <p className="text-sm opacity-90">Pending Verifications</p>
                <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 mr-4" />
              <div>
                <p className="text-sm opacity-90">Active Vendors</p>
                <p className="text-2xl font-bold">{stats.totalVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 mr-4" />
              <div>
                <p className="text-sm opacity-90">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard isAdmin={true} />
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Platform Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Revenue</span>
                    <span className="font-semibold">{formatPrice(stats.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Listings</span>
                    <span className="font-semibold">{stats.totalListings}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Verified Services</span>
                    <span className="font-semibold">{stats.totalServices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Reviews</span>
                    <span className="font-semibold text-orange-600">{stats.pendingListings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Pending Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-800">User Verifications</span>
                    <Badge variant="destructive">{stats.pendingVerifications}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-800">Vendor Applications</span>
                    <Badge variant="secondary">{stats.pendingVendors}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-800">Service Applications</span>
                    <Badge variant="secondary">{stats.pendingServices}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-800">Listing Reviews</span>
                    <Badge variant="outline">{stats.pendingListings}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Verifications Tab */}
        <TabsContent value="verifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending User Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingVerifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No pending verifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingVerifications.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-semibold">{profile.email.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{profile.email}</p>
                          <p className="text-sm text-gray-600">
                            {profile.country_of_origin} • {profile.city}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied {formatRelativeTime(profile.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveVerification(profile.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectVerification(profile.id)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Vendor Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingVendors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No pending vendor applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Store className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{vendor.name}</p>
                          <p className="text-sm text-gray-600">
                            {vendor.city}, {vendor.country} • {vendor.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied {formatRelativeTime(vendor.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveVendor(vendor.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectVendor(vendor.id)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Service Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingServices.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No pending service applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingServices.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Wrench className="h-6 w-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold">{provider.name}</p>
                          <p className="text-sm text-gray-600">
                            {provider.skills.join(', ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied {formatRelativeTime(provider.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Listing Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {recentListings.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">No pending listing reviews</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentListings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {listing.photo_urls && listing.photo_urls.length > 0 ? (
                            <img
                              src={listing.photo_urls[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <span className="text-2xl">📦</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{listing.title}</p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(listing.price_rub)} • {listing.city}
                          </p>
                          <p className="text-xs text-gray-500">
                            by {listing.seller.email} • {formatRelativeTime(listing.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
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
