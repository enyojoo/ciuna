import { 
  Package, 
  ShoppingCart, 
  Heart, 
  Plus,
  BarChart3,
  Truck,
  DollarSign,
  Users,
  Settings,
  Shield,
  TrendingUp,
  Eye,
  Edit,
  Upload
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { NavigationItem } from '@/lib/navigation/role-navigation'

export const getQuickActions = (role: UserRole): NavigationItem[] => {
  const quickActions: Record<UserRole, NavigationItem[]> = {
    USER: [
      {
        name: 'Sell Item',
        href: '/user/listings/new',
        icon: Plus,
        badge: 'New'
      },
      {
        name: 'Browse',
        href: '/listings',
        icon: Package
      },
      {
        name: 'My Orders',
        href: '/user/purchases',
        icon: ShoppingCart
      },
      {
        name: 'Wishlist',
        href: '/user/wishlist',
        icon: Heart
      }
    ],
    VENDOR: [
      {
        name: 'Add Product',
        href: '/vendor/products/new',
        icon: Plus,
        badge: 'New'
      },
      {
        name: 'View Orders',
        href: '/vendor/orders',
        icon: ShoppingCart
      },
      {
        name: 'Analytics',
        href: '/vendor/analytics',
        icon: BarChart3
      },
      {
        name: 'Store Settings',
        href: '/vendor/store/settings',
        icon: Settings
      },
      {
        name: 'Inventory',
        href: '/vendor/inventory',
        icon: Package
      },
      {
        name: 'Promotions',
        href: '/vendor/promotions',
        icon: TrendingUp
      }
    ],
    COURIER: [
      {
        name: 'Available Jobs',
        href: '/courier/deliveries/available',
        icon: Truck,
        badge: 'Hot'
      },
      {
        name: 'My Earnings',
        href: '/courier/earnings',
        icon: DollarSign
      },
      {
        name: 'Set Availability',
        href: '/courier/availability',
        icon: Settings
      },
      {
        name: 'Delivery History',
        href: '/courier/deliveries/history',
        icon: Eye
      },
      {
        name: 'Profile',
        href: '/courier/profile',
        icon: Edit
      }
    ],
    ADMIN: [
      {
        name: 'Manage Users',
        href: '/admin/users',
        icon: Users,
        badge: 'Admin'
      },
      {
        name: 'Platform Analytics',
        href: '/admin/analytics',
        icon: BarChart3
      },
      {
        name: 'Global Settings',
        href: '/admin/global-settings',
        icon: Settings
      },
      {
        name: 'Moderation',
        href: '/admin/moderation',
        icon: Shield
      },
      {
        name: 'Reports',
        href: '/admin/reports',
        icon: TrendingUp
      },
      {
        name: 'System Health',
        href: '/admin/system',
        icon: Eye
      }
    ]
  }

  return quickActions[role] || []
}

export const getRoleSpecificActions = (role: UserRole, context: string): NavigationItem[] => {
  const contextActions: Record<string, Record<UserRole, NavigationItem[]>> = {
    'dashboard': {
      USER: [
        { name: 'Quick Sell', href: '/user/listings/new', icon: Plus },
        { name: 'Browse Categories', href: '/listings', icon: Package }
      ],
      VENDOR: [
        { name: 'Add Product', href: '/vendor/products/new', icon: Plus },
        { name: 'View Sales', href: '/vendor/analytics', icon: BarChart3 }
      ],
      COURIER: [
        { name: 'Find Jobs', href: '/courier/deliveries/available', icon: Truck },
        { name: 'Check Earnings', href: '/courier/earnings', icon: DollarSign }
      ],
      ADMIN: [
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'Platform Stats', href: '/admin/analytics', icon: BarChart3 }
      ]
    },
    'store': {
      USER: [],
      VENDOR: [
        { name: 'Add Product', href: '/vendor/products/new', icon: Plus },
        { name: 'Edit Store', href: '/vendor/store/edit', icon: Edit },
        { name: 'Upload Images', href: '/vendor/store/images', icon: Upload }
      ],
      COURIER: [],
      ADMIN: []
    },
    'products': {
      USER: [],
      VENDOR: [
        { name: 'Bulk Upload', href: '/vendor/products/bulk', icon: Upload },
        { name: 'Category Management', href: '/vendor/products/categories', icon: Settings }
      ],
      COURIER: [],
      ADMIN: []
    }
  }

  return contextActions[context]?.[role] || []
}

export const getActionDescription = (action: string, role: UserRole): string => {
  const descriptions: Record<string, Record<UserRole, string>> = {
    'Sell Item': {
      USER: 'List your items for sale on the marketplace',
      VENDOR: 'Add new products to your store',
      COURIER: 'Not available for couriers',
      ADMIN: 'Not available for admins'
    },
    'Browse': {
      USER: 'Discover products from various vendors',
      VENDOR: 'Browse competitor products and market trends',
      COURIER: 'Browse available delivery jobs',
      ADMIN: 'Browse all platform content'
    },
    'Analytics': {
      USER: 'View your purchase and activity analytics',
      VENDOR: 'Track your store performance and sales metrics',
      COURIER: 'View your delivery performance and earnings',
      ADMIN: 'Monitor platform-wide analytics and metrics'
    }
  }

  return descriptions[action]?.[role] || 'Action description not available'
}
