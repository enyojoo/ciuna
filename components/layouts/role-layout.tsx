'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/auth/access-control'
import { getNavigationByRole, getUserNavigation, getQuickActions } from '@/lib/navigation/role-navigation'
import { Navigation } from '@/components/navigation'
import { Sidebar } from '@/components/layouts/sidebar'
import { MobileNav } from '@/components/layouts/mobile-nav'
import { Breadcrumbs } from '@/components/layouts/breadcrumbs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface RoleLayoutProps {
  children: ReactNode
  role: UserRole
}

export function RoleLayout({ children, role }: RoleLayoutProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; role: string; email: string; first_name?: string; last_name?: string; avatar_url?: string; location?: string; completed_steps?: string[] } | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/auth/sign-in')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!profile) {
          router.push('/profile/setup')
          return
        }

        setUser({ ...user, ...profile })
      } catch (error) {
        console.error('Error loading user:', error)
        router.push('/auth/sign-in')
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  const navigation = getNavigationByRole(role)
  const userNavigation = getUserNavigation(role)
  const quickActions = getQuickActions(role)

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        user={user} 
        onSignOut={handleSignOut}
        role={role}
        navigation={navigation}
        userNavigation={userNavigation}
      />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar 
            role={role}
            navigation={navigation}
            quickActions={quickActions}
          />
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden fixed top-16 left-4 z-50">
          <MobileNav 
            role={role}
            navigation={navigation}
            quickActions={quickActions}
          />
        </div>
        
        {/* Main content area */}
        <main className="flex-1 w-full md:w-auto">
          <div className="container mx-auto px-4 py-6">
            <Breadcrumbs pathname={pathname} role={role} />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
