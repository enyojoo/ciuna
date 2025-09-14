'use client'

import { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Store, 
  Truck, 
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { getOnboardingProgress, getNextOnboardingStep } from '@/lib/onboarding/role-onboarding'
import { getRoleFeatures } from '@/lib/features/role-features'
import { getQuickActions } from '@/lib/quick-actions/role-actions'

interface RoleDashboardProps {
  role: UserRole
  user: {
    id: string
    first_name?: string
    last_name?: string
    email?: string
    location?: string
    onboarding_completed?: boolean
    completed_steps?: string[]
  }
  children: ReactNode
}

export function RoleDashboard({ role, user, children }: RoleDashboardProps) {
  const features = getRoleFeatures(role, user.location as any || 'other')
  const quickActions = getQuickActions(role)
  const onboardingProgress = getOnboardingProgress(role, user.completed_steps || [])
  const nextStep = getNextOnboardingStep(role, user.completed_steps || [])

  const getRoleIcon = (role: UserRole) => {
    const icons = {
      USER: User,
      VENDOR: Store,
      COURIER: Truck,
      ADMIN: Shield
    }
    return icons[role]
  }

  const getRoleColor = (role: UserRole) => {
    const colors = {
      USER: 'blue',
      VENDOR: 'green',
      COURIER: 'orange',
      ADMIN: 'purple'
    }
    return colors[role]
  }

  const getRoleDescription = (role: UserRole) => {
    const descriptions = {
      USER: 'Buy and sell items in the marketplace',
      VENDOR: 'Manage your store and sell products',
      COURIER: 'Provide delivery services to customers',
      ADMIN: 'Manage the platform and users'
    }
    return descriptions[role]
  }

  const RoleIcon = getRoleIcon(role)
  const roleColor = getRoleColor(role)

  return (
    <div className="space-y-6">
      {/* Role Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full bg-${roleColor}-100`}>
            <RoleIcon className={`h-8 w-8 text-${roleColor}-600`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold capitalize">{role} Dashboard</h1>
            <p className="text-muted-foreground">{getRoleDescription(role)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {role}
          </Badge>
          {user.onboarding_completed ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Setup Required
            </Badge>
          )}
        </div>
      </div>

      {/* Onboarding Progress */}
      {!user.onboarding_completed && nextStep && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Complete Your Setup
            </CardTitle>
            <CardDescription className="text-orange-700">
              You're {onboardingProgress}% complete with your {role.toLowerCase()} setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${onboardingProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Next: {nextStep.title}</p>
                  <p className="text-sm text-muted-foreground">{nextStep.description}</p>
                </div>
                <Button size="sm">
                  Continue Setup
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks for {role.toLowerCase()}s
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  asChild
                >
                  <a href={action.href}>
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.name}</span>
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                  </a>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Feature Access Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Access Level</CardTitle>
          <CardDescription>
            Features available to you as a {role.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(features).map(([feature, enabled]) => {
              if (!enabled) return null
              
              const featureName = feature.replace('can', '').replace(/([A-Z])/g, ' $1').trim()
              return (
                <div key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium capitalize">{featureName}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {children}
    </div>
  )
}
