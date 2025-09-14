'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Menu,
  X,
  Home,
  BarChart3,
  Package,
  ShoppingCart,
  Heart,
  Store,
  TrendingUp,
  Truck,
  DollarSign,
  Users,
  Settings,
  Shield,
  FileText,
  Search,
  MapPin
} from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { NavigationItem } from '@/lib/navigation/role-navigation'

interface MobileNavProps {
  role: UserRole
  navigation: NavigationItem[]
  quickActions: NavigationItem[]
}

export function MobileNav({ role, navigation, quickActions }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
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
      Shield,
      FileText,
      MapPin
    }
    return icons[iconName] || Home
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

  const roleColor = getRoleColor(role)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full bg-${roleColor}-100 flex items-center justify-center`}>
                <span className={`text-${roleColor}-600 font-bold text-sm`}>
                  {role.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="font-semibold capitalize">{role} Menu</h2>
                <p className="text-xs text-muted-foreground">Navigation</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Main Navigation */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Main</h3>
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = getIcon(item.icon)
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive
                            ? `bg-${roleColor}-100 text-${roleColor}-700`
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h3>
                  <nav className="space-y-1">
                    {quickActions.map((action) => {
                      const Icon = getIcon(action.icon)
                      
                      return (
                        <Link
                          key={action.href}
                          href={action.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{action.name}</span>
                          {action.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {action.badge}
                            </Badge>
                          )}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
