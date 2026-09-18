import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true
  },
  serverExternalPackages: ["pdf-parse", "mammoth", "xlsx"]
};

export default nextConfig;
