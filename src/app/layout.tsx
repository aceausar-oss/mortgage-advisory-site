import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TreasuryTicker } from "@/components/TreasuryTicker";
import { licensing, organizationJsonLd, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });

const defaultTitle = "The Mortgage Advisory, Inc. | Mortgage Banker";
const defaultDescription =
  "Mortgage lender & broker in CA, TX, FL & CO (NMLS #1549739): purchase, refi, HELOC, reverse, FHA, VA, conventional & Non-QM loans.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: defaultTitle, template: `%s | ${licensing.brandName}` },
  description: defaultDescription,
  applicationName: licensing.brandName,
  alternates: { canonical: "/" },
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <noscript>
          <style>{".js-only{display:none!important}.no-js-only{display:inline-flex!important}"}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-brand-slate"
        >
          Skip to content
        </a>
        <JsonLd data={organizationJsonLd()} />
        <TreasuryTicker />
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
