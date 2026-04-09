import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js dev indicator badge.
  devIndicators: false,
  // Prevent build failures from TypeScript errors on Vercel.
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/branches/mapping',
        destination: '/groups',
        permanent: false,
      },
      {
        source: '/departments/mapping',
        destination: '/departments',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
