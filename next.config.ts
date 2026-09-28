import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard discovery location for the API description (CLAUDE.md §10).
  async rewrites() {
    return [{ source: "/.well-known/openapi.json", destination: "/openapi.json" }];
  },
};

export default nextConfig;
