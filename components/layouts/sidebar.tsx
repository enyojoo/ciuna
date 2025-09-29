'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  ChevronLeft, 
  ChevronRight,
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

interface SidebarProps {
  role: UserRole
  navigation: NavigationItem[]
  quickActions: NavigationItem[]
}

export function Sidebar({ role, navigation, quickActions }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
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

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={cn(
      "border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold capitalize">
              {role} Dashboard
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator />

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <>
            <div className="px-4 py-2">
              {!isCollapsed && (
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </h3>
              )}
            </div>
            <div className="px-2 space-y-1">
              {quickActions.map((action) => {
                const Icon = getIcon(action.icon.name)
                return (
                  <Button
                    key={action.href}
                    variant={isActive(action.href) ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isCollapsed && "px-2"
                    )}
                    asChild
                  >
                    <Link href={action.href}>
                      <Icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <span className="ml-2">{action.name}</span>
                      )}
                    </Link>
                  </Button>
                )
              })}
            </div>
            <Separator className="my-2" />
          </>
        )}

        {/* Main Navigation */}
        <ScrollArea className="flex-1">
          <div className="px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = getIcon(item.icon.name)
              return (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isCollapsed && "px-2"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {!isCollapsed && (
                      <>
                        <span className="ml-2">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </Link>
                </Button>
              )
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4">
          {!isCollapsed && (
            <div className="text-xs text-muted-foreground text-center">
              Ciuna Marketplace
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
