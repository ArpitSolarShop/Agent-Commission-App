import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
