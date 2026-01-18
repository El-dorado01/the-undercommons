import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sharetribe.imgix.net',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com', // for the demo image in sidebar if used
      },
    ],
  },
};

export default nextConfig;
