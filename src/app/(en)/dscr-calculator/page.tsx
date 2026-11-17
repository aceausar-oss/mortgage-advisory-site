import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, TldrBox } from "@/components/AnswerParts";
import { Disclosures } from "@/components/Disclosures";
import { DscrCalculator } from "@/components/dscr/DscrCalculator";
import { DscrFeature } from "@/components/dscr/DscrFeature";
import { JsonLd } from "@/components/JsonLd";
import { DSCR_EXAMPLE, clampMoney, type DscrInput } from "@/lib/dscr";
import { siteUrl } from "@/lib/site";

// DSCR calculator (Ace, Nov 2026), listed under Resources. The visitor enters their own principal & interest; we never
// work out a payment from a rate or show a rate. Math runs in the browser; nothing is sent or saved.
export const metadata: Metadata = {
  title: "DSCR Calculator for Rental Properties",
  description: "Free DSCR calculator: divide monthly rent by the full payment (principal, interest, taxes, insurance, HOA) to see if a rental qualifies for a DSCR loan.",
  alternates: { canonical: "/dscr-calculator" },
};

const num = (v: string | string[] | undefined) => Number((Array.isArray(v) ? v[0] : v)?.replace(/[^0-9.]/g, "") ?? NaN);

export default async function DscrCalculatorPage({ searchParams }: PageProps<"/dscr-calculator">) {
  const sp = await searchParams;
  // Values from the no-JavaScript form submit; the worked example otherwise.
  const initial = Object.fromEntries(
    (Object.keys(DSCR_EXAMPLE) as (keyof DscrInput)[]).map((k) => {
      const n = num(sp[k]);
      return [k, Number.isFinite(n) ? clampMoney(n) : DSCR_EXAMPLE[k]];
    }),
  ) as DscrInput;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "DSCR Calculator",
        url: `${siteUrl}/dscr-calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Calculates a rental property's debt service coverage ratio: monthly rent ÷ monthly principal, interest, taxes, insurance, and HOA dues.",
        provider: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "DSCR Calculator", item: `${siteUrl}/dscr-calculator` },
        ],
      },
    ],
  };

  const link = "font-semibold text-brand-button underline underline-offset-2";
  return (
    <div className="mx-auto max-w-[75rem] space-y-8 px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/dscr-calculator", label: "DSCR Calculator" },
        ]}
      />
      <header className="max-w-3xl space-y-5">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-button">DSCR calculator</p>
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">Does your rental&apos;s rent cover the payment?</h1>
        <TldrBox text="DSCR, the debt service coverage ratio, is the monthly rent divided by the full monthly payment: principal, interest, property taxes, insurance, and HOA dues. 1.00 means the rent covers the payment exactly, and most DSCR programs look for 1.00 or higher. Enter your numbers below; The Mortgage Advisory can then run them with real rent and insurance quotes." />
      </header>

      <DscrCalculator initial={initial} />

      <section aria-labelledby="how" className="max-w-3xl space-y-3">
        <h2 id="how" className="text-2xl font-semibold">
          How is DSCR calculated?
        </h2>
        <p className="leading-relaxed">
          <strong>DSCR = monthly rent ÷ monthly PITIA</strong> (principal, interest, taxes, insurance, and association dues). Taxes and insurance are
          entered as yearly amounts and divided by 12. On a purchase, the rent usually comes from the appraiser&apos;s market rent estimate or an
          existing lease; on a refinance, from the current lease.
        </p>
        <p className="leading-relaxed">
          Read more: <Link href="/answers/how-to-calculate-dscr" className={link}>how to calculate DSCR on a rental property</Link>,{" "}
          <Link href="/answers/dscr-loan-credit-score" className={link}>what credit score a DSCR loan needs</Link>, and{" "}
          <Link href="/loans/dscr" className={link}>DSCR &amp; investor loans</Link>.
        </p>
      </section>

      <div className="max-w-3xl">
        <DscrFeature showCalc={false} />
      </div>

      <div className="max-w-3xl">
        <Disclosures entry={{ category: "investor", products: ["non-qm"] }} />
      </div>
    </div>
  );
}
