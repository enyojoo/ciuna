import { UserRole } from '@/lib/auth/access-control'

export interface RoleFeatures {
  // Core marketplace features
  canBuy: boolean
  canList: boolean
  canSell: boolean
  canCourier: boolean
  canAdmin: boolean
  
  // Communication features
  canMessage: boolean
  canReview: boolean
  canReport: boolean
  
  // User-specific features
  canManageProfile: boolean
  canManageWishlist: boolean
  canViewOrderHistory: boolean
  
  // Vendor-specific features
  canManageStore: boolean
  canViewAnalytics: boolean
  canGroupBuy: boolean
  canManageInventory: boolean
  canManageShipping: boolean
  canManagePromotions: boolean
  
  // Courier-specific features
  canViewEarnings: boolean
  canManageAvailability: boolean
  canManageRoutes: boolean
  canViewDeliveryHistory: boolean
  
  // Admin-specific features
  canManageUsers: boolean
  canViewAllAnalytics: boolean
  canModerate: boolean
  canManageSettings: boolean
  canManageRoles: boolean
  canViewReports: boolean
  canManagePlatform: boolean
}

export const getRoleFeatures = (role: UserRole): RoleFeatures => {
  const baseFeatures: RoleFeatures = {
    // Core marketplace features
    canBuy: true,
    canList: false,
    canSell: false,
    canCourier: false,
    canAdmin: false,
    
    // Communication features
    canMessage: true,
    canReview: true,
    canReport: true,
    
    // User-specific features
    canManageProfile: true,
    canManageWishlist: true,
    canViewOrderHistory: true,
    
    // Vendor-specific features
    canManageStore: false,
    canViewAnalytics: false,
    canGroupBuy: false,
    canManageInventory: false,
    canManageShipping: false,
    canManagePromotions: false,
    
    // Courier-specific features
    canViewEarnings: false,
    canManageAvailability: false,
    canManageRoutes: false,
    canViewDeliveryHistory: false,
    
    // Admin-specific features
    canManageUsers: false,
    canViewAllAnalytics: false,
    canModerate: false,
    canManageSettings: false,
    canManageRoles: false,
    canViewReports: false,
    canManagePlatform: false
  }

  const roleFeatures: Record<UserRole, Partial<RoleFeatures>> = {
    USER: {
      canList: true,
      canManageWishlist: true,
      canViewOrderHistory: true
    },
    VENDOR: {
      canList: true,
      canSell: true,
      canManageStore: true,
      canViewAnalytics: true,
      canGroupBuy: true,
      canManageInventory: true,
      canManageShipping: true,
      canManagePromotions: true
    },
    COURIER: {
      canCourier: true,
      canViewEarnings: true,
      canManageAvailability: true,
      canManageRoutes: true,
      canViewDeliveryHistory: true
    },
    ADMIN: {
      canList: true,
      canSell: true,
      canCourier: true,
      canAdmin: true,
      canManageStore: true,
      canViewAnalytics: true,
      canGroupBuy: true,
      canManageInventory: true,
      canManageShipping: true,
      canManagePromotions: true,
      canViewEarnings: true,
      canManageAvailability: true,
      canManageRoutes: true,
      canViewDeliveryHistory: true,
      canManageUsers: true,
      canViewAllAnalytics: true,
      canModerate: true,
      canManageSettings: true,
      canManageRoles: true,
      canViewReports: true,
      canManagePlatform: true
    }
  }

  // Merge base features with role-specific features
  return {
    ...baseFeatures,
    ...roleFeatures[role]
  }
}

export const canAccessFeature = (role: UserRole, feature: keyof RoleFeatures): boolean => {
  const features = getRoleFeatures(role)
  return features[feature] || false
}

export const getAvailableFeatures = (role: UserRole): string[] => {
  const features = getRoleFeatures(role)
  return Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature)
}

export const getFeatureDescription = (feature: keyof RoleFeatures): string => {
  const descriptions: Record<keyof RoleFeatures, string> = {
    canBuy: 'Browse and purchase items from the marketplace',
    canList: 'Create and manage your own listings',
    canSell: 'Sell items through the marketplace',
    canCourier: 'Provide delivery services to customers',
    canAdmin: 'Access administrative functions',
    canMessage: 'Send and receive messages with other users',
    canReview: 'Leave reviews and ratings for purchases',
    canReport: 'Report inappropriate content or behavior',
    canManageProfile: 'Update your personal profile information',
    canManageWishlist: 'Save items to your wishlist',
    canViewOrderHistory: 'View your complete order history',
    canManageStore: 'Create and manage your store',
    canViewAnalytics: 'View sales and performance analytics',
    canGroupBuy: 'Create and manage group buying deals',
    canManageInventory: 'Manage your product inventory',
    canManageShipping: 'Configure shipping options and rates',
    canManagePromotions: 'Create and manage promotional campaigns',
    canViewEarnings: 'View your delivery earnings and payments',
    canManageAvailability: 'Set your working hours and availability',
    canManageRoutes: 'Optimize and manage delivery routes',
    canViewDeliveryHistory: 'View your delivery history and performance',
    canManageUsers: 'Manage user accounts and permissions',
    canViewAllAnalytics: 'View platform-wide analytics and metrics',
    canModerate: 'Moderate content and user behavior',
    canManageSettings: 'Configure platform settings and preferences',
    canManageRoles: 'Assign and manage user roles',
    canViewReports: 'Generate and view platform reports',
    canManagePlatform: 'Manage overall platform operations'
  }

  return descriptions[feature] || 'Unknown feature'
}
