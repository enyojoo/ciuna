'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NavigationItem } from '@/lib/navigation/role-navigation'
import { UserRole } from '@/lib/auth/access-control'

interface QuickActionsProps {
  role: UserRole
  actions: NavigationItem[]
  className?: string
}

export function QuickActions({ role, actions, className = '' }: QuickActionsProps) {
  if (actions.length === 0) {
    return null
  }

  const getRoleTitle = (role: UserRole) => {
    const titles: Record<UserRole, string> = {
      USER: 'Quick Actions',
      VENDOR: 'Store Actions',
      COURIER: 'Delivery Actions',
      ADMIN: 'Admin Actions'
    }
    return titles[role]
  }

  const getRoleDescription = (role: UserRole) => {
    const descriptions: Record<UserRole, string> = {
      USER: 'Common actions for marketplace users',
      VENDOR: 'Manage your store and products',
      COURIER: 'Handle deliveries and earnings',
      ADMIN: 'Platform management tools'
    }
    return descriptions[role]
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{getRoleTitle(role)}</CardTitle>
        <CardDescription>{getRoleDescription(role)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
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
  )
}
