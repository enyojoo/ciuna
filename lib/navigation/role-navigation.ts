import { 
  Home, 
  Search, 
  Package, 
  ShoppingCart, 
  Heart, 
  BarChart3, 
  Store, 
  TrendingUp, 
  Truck, 
  DollarSign, 
  Users, 
  Settings, 
  MessageCircle, 
  User,
  Shield,
  FileText,
  MapPin,
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  requiresFeature?: string
  requiresRole?: UserRole[]
  external?: boolean
}

export const getNavigationByRole = (role: UserRole): NavigationItem[] => {
  const baseNavigation: NavigationItem[] = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse', href: '/listings', icon: Search },
    { name: 'Vendors', href: '/vendors', icon: Store },
    { name: 'Services', href: '/services', icon: FileText, requiresFeature: 'services' }
  ]

  const roleNavigation: Record<UserRole, NavigationItem[]> = {
    USER: [
      ...baseNavigation,
      { name: 'Dashboard', href: '/user/dashboard', icon: BarChart3 },
      { name: 'My Listings', href: '/user/listings', icon: Package },
      { name: 'Purchases', href: '/user/purchases', icon: ShoppingCart },
      { name: 'Wishlist', href: '/user/wishlist', icon: Heart }
    ],
    VENDOR: [
      ...baseNavigation,
      { name: 'Dashboard', href: '/vendor/dashboard', icon: BarChart3 },
      { name: 'Store', href: '/vendor/store', icon: Store },
      { name: 'Products', href: '/vendor/products', icon: Package },
      { name: 'Orders', href: '/vendor/orders', icon: ShoppingCart },
      { name: 'Analytics', href: '/vendor/analytics', icon: TrendingUp }
    ],
    COURIER: [
      ...baseNavigation,
      { name: 'Dashboard', href: '/courier/dashboard', icon: BarChart3 },
      { name: 'Deliveries', href: '/courier/deliveries', icon: Truck },
      { name: 'Earnings', href: '/courier/earnings', icon: DollarSign },
      { name: 'Availability', href: '/courier/availability', icon: MapPin }
    ],
    ADMIN: [
      ...baseNavigation,
      { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
      { name: 'Users', href: '/admin/users', icon: Users },
      { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
      { name: 'Settings', href: '/admin/global-settings', icon: Settings },
      { name: 'Moderation', href: '/admin/moderation', icon: Shield }
    ]
  }

  return roleNavigation[role] || baseNavigation
}

export const getUserNavigation = (role: UserRole): NavigationItem[] => {
  const baseUserNav: NavigationItem[] = [
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Inbox', href: '/inbox', icon: MessageCircle },
    { name: 'Profile', href: '/profile', icon: User }
  ]

  const roleUserNav: Record<UserRole, NavigationItem[]> = {
    USER: baseUserNav,
    VENDOR: [
      ...baseUserNav,
      { name: 'Store Settings', href: '/vendor/settings', icon: Settings }
    ],
    COURIER: [
      ...baseUserNav,
      { name: 'Courier Profile', href: '/courier/profile', icon: User }
    ],
    ADMIN: [
      ...baseUserNav,
      { name: 'Admin Panel', href: '/admin', icon: Settings }
    ]
  }

  return roleUserNav[role] || baseUserNav
}

export const getBreadcrumbs = (pathname: string, role: UserRole): NavigationItem[] => {
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs: NavigationItem[] = []

  // Always start with home
  breadcrumbs.push({ name: 'Home', href: '/', icon: Home })

  // Build breadcrumbs based on path
  let currentPath = ''
  for (const segment of pathSegments) {
    currentPath += `/${segment}`
    
    // Skip if it's a dynamic route parameter
    if (segment.startsWith('[') && segment.endsWith(']')) continue

    const navigation = getNavigationByRole(role)
    const userNavigation = getUserNavigation(role)
    const allNavigation = [...navigation, ...userNavigation]

    const item = allNavigation.find(nav => nav.href === currentPath)
    if (item) {
      breadcrumbs.push(item)
    } else {
      // Fallback for unknown paths
      breadcrumbs.push({
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
        icon: FileText
      })
    }
  }

  return breadcrumbs
}

export const getQuickActions = (role: UserRole): NavigationItem[] => {
  const quickActions: Record<UserRole, NavigationItem[]> = {
    USER: [
      { name: 'Sell Item', href: '/user/listings/new', icon: Package },
      { name: 'Browse', href: '/listings', icon: Search },
      { name: 'My Orders', href: '/user/purchases', icon: ShoppingCart }
    ],
    VENDOR: [
      { name: 'Add Product', href: '/vendor/products/new', icon: Package },
      { name: 'View Orders', href: '/vendor/orders', icon: ShoppingCart },
      { name: 'Analytics', href: '/vendor/analytics', icon: BarChart3 }
    ],
    COURIER: [
      { name: 'Available Jobs', href: '/courier/deliveries/available', icon: Truck },
      { name: 'My Earnings', href: '/courier/earnings', icon: DollarSign },
      { name: 'Set Availability', href: '/courier/availability', icon: MapPin }
    ],
    ADMIN: [
      { name: 'Manage Users', href: '/admin/users', icon: Users },
      { name: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Global Settings', href: '/admin/global-settings', icon: Settings }
    ]
  }

  return quickActions[role] || []
}
