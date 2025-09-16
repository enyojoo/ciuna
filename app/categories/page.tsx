'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  Car, 
  Home, 
  Briefcase, 
  Wrench, 
  Shirt, 
  Sofa, 
  Smartphone, 
  Gamepad2, 
  Cat,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

// Category data - in real app, this would come from Supabase
const categories = [
  {
    id: 1,
    name: 'Transport',
    slug: 'transport',
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Cars, motorcycles, trucks, and transportation-related items',
    listingCount: 1247,
    productCount: 89
  },
  {
    id: 2,
    name: 'Real Estate',
    slug: 'real-estate',
    icon: Home,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Apartments, houses, commercial properties, and land',
    listingCount: 892,
    productCount: 156
  },
  {
    id: 3,
    name: 'Jobs',
    slug: 'jobs',
    icon: Briefcase,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Employment opportunities across various industries',
    listingCount: 456,
    productCount: 0
  },
  {
    id: 4,
    name: 'Services',
    slug: 'services',
    icon: Wrench,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Professional services for the expat community',
    listingCount: 234,
    productCount: 67
  },
  {
    id: 5,
    name: 'Personal Items',
    slug: 'personal-items',
    icon: Shirt,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: 'Clothing, accessories, and personal belongings',
    listingCount: 1234,
    productCount: 345
  },
  {
    id: 6,
    name: 'Home & Garden',
    slug: 'home-garden',
    icon: Sofa,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Furniture, appliances, and home improvement items',
    listingCount: 789,
    productCount: 234
  },
  {
    id: 7,
    name: 'Electronics',
    slug: 'electronics',
    icon: Smartphone,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Phones, computers, audio equipment, and gadgets',
    listingCount: 567,
    productCount: 345
  },
  {
    id: 8,
    name: 'Hobbies & Recreation',
    slug: 'hobbies-recreation',
    icon: Gamepad2,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Sports, music, books, and recreational activities',
    listingCount: 456,
    productCount: 123
  },
  {
    id: 9,
    name: 'Animals',
    slug: 'animals',
    icon: Cat,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'Pets, pet supplies, and animal-related items',
    listingCount: 234,
    productCount: 45
  }
]

export default function CategoriesPage() {

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-background to-secondary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Browse Categories
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover items and services across all categories in our expat marketplace
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${category.bgColor} flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                          {category.description}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{category.listingCount} listings</span>
                          {category.productCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{category.productCount} products</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-muted/30 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Marketplace Statistics</h3>
            <p className="text-muted-foreground">Join thousands of expats buying and selling in Russia</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {categories.reduce((sum, cat) => sum + cat.listingCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Active Listings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {categories.reduce((sum, cat) => sum + cat.productCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Vendor Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {categories.length}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
