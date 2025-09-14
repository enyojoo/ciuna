import { UserLocation } from '@/lib/currency'

export type UserRole = 'USER' | 'VENDOR' | 'COURIER' | 'ADMIN'

export interface AccessControl {
  canBuy: boolean
  canList: boolean
  canSell: boolean
  canCourier: boolean
  canAdmin: boolean
  canMessage: boolean
  canReview: boolean
  canManageStore?: boolean
  canViewAnalytics?: boolean
  canGroupBuy?: boolean
  canViewEarnings?: boolean
  canManageAvailability?: boolean
  canManageUsers?: boolean
  canViewAllAnalytics?: boolean
  canModerate?: boolean
  canManageSettings?: boolean
}

export const getRoleFeatures = (role: UserRole, _location: UserLocation): AccessControl => {
  const baseFeatures = {
    canBuy: true,
    canMessage: true,
    canReview: true
  }

  const roleFeatures: Record<UserRole, AccessControl> = {
    USER: {
      ...baseFeatures,
      canList: true,
      canSell: false,
      canCourier: false,
      canAdmin: false
    },
    VENDOR: {
      ...baseFeatures,
      canList: true,
      canSell: true,
      canCourier: false,
      canAdmin: false,
      canManageStore: true,
      canViewAnalytics: true,
      canGroupBuy: true
    },
    COURIER: {
      ...baseFeatures,
      canList: false,
      canSell: false,
      canCourier: true,
      canAdmin: false,
      canViewEarnings: true,
      canManageAvailability: true
    },
    ADMIN: {
      ...baseFeatures,
      canList: true,
      canSell: true,
      canCourier: true,
      canAdmin: true,
      canManageUsers: true,
      canViewAllAnalytics: true,
      canModerate: true,
      canManageSettings: true,
      canManageStore: true,
      canViewAnalytics: true,
      canGroupBuy: true,
      canViewEarnings: true,
      canManageAvailability: true
    }
  }

  return roleFeatures[role] || baseFeatures
}

export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const accessMatrix: Record<UserRole, string[]> = {
    USER: [
      '/user',
      '/orders',
      '/inbox',
      '/profile',
      '/listings',
      '/vendors',
      '/services',
      '/'
    ],
    VENDOR: [
      '/user',
      '/vendor',
      '/orders',
      '/inbox',
      '/profile',
      '/listings',
      '/vendors',
      '/services',
      '/'
    ],
    COURIER: [
      '/courier',
      '/orders',
      '/inbox',
      '/profile',
      '/'
    ],
    ADMIN: [
      '/admin',
      '/user',
      '/vendor',
      '/courier',
      '/orders',
      '/inbox',
      '/profile',
      '/listings',
      '/vendors',
      '/services',
      '/'
    ]
  }

  const allowedRoutes = accessMatrix[userRole] || []
  return allowedRoutes.some(prefix => route.startsWith(prefix))
}

export const canAccessFeature = (userRole: UserRole, feature: keyof AccessControl, location: UserLocation): boolean => {
  const features = getRoleFeatures(userRole, location)
  return features[feature] || false
}

export const getRoleDisplayName = (role: UserRole): string => {
  const names: Record<UserRole, string> = {
    USER: 'User',
    VENDOR: 'Vendor',
    COURIER: 'Courier',
    ADMIN: 'Administrator'
  }
  return names[role]
}

export const getRoleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    USER: 'Buy and sell items in the marketplace',
    VENDOR: 'Manage a store and sell products',
    COURIER: 'Provide delivery services',
    ADMIN: 'Manage the platform and users'
  }
  return descriptions[role]
}

export const getRoleIcon = (role: UserRole): string => {
  const icons: Record<UserRole, string> = {
    USER: '👤',
    VENDOR: '🏪',
    COURIER: '🚚',
    ADMIN: '⚙️'
  }
  return icons[role]
}
