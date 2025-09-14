import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  Truck,
  Star,
  MessageCircle,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice, getStatusLabel, formatDate } from '@/lib/utils'

// Mock data - in real app, this would come from Supabase
const mockOrders = [
  {
    id: 1,
    type: 'buying' as const,
    status: 'DELIVERED' as const,
    total: 120000,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-18T14:20:00Z',
    listing: {
      id: 1,
      title: 'MacBook Pro 13-inch M2 Chip',
      photo_urls: ['/api/placeholder/100/100']
    },
    seller: {
      first_name: 'John',
      last_name: 'Smith',
      verified_expat: true
    },
    delivery: {
      status: 'DELIVERED' as const,
      tracking_code: 'RU123456789'
    }
  },
  {
    id: 2,
    type: 'selling' as const,
    status: 'FULFILLING' as const,
    total: 25000,
    created_at: '2024-01-14T15:45:00Z',
    updated_at: '2024-01-16T09:30:00Z',
    listing: {
      id: 2,
      title: 'IKEA Dining Table - White',
      photo_urls: ['/api/placeholder/100/100']
    },
    buyer: {
      first_name: 'Maria',
      last_name: 'Garcia',
      verified_expat: true
    },
    delivery: {
      status: 'IN_TRANSIT' as const,
      tracking_code: 'RU987654321'
    }
  },
  {
    id: 3,
    type: 'buying' as const,
    status: 'PAID' as const,
    total: 5000,
    created_at: '2024-01-13T09:20:00Z',
    updated_at: '2024-01-13T09:20:00Z',
    listing: {
      id: 3,
      title: 'Russian Language Books - Complete Set',
      photo_urls: ['/api/placeholder/100/100']
    },
    seller: {
      first_name: 'Alex',
      last_name: 'Johnson',
      verified_expat: true
    },
    delivery: {
      status: 'CREATED' as const,
      tracking_code: null
    }
  },
  {
    id: 4,
    type: 'selling' as const,
    status: 'CANCELLED' as const,
    total: 8000,
    created_at: '2024-01-12T14:10:00Z',
    updated_at: '2024-01-13T10:15:00Z',
    listing: {
      id: 4,
      title: 'Winter Coat - Size M',
      photo_urls: ['/api/placeholder/100/100']
    },
    buyer: {
      first_name: 'Sarah',
      last_name: 'Wilson',
      verified_expat: true
    },
    delivery: {
      status: 'RETURNED' as const,
      tracking_code: 'RU555666777'
    }
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4" />
    case 'PAID':
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    case 'FULFILLING':
      return <Package className="h-4 w-4 text-orange-500" />
    case 'DELIVERED':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'CANCELLED':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getDeliveryStatusIcon = (status: string) => {
  switch (status) {
    case 'CREATED':
      return <Package className="h-4 w-4 text-gray-500" />
    case 'PICKED_UP':
      return <Truck className="h-4 w-4 text-blue-500" />
    case 'IN_TRANSIT':
      return <Truck className="h-4 w-4 text-orange-500" />
    case 'OUT_FOR_DELIVERY':
      return <Truck className="h-4 w-4 text-purple-500" />
    case 'DELIVERED':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'RETURNED':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Package className="h-4 w-4 text-gray-500" />
  }
}

export default async function OrdersPage() {
  const t = await getTranslations('orders')
  const buyingOrders = mockOrders.filter(order => order.type === 'buying')
  const sellingOrders = mockOrders.filter(order => order.type === 'selling')

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            Track your purchases and sales
          </p>
        </div>

        <Tabs defaultValue="buying" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buying" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>{t('buying')}</span>
              <Badge variant="secondary" className="ml-2">
                {buyingOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="selling" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>{t('selling')}</span>
              <Badge variant="secondary" className="ml-2">
                {sellingOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Buying Orders */}
          <TabsContent value="buying" className="space-y-4">
            {buyingOrders.length > 0 ? (
              buyingOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4">
                        <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0">
                          <img
                            src={order.listing.photo_urls[0]}
                            alt={order.listing.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">
                            {order.listing.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2">
                            Sold by {order.seller.first_name} {order.seller.last_name}
                            {order.seller.verified_expat && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Verified
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{t('order_id')}: #{order.id}</span>
                            <span>{t('order_date')}: {formatDate(order.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {formatPrice(order.total)}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(order.status)}
                          <Badge variant={
                            ['DELIVERED'].includes(order.status) ? 'default' :
                            ['CANCELLED'].includes(order.status) ? 'destructive' :
                            'secondary'
                          }>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        {order.delivery && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {getDeliveryStatusIcon(order.delivery.status)}
                            <span>{getStatusLabel(order.delivery.status)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        {order.delivery?.tracking_code && (
                          <span className="text-sm text-muted-foreground">
                            Tracking: {order.delivery.tracking_code}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('view_details')}
                          </Link>
                        </Button>
                        {order.status === 'DELIVERED' && (
                          <Button variant="outline" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            {t('leave_review')}
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start shopping to see your orders here
                </p>
                <Button asChild>
                  <Link href="/listings">Browse Listings</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Selling Orders */}
          <TabsContent value="selling" className="space-y-4">
            {sellingOrders.length > 0 ? (
              sellingOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-4">
                        <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0">
                          <img
                            src={order.listing.photo_urls[0]}
                            alt={order.listing.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1">
                            {order.listing.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2">
                            Sold to {order.buyer.first_name} {order.buyer.last_name}
                            {order.buyer.verified_expat && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Verified
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{t('order_id')}: #{order.id}</span>
                            <span>{t('order_date')}: {formatDate(order.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {formatPrice(order.total)}
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(order.status)}
                          <Badge variant={
                            ['DELIVERED'].includes(order.status) ? 'default' :
                            ['CANCELLED'].includes(order.status) ? 'destructive' :
                            'secondary'
                          }>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        {order.delivery && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {getDeliveryStatusIcon(order.delivery.status)}
                            <span>{getStatusLabel(order.delivery.status)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        {order.delivery?.tracking_code && (
                          <span className="text-sm text-muted-foreground">
                            Tracking: {order.delivery.tracking_code}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('view_details')}
                          </Link>
                        </Button>
                        {order.status === 'FULFILLING' && (
                          <Button variant="outline" size="sm">
                            <Truck className="h-4 w-4 mr-2" />
                            Update Shipping
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start selling to see your orders here
                </p>
                <Button asChild>
                  <Link href="/sell/new">Create Listing</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
