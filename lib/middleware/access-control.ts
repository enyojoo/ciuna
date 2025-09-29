import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canAccessRoute, UserRole } from '@/lib/auth/access-control'

export async function checkAccessControl(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes
  const publicRoutes = [
    '/',
    '/listings',
    '/vendors',
    '/services',
    '/auth/sign-in',
    '/auth/sign-up',
    '/api/auth'
  ]
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // Redirect to sign-in for protected routes
      const signInUrl = new URL('/auth/sign-in', request.url)
      signInUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Get user profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, location')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Redirect to profile setup if no profile exists
      const profileUrl = new URL('/profile/setup', request.url)
      return NextResponse.redirect(profileUrl)
    }

    const userRole = profile.role as UserRole

    // Check if user can access this route
    if (!canAccessRoute(userRole, pathname)) {
      // Redirect to appropriate dashboard based on role
      const dashboardRoutes: Record<UserRole, string> = {
        USER: '/user/dashboard',
        VENDOR: '/vendor/dashboard',
        COURIER: '/courier/dashboard',
        ADMIN: '/admin/dashboard'
      }

      const dashboardUrl = new URL(dashboardRoutes[userRole], request.url)
      return NextResponse.redirect(dashboardUrl)
    }

    // Add user role to headers for use in components
    const response = NextResponse.next()
    response.headers.set('x-user-role', userRole)
    response.headers.set('x-user-location', profile.location || 'other')
    
    return response

  } catch (error) {
    console.error('Access control error:', error)
    // Redirect to sign-in on error
    const signInUrl = new URL('/auth/sign-in', request.url)
    return NextResponse.redirect(signInUrl)
  }
}

export function withAccessControl(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const accessCheck = await checkAccessControl(request)
    
    // If access check returns a redirect, return it
    if (accessCheck.status === 302 || accessCheck.status === 307) {
      return accessCheck
    }

    // Otherwise, proceed with the original handler
    return handler(request)
  }
}
