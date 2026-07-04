import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@kortex/ui'],
  async redirects() {
    return [
      {
        source: '/packages/chat',
        destination: '/packages/ui',
        permanent: true,
      },
      {
        source: '/packages/chat/:path*',
        destination: '/packages/ui/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
