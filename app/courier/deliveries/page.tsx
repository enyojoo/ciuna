'use client'

import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Truck, 
  Search, 
  Eye,
  CheckCircle,
  AlertCircle,
  Package,
  Navigation,
  Phone,
  MessageCircle
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { formatCurrency, SupportedCurrency } from '@/lib/currency'
import { useState } from 'react'

export default function CourierDeliveries() {
  const role: UserRole = 'COURIER'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data - in real app, this would come from Supabase
  const deliveries = [
    {
      id: 'DEL-001',
      orderId: 'ORD-001',
      customer: {
        name: 'John Smith',
        phone: '+7 (999) 123-4567',
        address: 'Arbat Street 15, Moscow, Russia'
      },
      vendor: {
        name: 'Tech Store Moscow',
        address: 'Tverskaya Street 10, Moscow, Russia',
        phone: '+7 (495) 123-4567'
      },
      items: [
        { name: 'MacBook Pro 16"', quantity: 1, weight: '2.1 kg' },
        { name: 'Wireless Mouse', quantity: 1, weight: '0.1 kg' }
      ],
      totalWeight: '2.2 kg',
      distance: '12.5 km',
      estimatedTime: '25 min',
      earnings: 1200,
      currency: 'RUB',
      status: 'available',
      priority: 'normal',
      pickupTime: '2024-01-15T14:00:00Z',
      deliveryTime: '2024-01-15T16:00:00Z',
      notes: 'Customer requested express delivery',
      specialInstructions: 'Call before delivery'
    },
    {
      id: 'DEL-002',
      orderId: 'ORD-002',
      customer: {
        name: 'Maria Garcia',
        phone: '+7 (999) 234-5678',
        address: 'Tverskaya Street 25, Moscow, Russia'
      },
      vendor: {
        name: 'Electronics Hub',
        address: 'Kutuzovsky Prospekt 5, Moscow, Russia',
        phone: '+7 (495) 234-5678'
      },
      items: [
        { name: 'iPhone 15 Pro', quantity: 1, weight: '0.2 kg' }
      ],
      totalWeight: '0.2 kg',
      distance: '8.2 km',
      estimatedTime: '15 min',
      earnings: 800,
      currency: 'RUB',
      status: 'in_progress',
      priority: 'high',
      pickupTime: '2024-01-15T10:30:00Z',
      deliveryTime: '2024-01-15T12:00:00Z',
      notes: 'Fragile item - handle with care',
      specialInstructions: 'Ring doorbell twice'
    },
    {
      id: 'DEL-003',
      orderId: 'ORD-003',
      customer: {
        name: 'David Wilson',
        phone: '+7 (999) 345-6789',
        address: 'Red Square 1, Moscow, Russia'
      },
      vendor: {
        name: 'Furniture Store',
        address: 'Leninsky Prospekt 20, Moscow, Russia',
        phone: '+7 (495) 345-6789'
      },
      items: [
        { name: 'Gaming Chair', quantity: 1, weight: '15.0 kg' },
        { name: 'Gaming Desk', quantity: 1, weight: '25.0 kg' }
      ],
      totalWeight: '40.0 kg',
      distance: '5.8 km',
      estimatedTime: '20 min',
      earnings: 1500,
      currency: 'RUB',
      status: 'completed',
      priority: 'normal',
      pickupTime: '2024-01-14T09:00:00Z',
      deliveryTime: '2024-01-14T11:30:00Z',
      notes: 'Heavy items - use elevator',
      specialInstructions: 'Assemble chair if requested',
      completedAt: '2024-01-14T11:30:00Z',
      rating: 5
    },
    {
      id: 'DEL-004',
      orderId: 'ORD-004',
      customer: {
        name: 'Anna Petrov',
        phone: '+7 (999) 456-7890',
        address: 'Nevsky Prospect 50, St. Petersburg, Russia'
      },
      vendor: {
        name: 'Audio Store',
        address: 'Nevsky Prospect 100, St. Petersburg, Russia',
        phone: '+7 (812) 456-7890'
      },
      items: [
        { name: 'Wireless Headphones', quantity: 2, weight: '0.6 kg' }
      ],
      totalWeight: '0.6 kg',
      distance: '3.2 km',
      estimatedTime: '10 min',
      earnings: 600,
      currency: 'RUB',
      status: 'cancelled',
      priority: 'low',
      pickupTime: '2024-01-13T15:00:00Z',
      deliveryTime: '2024-01-13T17:00:00Z',
      notes: 'Customer cancelled order',
      specialInstructions: '',
      cancelledAt: '2024-01-13T14:30:00Z',
      cancellationReason: 'Customer changed mind'
    }
  ]

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || delivery.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default'
      case 'in_progress': return 'secondary'
      case 'completed': return 'default'
      case 'cancelled': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return Package
      case 'in_progress': return Truck
      case 'completed': return CheckCircle
      case 'cancelled': return AlertCircle
      default: return Package
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'normal': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const deliveryStats = {
    total: deliveries.length,
    available: deliveries.filter(d => d.status === 'available').length,
    inProgress: deliveries.filter(d => d.status === 'in_progress').length,
    completed: deliveries.filter(d => d.status === 'completed').length,
    cancelled: deliveries.filter(d => d.status === 'cancelled').length,
    totalEarnings: deliveries.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.earnings, 0)
  }

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Deliveries</h1>
            <p className="text-muted-foreground">
              Manage your delivery jobs and track progress
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Navigation className="h-4 w-4 mr-2" />
              View Map
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{deliveryStats.total}</p>
                </div>
                <Truck className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{deliveryStats.available}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{deliveryStats.inProgress}</p>
                </div>
                <Truck className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{deliveryStats.completed}</p>
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
                  <p className="text-2xl font-bold">{deliveryStats.cancelled}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Earnings</p>
                  <p className="text-2xl font-bold">{formatCurrency(deliveryStats.totalEarnings, 'RUB')}</p>
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
                    placeholder="Search deliveries by ID, customer, or vendor..."
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
                  variant={filterStatus === 'available' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('available')}
                >
                  Available
                </Button>
                <Button
                  variant={filterStatus === 'in_progress' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('in_progress')}
                >
                  In Progress
                </Button>
                <Button
                  variant={filterStatus === 'completed' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('completed')}
                >
                  Completed
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

        {/* Deliveries List */}
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => {
            const StatusIcon = getStatusIcon(delivery.status)
            return (
              <Card key={delivery.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{delivery.id}</h3>
                        </div>
                        <Badge variant={getStatusColor(delivery.status)}>
                          {delivery.status}
                        </Badge>
                        <Badge variant={getPriorityColor(delivery.priority)}>
                          {delivery.priority} priority
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Customer</p>
                          <p className="font-medium">{delivery.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{delivery.customer.phone}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Vendor</p>
                          <p className="font-medium">{delivery.vendor.name}</p>
                          <p className="text-sm text-muted-foreground">{delivery.vendor.phone}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Distance & Time</p>
                          <p className="font-medium">{delivery.distance}</p>
                          <p className="text-sm text-muted-foreground">{delivery.estimatedTime}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Earnings</p>
                          <p className="text-lg font-bold">{formatCurrency(delivery.earnings, delivery.currency as SupportedCurrency)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Pickup Location</p>
                          <p className="font-medium">{delivery.vendor.address}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Delivery Location</p>
                          <p className="font-medium">{delivery.customer.address}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Items</p>
                          <div className="space-y-1">
                            {delivery.items.map((item, index) => (
                              <p key={index} className="text-sm">
                                {item.name} x{item.quantity} ({item.weight})
                              </p>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Total weight: {delivery.totalWeight}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Schedule</p>
                          <p className="text-sm">
                            Pickup: {new Date(delivery.pickupTime).toLocaleString()}
                          </p>
                          <p className="text-sm">
                            Delivery: {new Date(delivery.deliveryTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {(delivery.notes || delivery.specialInstructions) && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Instructions</p>
                          {delivery.notes && <p className="text-sm">{delivery.notes}</p>}
                          {delivery.specialInstructions && (
                            <p className="text-sm font-medium">{delivery.specialInstructions}</p>
                          )}
                        </div>
                      )}
                      
                      {delivery.status === 'completed' && delivery.rating && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            Completed with {delivery.rating}/5 star rating
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {delivery.status === 'available' && (
                        <Button size="sm">
                          Accept Job
                        </Button>
                      )}
                      {delivery.status === 'in_progress' && (
                        <Button size="sm" variant="outline">
                          Mark Complete
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-1" />
                        Call Customer
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredDeliveries.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No deliveries found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Available delivery jobs will appear here'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleLayout>
  )
}
