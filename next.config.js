const withNextIntl = require('next-intl/plugin')(
  './lib/i18n.ts'
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  serverExternalPackages: ['@supabase/supabase-js']
}

module.exports = withNextIntl(nextConfig)
