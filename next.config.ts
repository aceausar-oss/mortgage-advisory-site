import type { NextConfig } from "next";

// Old LeadPops/WordPress URLs → their closest new page, so links and Google rankings carry over after the domain switch.
const OLD_SITE_REDIRECTS: [string, string][] = [
  ["/blog", "/answers"],
  ["/category/:path*", "/answers"],
  ["/sell-home-around-holidays", "/answers"],
  ["/15-year-fixed-rate-mortgage", "/answers/arm-vs-buydown-vs-fixed"],
  ["/30-year-fixed-rate-mortgage", "/answers/arm-vs-buydown-vs-fixed"],
  ["/adjuadjustable-rate-mortgage", "/answers/arm-vs-buydown-vs-fixed"],
  ["/buy", "/loans/purchase"],
  ["/usda-loans", "/loans/purchase"],
  ["/refinance", "/loans/refinance"],
  ["/reverse-mortgage", "/loans/reverse-mortgage"],
  ["/fha-loans", "/loans/fha"],
  ["/203k-loans", "/loans/fha"],
  ["/va-loans", "/loans/va"],
  ["/jumbo-loans", "/loans/conventional"],
  ["/mortgage-calculator", "/how-we-estimate"],
  ["/apply-online", "/book"],
  ["/secure-application", "/book"],
  ["/contact", "/book"],
  ["/careers", "/about"],
  ["/the-mortgage-advisory", "/about"],
  ["/testimonials", "/reviews"],
  ["/testimonials/:path*", "/reviews"],
  ["/privacy-policy", "/privacy"],
  ["/website-accessibility-inquiry", "/accessibility"],
  ["/sitemap_index.xml", "/sitemap.xml"],
];

const nextConfig: NextConfig = {
  async redirects() {
    return OLD_SITE_REDIRECTS.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  // Keep the *.vercel.app test addresses out of search results; only the real domain should be indexed.
  async headers() {
    return [
      // Baseline security headers on every page. (No strict CSP yet: the Go High Level booking embed loads its own scripts.)
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      { source: "/:path*", has: [{ type: "host", value: "(?<sub>.*)\\.vercel\\.app" }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  // Standard discovery location for the API description (CLAUDE.md §10).
  async rewrites() {
    return [{ source: "/.well-known/openapi.json", destination: "/openapi.json" }];
  },
};

export default nextConfig;
