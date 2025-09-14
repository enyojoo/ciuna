import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canAccessRoute, UserRole } from '@/lib/auth/access-control'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public routes
  const publicRoutes = [
    '/',
    '/listings',
    '/vendors',
    '/services',
    '/auth/sign-in',
    '/auth/sign-up',
    '/api/auth',
    '/api/webhooks',
    '/_next',
    '/favicon.ico'
  ]
  
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  try {
    const supabase = createClient()
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
    console.error('Middleware error:', error)
    // Redirect to sign-in on error
    const signInUrl = new URL('/auth/sign-in', request.url)
    return NextResponse.redirect(signInUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
