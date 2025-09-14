'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { UserRole } from '@/lib/auth/access-control'
import { getBreadcrumbs } from '@/lib/navigation/role-navigation'

interface BreadcrumbsProps {
  pathname: string
  role: UserRole
}

export function Breadcrumbs({ pathname, role }: BreadcrumbsProps) {
  const breadcrumbs = getBreadcrumbs(pathname, role)

  if (breadcrumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <div key={item.href} className="flex items-center">
            {index === 0 && <Home className="h-4 w-4 mr-1" />}
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
            
            {isLast ? (
              <span className="font-medium text-foreground">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
