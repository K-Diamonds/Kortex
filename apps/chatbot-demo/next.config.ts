import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@kortex/core',
    '@kortex/config',
    '@kortex/ui',
    '@kortex/openai',
    '@kortex/postgres',
    '@kortex/pgvector',
  ],
};

export default nextConfig;
