import type { ReactNode } from "react";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SpanishNotice } from "@/components/SpanishNotice";
import { TreasuryTicker } from "@/components/TreasuryTicker";
import { inter, montserrat } from "@/lib/fonts";
import { ui, type Lang } from "@/lib/i18n";
import { organizationJsonLd } from "@/lib/site";


// The page frame shared by the English root layout (app/(en)/layout.tsx) and the Spanish one (app/(es)/layout.tsx).
// Two root layouts so each language gets the right <html lang> in the server-rendered HTML.
export function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang === "es" ? "es-US" : "en"} className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <noscript>
          <style>{".js-only{display:none!important}.no-js-only{display:inline-flex!important}"}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-brand-slate"
        >
          {ui[lang].skip}
        </a>
        <JsonLd data={organizationJsonLd()} />
        <TreasuryTicker />
        <SiteHeader lang={lang} />
        {lang === "en" && <SpanishNotice />}
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter lang={lang} />
      </body>
    </html>
  );
}
