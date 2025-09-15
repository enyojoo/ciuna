'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Search, 
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Download,
  Printer
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { formatCurrency, SupportedCurrency } from '@/lib/currency'
import { useState } from 'react'

export default function VendorOrders() {
  const role: UserRole = 'VENDOR'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data - in real app, this would come from Supabase
  const orders = [
    {
      id: 'ORD-001',
      customer: {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+7 (999) 123-4567'
      },
      items: [
        { name: 'MacBook Pro 16"', quantity: 1, price: 45000 },
        { name: 'Wireless Mouse', quantity: 1, price: 2000 }
      ],
      total: 47000,
      currency: 'RUB' as SupportedCurrency,
      status: 'processing',
      paymentStatus: 'paid',
      shippingAddress: 'Arbat Street 15, Moscow, Russia',
      orderDate: '2024-01-15T10:30:00Z',
      estimatedDelivery: '2024-01-18',
      trackingNumber: 'RU123456789',
      notes: 'Customer requested express delivery'
    },
    {
      id: 'ORD-002',
      customer: {
        name: 'Maria Garcia',
        email: 'maria@example.com',
        phone: '+7 (999) 234-5678'
      },
      items: [
        { name: 'iPhone 15 Pro', quantity: 1, price: 35000 }
      ],
      total: 35000,
      currency: 'RUB' as SupportedCurrency,
      status: 'shipped',
      paymentStatus: 'paid',
      shippingAddress: 'Tverskaya Street 25, Moscow, Russia',
      orderDate: '2024-01-14T14:20:00Z',
      estimatedDelivery: '2024-01-17',
      trackingNumber: 'RU987654321',
      notes: ''
    },
    {
      id: 'ORD-003',
      customer: {
        name: 'David Wilson',
        email: 'david@example.com',
        phone: '+7 (999) 345-6789'
      },
      items: [
        { name: 'Gaming Chair', quantity: 1, price: 8000 },
        { name: 'Gaming Desk', quantity: 1, price: 12000 }
      ],
      total: 20000,
      currency: 'RUB' as SupportedCurrency,
      status: 'delivered',
      paymentStatus: 'paid',
      shippingAddress: 'Red Square 1, Moscow, Russia',
      orderDate: '2024-01-13T09:15:00Z',
      estimatedDelivery: '2024-01-16',
      trackingNumber: 'RU456789123',
      notes: 'Delivered successfully'
    },
    {
      id: 'ORD-004',
      customer: {
        name: 'Anna Petrov',
        email: 'anna@example.com',
        phone: '+7 (999) 456-7890'
      },
      items: [
        { name: 'Wireless Headphones', quantity: 2, price: 5000 }
      ],
      total: 10000,
      currency: 'RUB' as SupportedCurrency,
      status: 'cancelled',
      paymentStatus: 'refunded',
      shippingAddress: 'Nevsky Prospect 50, St. Petersburg, Russia',
      orderDate: '2024-01-12T16:45:00Z',
      estimatedDelivery: '2024-01-15',
      trackingNumber: '',
      notes: 'Customer cancelled due to change of mind'
    }
  ]

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'secondary'
      case 'shipped': return 'default'
      case 'delivered': return 'default'
      case 'cancelled': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return Clock
      case 'shipped': return Truck
      case 'delivered': return CheckCircle
      case 'cancelled': return AlertCircle
      default: return Package
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default'
      case 'pending': return 'secondary'
      case 'refunded': return 'outline'
      default: return 'outline'
    }
  }

  const orderStats = {
    total: orders.length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0)
  }

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-muted-foreground">
              Manage customer orders and fulfillment
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orderStats.total}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">{orderStats.processing}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shipped</p>
                  <p className="text-2xl font-bold">{orderStats.shipped}</p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">{orderStats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold">{orderStats.cancelled}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(orderStats.totalRevenue, 'RUB')}</p>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search orders by ID, customer name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'processing' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('processing')}
                >
                  Processing
                </Button>
                <Button
                  variant={filterStatus === 'shipped' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('shipped')}
                >
                  Shipped
                </Button>
                <Button
                  variant={filterStatus === 'delivered' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('delivered')}
                >
                  Delivered
                </Button>
                <Button
                  variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('cancelled')}
                >
                  Cancelled
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status)
            return (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{order.id}</h3>
                        </div>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Customer</p>
                          <p className="font-medium">{order.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Order Date</p>
                          <p className="font-medium">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.orderDate).toLocaleTimeString()}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Items</p>
                          <p className="font-medium">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items.map(item => item.name).join(', ')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-bold">{formatCurrency(order.total, order.currency)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Shipping Address</p>
                          <p className="font-medium">{order.shippingAddress}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Tracking</p>
                          <p className="font-medium">
                            {order.trackingNumber || 'Not available'}
                          </p>
                          {order.estimatedDelivery && (
                            <p className="text-sm text-muted-foreground">
                              Est. delivery: {order.estimatedDelivery}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {order.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-sm">{order.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Orders will appear here when customers make purchases'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleLayout>
  )
}
