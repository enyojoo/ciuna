import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getOfficeCorsHeaders } from '@/lib/cors'

// App root redirect: app.ciuna.com/ -> /auth/login
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // CORS for office app: admin routes + email hook (office → web transaction emails)
  const isOfficeCorsApi =
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/auth/admin/') ||
    pathname === '/api/send-email-notification' ||
    pathname === '/api/referrals/process-completion'
  if (isOfficeCorsApi) {
    const corsHeaders = getOfficeCorsHeaders(request)
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders })
    }
    const response = NextResponse.next()
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const response = NextResponse.next()

  // Persist referral slug for /api/referrals/claim cookie fallback (email confirm may drop ?ref= from URL).
  const refParam =
    request.nextUrl.searchParams.get("ref")?.trim() ||
    request.nextUrl.searchParams.get("via")?.trim()
  if (
    refParam &&
    (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register"))
  ) {
    response.cookies.set("ciuna_ref_slug", refParam, {
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  }

  // Set cache headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Set cache headers for auth pages
  if (pathname.startsWith('/auth/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Set cache headers for authenticated app pages (dashboard, send, transactions, etc.)
  const appPaths = ['/dashboard', '/send', '/transactions', '/recipients', '/more', '/support']
  if (appPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    response.headers.set('Cache-Control', 'private, no-cache, must-revalidate')
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/api/:path*',
    '/auth/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/send/:path*',
    '/transactions/:path*',
    '/recipients/:path*',
    '/more/:path*',
    '/support/:path*',
  ],
}
