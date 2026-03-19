import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js dev indicator badge.
  devIndicators: false,
  // Prevent build failures from ESLint errors on Vercel.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
