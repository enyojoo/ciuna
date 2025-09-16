'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Menu, 
  ShoppingCart, 
  MessageCircle, 
  User, 
  LogOut, 
  Search, 
  Store, 
  FileText, 
  Settings, 
  Grid3X3,
  Plus,
  Heart,
  Bell,
  MapPin,
  ChevronDown,
  ChevronRight,
  Car,
  Home,
  Briefcase,
  Paintbrush,
  Shirt,
  Box,
  Wrench,
  Smartphone,
  Gamepad2,
  Cat,
  BookOpen,
  Music,
  Camera,
  Laptop,
  Headphones,
  Baby,
  Sofa
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useFeatureAccess } from '@/lib/contexts/location-context'

import { UserRole } from '@/lib/auth/access-control'
import { NavigationItem } from '@/lib/navigation/role-navigation'

interface NavigationProps {
  user?: {
    email?: string;
    name?: string;
    role?: string;
    avatar_url?: string | null;
    first_name?: string;
    last_name?: string;
  } | null
  onSignOut?: () => void
  role?: UserRole
  navigation?: NavigationItem[]
  userNavigation?: NavigationItem[]
}

export function Navigation({ user, onSignOut, navigation, userNavigation }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const { canAccess } = useFeatureAccess()

  const baseUserNav = userNavigation || [
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Inbox', href: '/inbox', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  // Add admin navigation if user is admin
  const userNav = [...baseUserNav]
  if (user?.role === 'ADMIN' && !userNav.find(item => item.name === 'Admin')) {
    userNav.push({ name: 'Admin', href: '/admin', icon: Settings })
  }

  // Categories data for dropdown
  const categories = [
    {
      id: 1,
      name: 'Transport',
      icon: Car,
      color: 'text-green-600',
      subcategories: [
        { name: 'Cars', href: '/categories/transport/cars' },
        { name: 'Motorcycles', href: '/categories/transport/motorcycles' },
        { name: 'Trucks', href: '/categories/transport/trucks' },
        { name: 'Water Transport', href: '/categories/transport/water' },
        { name: 'Spare Parts', href: '/categories/transport/parts' }
      ]
    },
    {
      id: 2,
      name: 'Real Estate',
      icon: Home,
      color: 'text-blue-600',
      subcategories: [
        { name: 'Apartments', href: '/categories/real-estate/apartments' },
        { name: 'Houses', href: '/categories/real-estate/houses' },
        { name: 'Commercial', href: '/categories/real-estate/commercial' },
        { name: 'Land', href: '/categories/real-estate/land' }
      ]
    },
    {
      id: 3,
      name: 'Jobs',
      icon: Briefcase,
      color: 'text-purple-600',
      subcategories: [
        { name: 'IT & Tech', href: '/categories/jobs/it' },
        { name: 'Finance', href: '/categories/jobs/finance' },
        { name: 'Marketing', href: '/categories/jobs/marketing' },
        { name: 'Education', href: '/categories/jobs/education' }
      ]
    },
    {
      id: 4,
      name: 'Services',
      icon: Paintbrush,
      color: 'text-orange-600',
      subcategories: [
        { name: 'Legal Services', href: '/categories/services/legal' },
        { name: 'Language Tutoring', href: '/categories/services/language' },
        { name: 'Home Services', href: '/categories/services/home' },
        { name: 'Business Services', href: '/categories/services/business' }
      ]
    },
    {
      id: 5,
      name: 'Personal Items',
      icon: Shirt,
      color: 'text-pink-600',
      subcategories: [
        { name: 'Clothing', href: '/categories/personal/clothing' },
        { name: 'Shoes', href: '/categories/personal/shoes' },
        { name: 'Accessories', href: '/categories/personal/accessories' },
        { name: 'Jewelry', href: '/categories/personal/jewelry' }
      ]
    },
    {
      id: 6,
      name: 'Home & Garden',
      icon: Sofa,
      color: 'text-green-600',
      subcategories: [
        { name: 'Furniture', href: '/categories/home/furniture' },
        { name: 'Appliances', href: '/categories/home/appliances' },
        { name: 'Garden Tools', href: '/categories/home/garden' },
        { name: 'Home Decor', href: '/categories/home/decor' }
      ]
    },
    {
      id: 7,
      name: 'Electronics',
      icon: Smartphone,
      color: 'text-blue-600',
      subcategories: [
        { name: 'Phones', href: '/categories/electronics/phones' },
        { name: 'Computers', href: '/categories/electronics/computers' },
        { name: 'Audio', href: '/categories/electronics/audio' },
        { name: 'Cameras', href: '/categories/electronics/cameras' }
      ]
    },
    {
      id: 8,
      name: 'Hobbies & Recreation',
      icon: Gamepad2,
      color: 'text-yellow-600',
      subcategories: [
        { name: 'Sports', href: '/categories/hobbies/sports' },
        { name: 'Music', href: '/categories/hobbies/music' },
        { name: 'Books', href: '/categories/hobbies/books' },
        { name: 'Collectibles', href: '/categories/hobbies/collectibles' }
      ]
    },
    {
      id: 9,
      name: 'Animals',
      icon: Cat,
      color: 'text-orange-600',
      subcategories: [
        { name: 'Dogs', href: '/categories/animals/dogs' },
        { name: 'Cats', href: '/categories/animals/cats' },
        { name: 'Birds', href: '/categories/animals/birds' },
        { name: 'Fish', href: '/categories/animals/fish' }
      ]
    }
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-8 text-sm">
            {/* Left side - Business links */}
            <div className="flex items-center space-x-6">
              <Link href="/business" className="text-gray-600 hover:text-gray-900">
                For Business
              </Link>
              <Link href="/careers" className="text-gray-600 hover:text-gray-900">
                Careers at Ciuna
              </Link>
              <Link href="/help" className="text-gray-600 hover:text-gray-900">
                Help
              </Link>
              <Link href="/catalogs" className="text-gray-600 hover:text-gray-900">
                Catalogs
              </Link>
              <Link href="/ihelp" className="text-gray-600 hover:text-gray-900">
                #iHelp
              </Link>
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sell/new" className="flex items-center space-x-1">
                  <Plus className="h-4 w-4" />
                  <span>Create Listing</span>
                </Link>
              </Button>
              <Link href="/my-listings" className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>My Listings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center space-x-1">
              <div className="w-6 h-6 rounded-full bg-red-500"></div>
              <div className="w-6 h-6 rounded-full bg-green-500"></div>
              <div className="w-6 h-6 rounded-full bg-blue-500"></div>
              <div className="w-6 h-6 rounded-full bg-orange-500"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">Ciuna</span>
          </Link>

          {/* Categories Button */}
          <div className="relative">
            <Button
              variant="outline"
              className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white px-6 py-2 h-10"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              All Categories
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>

            {/* Category Dropdown */}
            {isCategoryOpen && (
              <div className="absolute top-full left-0 mt-2 w-[800px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="flex">
                  {/* Left Column - Main Categories */}
                  <div className="w-1/3 border-r border-gray-200">
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                      <div className="space-y-1">
                        {categories.map((category) => {
                          const Icon = category.icon
                          return (
                            <div key={category.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <div className="flex items-center space-x-3">
                                <Icon className={`h-5 w-5 ${category.color}`} />
                                <span className="text-sm font-medium text-gray-900">{category.name}</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Subcategories */}
                  <div className="w-2/3 p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Transport</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Transport</h4>
                        <div className="space-y-1">
                          <Link href="/categories/transport/cars" className="block text-sm text-gray-600 hover:text-blue-600">Cars</Link>
                          <Link href="/categories/transport/motorcycles" className="block text-sm text-gray-600 hover:text-blue-600">Motorcycles</Link>
                          <Link href="/categories/transport/trucks" className="block text-sm text-gray-600 hover:text-blue-600">Trucks</Link>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="space-y-1">
                            <Link href="/services/car-valuation" className="block text-sm text-blue-600 hover:text-blue-700">Car Valuation</Link>
                            <Link href="/services/car-history" className="block text-sm text-blue-600 hover:text-blue-700">Car History Check</Link>
                            <Link href="/services/insurance" className="block text-sm text-blue-600 hover:text-blue-700">Insurance</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search listings, services, products..."
                className="pl-10 pr-20 py-2 h-10 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <Button className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-blue-600 hover:bg-blue-700">
                Find
              </Button>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center space-x-1 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Moscow</span>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">1</Badge>
                </Button>
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">3</Badge>
                </Button>
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                        <AvatarFallback>
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {userNav.map((item) => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link href={item.href} className="flex items-center">
                            <Icon className="mr-2 h-4 w-4" />
                            {item.name}
                            {'badge' in item && item.badge && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/user/auth/sign-in">Sign In</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href="/user/auth/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                    </div>
                    <span className="text-lg font-bold text-gray-900">Ciuna</span>
                  </div>

                  {/* Mobile Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search listings, services..."
                      className="pl-10 pr-4 py-2 h-10"
                    />
                  </div>

                  {/* Mobile Categories */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">Categories</h3>
                    {categories.slice(0, 6).map((category) => {
                      const Icon = category.icon
                      return (
                        <Link
                          key={category.id}
                          href={`/categories/${category.name.toLowerCase()}`}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className={`h-5 w-5 ${category.color}`} />
                          <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        </Link>
                      )
                    })}
                  </div>

                  {user ? (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 p-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} alt={user.name} />
                          <AvatarFallback>
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {userNav.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                            {'badge' in item && item.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        )
                      })}
                      <Button
                        variant="ghost"
                        className="justify-start"
                        onClick={() => {
                          onSignOut?.()
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button variant="ghost" asChild>
                        <Link href="/user/auth/sign-in" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/user/auth/sign-up" onClick={() => setIsOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}