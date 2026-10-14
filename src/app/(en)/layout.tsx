import type { Metadata } from "next";
import { SiteShell } from "@/components/SiteShell";
import { licensing, siteUrl } from "@/lib/site";
import "../globals.css";

const defaultTitle = "The Mortgage Advisory, Inc. | Mortgage Banker";
const defaultDescription =
  "Mortgage lender & broker in CA, TX, FL & CO (NMLS #1549739): purchase, refi, HELOC, reverse, FHA, VA, conventional & Non-QM loans.";

export const metadata: Metadata = {
  // Share images (and other relative URLs) point at the address this build is served from: a test link's own address,
  // the project's production address on Vercel (themortgageadvisory.com once the domain is connected), or siteUrl locally.
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
  alternates: { canonical: "/", languages: { "en-US": "/", "es-US": "/es", "x-default": "/" } },
  openGraph: {
    type: "website",
    siteName: licensing.brandName,
    title: defaultTitle,
    description: defaultDescription,
    url: "/",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: defaultTitle, description: defaultDescription },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
