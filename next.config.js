/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'example.com'],
  },
  experimental: {
    esmExternals: 'loose',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
