import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['three'],
  turbopack: {},
  devIndicators: false,
};

export default nextConfig;
