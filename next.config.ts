import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the *.vercel.app test addresses out of search results; only the real domain should be indexed.
  async headers() {
    return [{ source: "/:path*", has: [{ type: "host", value: "(?<sub>.*)\\.vercel\\.app" }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  // Standard discovery location for the API description (CLAUDE.md §10).
  async rewrites() {
    return [{ source: "/.well-known/openapi.json", destination: "/openapi.json" }];
  },
};

export default nextConfig;
