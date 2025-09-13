'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@ciuna/ui';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle,
  Eye,
  MessageCircle,
  Star
} from 'lucide-react';
import { db } from '@ciuna/sb';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import type { OrderWithRelations } from '@ciuna/types';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buying' | 'selling'>('buying');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = activeTab === 'buying' 
        ? { buyer_id: user?.id }
        : { seller_id: user?.id };
      
      const { data } = await db.orders.getAll(filters, 1, 50);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Package className="h-5 w-5 text-yellow-500" />;
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'FULFILLING':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <ShoppingBag className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-blue-100 text-blue-800';
      case 'FULFILLING':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Orders
        </h1>
        <p className="text-lg text-gray-600">
          Track your purchases and sales
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('buying')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'buying'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Buying ({orders.filter(o => o.buyer_id === user?.id).length})
            </button>
            <button
              onClick={() => setActiveTab('selling')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'selling'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Selling ({orders.filter(o => o.seller_id === user?.id).length})
            </button>
          </nav>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'buying' 
              ? 'You haven\'t made any purchases yet.' 
              : 'You haven\'t received any orders yet.'}
          </p>
          <Button asChild>
            <a href={activeTab === 'buying' ? '/listings' : '/sell/new'}>
              {activeTab === 'buying' ? 'Start Shopping' : 'Create Listing'}
            </a>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatRelativeTime(order.created_at)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {activeTab === 'buying' ? 'Seller' : 'Buyer'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {activeTab === 'buying' ? order.seller.email : order.buyer.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(order.total_amount_rub)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.listing && (
                      <div className="flex items-center space-x-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {order.listing.photo_urls && order.listing.photo_urls.length > 0 ? (
                            <img
                              src={order.listing.photo_urls[0]}
                              alt={order.listing.title}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{order.listing.title}</h4>
                          <p className="text-sm text-gray-600">
                            {order.listing.city}{order.listing.district && `, ${order.listing.district}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(order.listing.price_rub)}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.vendor_product && (
                      <div className="flex items-center space-x-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {order.vendor_product.photo_urls && order.vendor_product.photo_urls.length > 0 ? (
                            <img
                              src={order.vendor_product.photo_urls[0]}
                              alt={order.vendor_product.name}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{order.vendor_product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Vendor: {order.vendor_product.vendor?.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(order.vendor_product.price_rub)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Delivery Info */}
                    {order.delivery && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Truck className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Delivery Information</span>
                        </div>
                        <p className="text-sm text-blue-800">
                          Status: {order.delivery.status} • 
                          {order.delivery.tracking_code && ` Tracking: ${order.delivery.tracking_code}`}
                        </p>
                      </div>
                    )}

                    {/* Escrow Info */}
                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-green-900">Escrow Protection</p>
                          <p className="text-sm text-green-800">
                            {order.escrow_amount_rub} RUB held in escrow
                          </p>
                        </div>
                        <Badge variant="success">
                          {order.escrow_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    {order.status === 'DELIVERED' && (
                      <Button variant="outline" size="sm">
                        <Star className="h-4 w-4 mr-2" />
                        Leave Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
