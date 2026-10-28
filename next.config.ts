import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
}

export default nextConfig
