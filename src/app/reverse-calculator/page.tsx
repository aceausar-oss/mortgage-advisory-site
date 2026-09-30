import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, TldrBox } from "@/components/AnswerParts";
import { Disclosures } from "@/components/Disclosures";
import { JsonLd } from "@/components/JsonLd";
import { ReverseCalculator } from "@/components/reverse/ReverseCalculator";
import { HECM } from "@/lib/reverseCalc";
import { siteUrl } from "@/lib/site";
import { formatYieldDate, getTreasuryYields } from "@/lib/treasury";

// Shareable reverse mortgage calculator (Ace, Sept 2026): TheMortgageAdvisory.com/reverse-calculator.
// For homeowners and for financial professionals sizing up a client. Shows dollar ranges only, never a rate or payment.
export const metadata: Metadata = {
  title: "Reverse Mortgage Calculator",
  description: "Estimate how much cash a reverse mortgage could provide, using HUD's official tables. Four numbers, a range, and an honest fit rating. Nothing is saved.",
  alternates: { canonical: "/reverse-calculator" },
};

export default async function ReverseCalculatorPage() {
  const yields = await getTreasuryYields();
  const latest = yields?.at(-1) ?? null;
  const treasury10y = latest?.y10 ?? HECM.fallbackTreasury10y;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Reverse Mortgage Calculator",
        url: `${siteUrl}/reverse-calculator`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Estimates how much a HECM reverse mortgage could provide from home value, mortgage balance, and the youngest borrower's age, using HUD Principal Limit Factor tables.",
        provider: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Reverse Mortgage Calculator", item: `${siteUrl}/reverse-calculator` },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto max-w-[75rem] space-y-8 px-4 py-12 sm:px-6">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/reverse-calculator", label: "Reverse Mortgage Calculator" }]} />
      <header className="max-w-3xl space-y-5">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">How much could a reverse mortgage give you?</h1>
        <TldrBox text="Enter your ZIP code, home value, mortgage balance, and the youngest borrower's age to see an estimated range of what an FHA-insured reverse mortgage (HECM) could provide after paying off your current mortgage and costs. The Mortgage Advisory built this calculator on HUD's official tables, and nothing you enter is sent or saved." />
      </header>

      <ReverseCalculator treasury10y={treasury10y} asOf={latest ? formatYieldDate(latest.date) : null} />

      <div className="grid max-w-3xl gap-4">
        <h2 className="font-heading text-2xl font-semibold">What should I know about this estimate?</h2>
        <ul className="list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            <strong>Age matters most.</strong> The older the youngest borrower (or spouse), the more is available.
          </li>
          <li>
            <strong>Your current mortgage gets paid off first.</strong> Want to keep a low-rate first mortgage? See{" "}
            <Link href="/answers/reverse-mortgage-keep-first-mortgage" className="font-semibold text-brand-button underline underline-offset-4">
              the reverse mortgage second
            </Link>
            .
          </li>
          <li>
            <strong>You still pay property taxes, insurance, and upkeep</strong>, and the balance grows over time. See{" "}
            <Link href="/loans/reverse-mortgage" className="font-semibold text-brand-button underline underline-offset-4">
              how a reverse mortgage works
            </Link>
            .
          </li>
          <li>
            <strong>Financial professionals:</strong> use it to size up a client before a{" "}
            <Link href="/pros" className="font-semibold text-brand-button underline underline-offset-4">
              case review
            </Link>
            . The Copy summary button gives you a note with no names in it.
          </li>
        </ul>
      </div>

      <div className="max-w-3xl">
        <Disclosures entry={{ category: "reverse-mortgage", products: ["hecm"] }} />
      </div>
    </article>
  );
}
