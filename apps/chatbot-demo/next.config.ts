import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@kortex/core',
    '@kortex/config',
    '@kortex/openai',
    '@kortex/postgres',
    '@kortex/pgvector',
  ],
};

export default nextConfig;
