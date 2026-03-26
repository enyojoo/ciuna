import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getOfficeCorsHeaders } from '@/lib/cors'

// App root redirect: app.ciuna.com/ -> /auth/login
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // CORS for office app: admin routes + email hook (office updates transaction status → web sends emails)
  const isOfficeCorsApi =
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/auth/admin/') ||
    pathname === '/api/send-email-notification'
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

  // Set cache headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Set cache headers for auth pages
  if (pathname.startsWith('/auth/')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Authenticated app shell: no-store avoids 304 reuse of HTML that can reference stale
  // hashed chunks after deploys (broken hydration / infinite loading until hard refresh).
  const appPaths = ['/dashboard', '/send', '/transactions', '/recipients', '/more', '/support']
  if (appPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    response.headers.set('Cache-Control', 'private, no-store, must-revalidate')
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
