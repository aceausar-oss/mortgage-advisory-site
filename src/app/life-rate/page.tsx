import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, TldrBox } from "@/components/AnswerParts";
import { Disclosures } from "@/components/Disclosures";
import { JsonLd } from "@/components/JsonLd";
import { LifeRateCalculator } from "@/components/life-rate/LifeRateCalculator";
import { DEFAULT_DEBTS, clampBalance, clampRate, type Debt } from "@/lib/lifeRate";
import { siteUrl } from "@/lib/site";

// Life Rate calculator (Ace's signature concept). Shows only the visitor's CURRENT blended rate; never a new loan's
// rate or payment (that would be advertising loan terms). The "lower" number comes from a real quote on a call.
export const metadata: Metadata = {
  title: "Life Rate Calculator",
  description: "Calculate your Life Rate: the blended interest rate on everything you owe, including your mortgage, credit cards, car loans, and solar or PACE liens.",
  alternates: { canonical: "/life-rate" },
};

const num = (v: string | string[] | undefined) => Number((Array.isArray(v) ? v[0] : v)?.replace(/[^0-9.]/g, "") ?? NaN);

export default async function LifeRatePage({ searchParams }: PageProps<"/life-rate">) {
  const sp = await searchParams;
  // Values from the no-JavaScript form submit (b_<id> balance, r_<id> rate); defaults otherwise.
  const initial: Debt[] = DEFAULT_DEBTS.map((d) => {
    const b = num(sp[`b_${d.id}`]);
    const r = num(sp[`r_${d.id}`]);
    return { ...d, balance: Number.isFinite(b) ? clampBalance(b) : d.balance, rate: Number.isFinite(r) ? clampRate(r) : d.rate };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Life Rate Calculator",
        url: `${siteUrl}/life-rate`,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: "Calculates the blended interest rate on all of a homeowner's debts: (total yearly interest ÷ total debt) × 100.",
        provider: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "Life Rate Calculator", item: `${siteUrl}/life-rate` },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[75rem] space-y-8 px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/life-rate", label: "Life Rate Calculator" },
        ]}
      />
      <header className="max-w-3xl space-y-5">
        <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-button">Life Rate calculator</p>
        <h1 className="text-3xl font-bold leading-tight sm:text-5xl">What&apos;s your Life Rate?</h1>
        <TldrBox text="Your Life Rate is the blended interest rate on everything you owe: your mortgage plus credit cards, car loans, and solar or PACE liens. A low mortgage rate can hide a much higher real cost. Enter your balances and rates below to see yours; The Mortgage Advisory can then show you how to lower it." />
      </header>

      <LifeRateCalculator initial={initial} />

      <section aria-labelledby="how" className="max-w-3xl space-y-3">
        <h2 id="how" className="text-2xl font-semibold">
          How is it calculated?
        </h2>
        <p className="leading-relaxed">
          <strong>Life Rate = (total yearly interest ÷ total debt) × 100.</strong> Each balance is multiplied by its rate to get its yearly
          interest; add those up and divide by everything you owe. It&apos;s a simple estimate: it doesn&apos;t include fees, and rates on
          cards and some loans can change.
        </p>
        <p className="leading-relaxed">
          Want the full story? Read <Link href="/answers/what-is-my-life-rate" className="font-semibold text-brand-button underline underline-offset-2">what your Life Rate is and why it matters</Link>{" "}
          and <Link href="/answers/heloc-vs-cash-out-refinance" className="font-semibold text-brand-button underline underline-offset-2">HELOC or cash-out refinance: which is better?</Link>
        </p>
      </section>

      <div className="max-w-3xl">
        <Disclosures entry={{ category: "debt-consolidation", products: ["heloc", "reverse-second"] }} debt />
      </div>
    </div>
  );
}
