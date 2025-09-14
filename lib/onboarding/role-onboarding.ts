import { UserRole } from '@/lib/auth/access-control'

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  required: boolean
  order: number
}

export const getOnboardingSteps = (role: UserRole): OnboardingStep[] => {
  const steps: Record<UserRole, OnboardingStep[]> = {
    USER: [
      {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your personal information and preferences',
        component: 'ProfileStep',
        required: true,
        order: 1
      },
      {
        id: 'location',
        title: 'Set Your Location',
        description: 'Choose your location for better recommendations',
        component: 'LocationStep',
        required: true,
        order: 2
      },
      {
        id: 'preferences',
        title: 'Set Your Preferences',
        description: 'Customize your marketplace experience',
        component: 'PreferencesStep',
        required: false,
        order: 3
      }
    ],
    VENDOR: [
      {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your personal and business information',
        component: 'ProfileStep',
        required: true,
        order: 1
      },
      {
        id: 'store',
        title: 'Create Your Store',
        description: 'Set up your store details and branding',
        component: 'StoreStep',
        required: true,
        order: 2
      },
      {
        id: 'verification',
        title: 'Business Verification',
        description: 'Verify your business documents',
        component: 'VerificationStep',
        required: true,
        order: 3
      },
      {
        id: 'payment',
        title: 'Payment Setup',
        description: 'Set up your payment methods and bank details',
        component: 'PaymentStep',
        required: true,
        order: 4
      }
    ],
    COURIER: [
      {
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your personal information',
        component: 'ProfileStep',
        required: true,
        order: 1
      },
      {
        id: 'documents',
        title: 'Upload Documents',
        description: 'Upload your license and insurance documents',
        component: 'DocumentsStep',
        required: true,
        order: 2
      },
      {
        id: 'verification',
        title: 'Identity Verification',
        description: 'Verify your identity and background',
        component: 'VerificationStep',
        required: true,
        order: 3
      },
      {
        id: 'availability',
        title: 'Set Availability',
        description: 'Set your working hours and service areas',
        component: 'AvailabilityStep',
        required: true,
        order: 4
      }
    ],
    ADMIN: [
      {
        id: 'profile',
        title: 'Complete Admin Profile',
        description: 'Set up your administrator profile',
        component: 'ProfileStep',
        required: true,
        order: 1
      },
      {
        id: 'permissions',
        title: 'Set Permissions',
        description: 'Configure your admin permissions',
        component: 'PermissionsStep',
        required: true,
        order: 2
      }
    ]
  }

  return steps[role] || []
}

export const getOnboardingProgress = (role: UserRole, completedSteps: string[]): number => {
  const steps = getOnboardingSteps(role)
  const requiredSteps = steps.filter(step => step.required)
  const completedRequiredSteps = requiredSteps.filter(step => completedSteps.includes(step.id))
  
  return Math.round((completedRequiredSteps.length / requiredSteps.length) * 100)
}

export const getNextOnboardingStep = (role: UserRole, completedSteps: string[]): OnboardingStep | null => {
  const steps = getOnboardingSteps(role)
  const sortedSteps = steps.sort((a, b) => a.order - b.order)
  
  return sortedSteps.find(step => !completedSteps.includes(step.id)) || null
}

export const isOnboardingComplete = (role: UserRole, completedSteps: string[]): boolean => {
  const steps = getOnboardingSteps(role)
  const requiredSteps = steps.filter(step => step.required)
  
  return requiredSteps.every(step => completedSteps.includes(step.id))
}
