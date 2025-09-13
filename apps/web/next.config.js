/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'example.com'],
  },
  transpilePackages: ['@ciuna/types', '@ciuna/sb', '@ciuna/ui'],
  experimental: {
    appDir: true,
  },
};

module.exports = nextConfig;
