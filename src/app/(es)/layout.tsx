import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { licensing, siteUrl } from "@/lib/site";
import "../globals.css";

// Root layout for the Spanish pages under /es (Ace, Oct 2026). Same frame as English, with <html lang="es-US">.
const defaultTitle = "The Mortgage Advisory, Inc. | Préstamos hipotecarios en español";
const defaultDescription =
  "Prestamista y corredor hipotecario en CA, TX, FL y CO (NMLS #1549739): compra de casa, refinanciamiento, HELOC, hipoteca inversa, FHA, VA y Non-QM.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : siteUrl,
  ),
  title: { default: defaultTitle, template: `%s | ${licensing.brandName}` },
  description: defaultDescription,
  applicationName: licensing.brandName,
  alternates: { canonical: "/es", languages: { "en-US": "/", "es-US": "/es", "x-default": "/" } },
  openGraph: {
    type: "website",
    siteName: licensing.brandName,
    title: defaultTitle,
    description: defaultDescription,
    url: "/es",
    locale: "es_US",
    alternateLocale: ["en_US"],
  },
  twitter: { card: "summary_large_image", title: defaultTitle, description: defaultDescription },
};

export default function SpanishRootLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="es">{children}</SiteShell>;
}
