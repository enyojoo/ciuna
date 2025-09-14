'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Eye, 
  Star,
  MessageCircle,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { formatCurrency, SupportedCurrency } from '@/lib/currency'

export default function UserPurchases() {
  const role: UserRole = 'USER'

  // Mock data - in real app, this would come from Supabase
  const purchases = [
    {
      id: 1,
      orderNumber: 'ORD-001',
      seller: 'Tech Store Moscow',
      items: [
        {
          title: 'MacBook Pro 16" M2 Max',
          price: 45000,
          currency: 'RUB',
          quantity: 1,
          image: '/placeholder-laptop.jpg'
        }
      ],
      total: 45000,
      currency: 'RUB',
      status: 'delivered',
      orderDate: '2024-01-15',
      deliveryDate: '2024-01-17',
      trackingNumber: 'TRK123456789'
    },
    {
      id: 2,
      orderNumber: 'ORD-002',
      seller: 'Electronics Hub',
      items: [
        {
          title: 'iPhone 15 Pro 256GB',
          price: 35000,
          currency: 'RUB',
          quantity: 1,
          image: '/placeholder-phone.jpg'
        },
        {
          title: 'AirPods Pro 2nd Gen',
          price: 12000,
          currency: 'RUB',
          quantity: 1,
          image: '/placeholder-airpods.jpg'
        }
      ],
      total: 47000,
      currency: 'RUB',
      status: 'shipped',
      orderDate: '2024-01-12',
      estimatedDelivery: '2024-01-20',
      trackingNumber: 'TRK987654321'
    },
    {
      id: 3,
      orderNumber: 'ORD-003',
      seller: 'Fashion Store',
      items: [
        {
          title: 'Winter Jacket - Size L',
          price: 8000,
          currency: 'RUB',
          quantity: 1,
          image: '/placeholder-jacket.jpg'
        }
      ],
      total: 8000,
      currency: 'RUB',
      status: 'processing',
      orderDate: '2024-01-18',
      estimatedDelivery: '2024-01-25'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'shipped':
        return <Truck className="h-4 w-4 text-blue-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      delivered: 'default',
      shipped: 'secondary',
      processing: 'outline',
      cancelled: 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Purchases</h1>
            <p className="text-muted-foreground">
              Track your orders and purchase history
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Order History
            </Button>
          </div>
        </div>

        {/* Purchase List */}
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(purchase.status)}
                      <div>
                        <h3 className="font-medium">Order {purchase.orderNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          From {purchase.seller} • {new Date(purchase.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(purchase.total, purchase.currency as SupportedCurrency)}
                      </div>
                      {getStatusBadge(purchase.status)}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {purchase.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(item.price, item.currency as SupportedCurrency)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Details */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {purchase.status === 'delivered' && (
                        <>Delivered on {new Date(purchase.deliveryDate!).toLocaleDateString()}</>
                      )}
                      {purchase.status === 'shipped' && (
                        <>Estimated delivery: {new Date(purchase.estimatedDelivery!).toLocaleDateString()}</>
                      )}
                      {purchase.status === 'processing' && (
                        <>Processing your order...</>
                      )}
                      {purchase.trackingNumber && (
                        <div className="mt-1">
                          Tracking: {purchase.trackingNumber}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {purchase.status === 'delivered' && (
                        <>
                          <Button variant="outline" size="sm">
                            <Star className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Contact Seller
                          </Button>
                        </>
                      )}
                      {purchase.status === 'shipped' && (
                        <Button variant="outline" size="sm">
                          <Truck className="h-4 w-4 mr-1" />
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

        {/* Empty State */}
        {purchases.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
              <p className="text-muted-foreground mb-4">
                Start shopping to see your purchases here
              </p>
              <Button>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Purchase Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{purchases.length}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {purchases.filter(p => p.status === 'delivered').length}
              </div>
              <div className="text-sm text-muted-foreground">Delivered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {purchases.filter(p => p.status === 'shipped').length}
              </div>
              <div className="text-sm text-muted-foreground">In Transit</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(
                  purchases.reduce((sum, p) => sum + p.total, 0),
                  'RUB'
                )}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleLayout>
  )
}
