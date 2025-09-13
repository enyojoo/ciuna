'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/lib/ui';
import { 
  Plus, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Star,
  Eye,
  DollarSign,
  BarChart3,
  Settings
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import type { Vendor, VendorProduct, Order } from '@/lib/types';

export default function VendorDashboardPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    if (!user || profile?.role !== 'VENDOR') {
      router.push('/');
      return;
    }
    loadVendorData();
  }, [user, profile, router]);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      
      // Get vendor profile
      const vendorData = await db.vendors.getByOwnerId(user?.id || '');
      setVendor(vendorData);

      if (vendorData) {
        // Get products
        const productsData = await db.products.getAll({ vendor_id: vendorData.id }, 1, 10);
        setProducts(productsData.data);

        // Get recent orders
        const ordersData = await db.orders.getAll({ seller_id: user?.id }, 1, 5);
        setRecentOrders(ordersData.data);

        // Calculate stats
        const activeProducts = productsData.data.filter(p => p.status === 'ACTIVE').length;
        const pendingOrders = ordersData.data.filter(o => o.status === 'PENDING').length;
        
        setStats({
          totalProducts: productsData.data.length,
          activeProducts,
          totalOrders: ordersData.data.length,
          pendingOrders,
          totalRevenue: vendorData.total_sales || 0,
          monthlyRevenue: 0, // This would need to be calculated separately
        });
      }
    } catch (error) {
      console.error('Error loading vendor data:', error);
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

  if (!vendor) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Account Required</h1>
        <p className="text-gray-600 mb-6">You need to create a vendor account to access this dashboard.</p>
        <Button asChild>
          <Link href="/vendor-dashboard/setup">Create Vendor Account</Link>
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
            Welcome back, {vendor.name}
          </h1>
          <p className="text-lg text-gray-600">
            Manage your products and orders
          </p>
        </div>
        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/vendor-dashboard/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/vendor-dashboard/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Products</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/vendor-dashboard/products">
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first product</p>
                <Button asChild>
                  <Link href="/vendor-dashboard/products/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {product.photo_urls && product.photo_urls.length > 0 ? (
                        <img
                          src={product.photo_urls[0]}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(product.price_rub)} • {product.stock_quantity} in stock
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {product.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/vendor-dashboard/products/${product.id}`}>
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

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/vendor-dashboard/orders">
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600">Orders will appear here when customers purchase your products</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(order.total_amount_rub)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        order.status === 'PENDING' ? 'secondary' :
                        order.status === 'PAID' ? 'default' :
                        order.status === 'DELIVERED' ? 'success' : 'destructive'
                      }>
                        {order.status}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/vendor-dashboard/orders/${order.id}`}>
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
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-20 flex-col">
              <Link href="/vendor-dashboard/products/new">
                <Plus className="h-6 w-6 mb-2" />
                Add New Product
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/vendor-dashboard/analytics">
                <BarChart3 className="h-6 w-6 mb-2" />
                View Analytics
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-20 flex-col">
              <Link href="/vendor-dashboard/settings">
                <Settings className="h-6 w-6 mb-2" />
                Vendor Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
