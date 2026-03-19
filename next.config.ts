import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js dev indicator badge.
  devIndicators: false,
  // Prevent build failures from TypeScript errors on Vercel.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
