import createMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en', 'ru', 'fr', 'zh', 'ar', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

export function middleware(req: NextRequest) {
  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
}
