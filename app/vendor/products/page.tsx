'use client'

import Image from 'next/image'
import { RoleLayout } from '@/components/layouts/role-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ResponsiveGrid } from '@/components/ui/responsive-grid'
import { ResponsiveHeader } from '@/components/ui/responsive-header'
import { ResponsiveButtonGroup } from '@/components/ui/responsive-button-group'
import { 
  Package, 
  Plus, 
  Search, 
  Edit,
  Eye,
  MoreHorizontal,
  Star,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { formatCurrency, SupportedCurrency } from '@/lib/currency'
import { useState } from 'react'

export default function VendorProducts() {
  const role: UserRole = 'VENDOR'
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data - in real app, this would come from Supabase
  const products = [
    {
      id: 1,
      name: 'MacBook Pro 16" M3 Max',
      description: 'Latest MacBook Pro with M3 Max chip, 32GB RAM, 1TB SSD',
      price: 45000,
      originalPrice: 50000,
      currency: 'RUB',
      category: 'Electronics',
      status: 'active',
      stock: 5,
      sold: 12,
      rating: 4.8,
      reviews: 24,
      image: '/placeholder-product.jpg',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'iPhone 15 Pro 256GB',
      description: 'Latest iPhone with titanium design and A17 Pro chip',
      price: 35000,
      originalPrice: 38000,
      currency: 'RUB',
      category: 'Mobile Phones',
      status: 'active',
      stock: 8,
      sold: 8,
      rating: 4.9,
      reviews: 18,
      image: '/placeholder-product.jpg',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-14'
    },
    {
      id: 3,
      name: 'Gaming Chair Pro',
      description: 'Ergonomic gaming chair with lumbar support and RGB lighting',
      price: 8000,
      originalPrice: 10000,
      currency: 'RUB',
      category: 'Furniture',
      status: 'draft',
      stock: 0,
      sold: 15,
      rating: 4.6,
      reviews: 32,
      image: '/placeholder-product.jpg',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-13'
    },
    {
      id: 4,
      name: 'Wireless Headphones',
      description: 'Noise-cancelling wireless headphones with 30-hour battery',
      price: 5000,
      originalPrice: 6000,
      currency: 'RUB',
      category: 'Accessories',
      status: 'inactive',
      stock: 12,
      sold: 3,
      rating: 4.2,
      reviews: 8,
      image: '/placeholder-product.jpg',
      createdAt: '2024-01-05',
      updatedAt: '2024-01-10'
    }
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'draft': return 'secondary'
      case 'inactive': return 'outline'
      default: return 'outline'
    }
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-500' }
    if (stock < 5) return { text: 'Low Stock', color: 'text-orange-500' }
    return { text: 'In Stock', color: 'text-green-500' }
  }

  return (
    <RoleLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <ResponsiveHeader
          title="Products"
          description="Manage your product catalog"
          mobileStack={true}
        >
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </ResponsiveHeader>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <ResponsiveButtonGroup wrap={true} spacing="sm">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className="flex-1 sm:flex-none"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('active')}
                  className="flex-1 sm:flex-none"
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'draft' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('draft')}
                  className="flex-1 sm:flex-none"
                >
                  Draft
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('inactive')}
                  className="flex-1 sm:flex-none"
                >
                  Inactive
                </Button>
              </ResponsiveButtonGroup>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        <ResponsiveGrid 
          cols={{ default: 1, sm: 2, md: 2, lg: 3 }}
          gap="lg"
        >
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock)
            return (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square bg-muted relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={getStatusColor(product.status)}>
                      {product.status}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-white">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold">{formatCurrency(product.price, product.currency as SupportedCurrency)}</p>
                        {product.originalPrice > product.price && (
                          <p className="text-sm text-muted-foreground line-through">
                            {formatCurrency(product.originalPrice, product.currency as SupportedCurrency)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.stock} in stock
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{product.rating}</span>
                        <span className="text-muted-foreground">({product.reviews})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{product.sold} sold</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
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
        </ResponsiveGrid>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first product'
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Products</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">
                    {products.reduce((sum, p) => sum + p.sold, 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.stock < 5 && p.stock > 0).length}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleLayout>
  )
}
