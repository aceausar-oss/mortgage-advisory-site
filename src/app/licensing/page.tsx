import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/AnswerParts";
import { Disclosures } from "@/components/Disclosures";
import { EqualHousingLenderLogo } from "@/components/EqualHousingLenderLogo";
import { fullAddress, licensing } from "@/lib/site";

// Full licensing & disclosures (CLAUDE.md §8). Every fact comes from content/data/licensing.json; placeholders
// still marked for verification block a production build until Ace supplies the license numbers and wording.
export const metadata: Metadata = {
  title: "Licensing & Disclosures",
  description: `${licensing.legalName} (NMLS #${licensing.nmls}) state licenses in California, Texas, Florida, and Colorado, plus required disclosures.`,
  alternates: { canonical: "/licensing" },
};

export default function LicensingPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/licensing", label: "Licensing & Disclosures" },
        ]}
      />
      <header className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">Licensing &amp; Disclosures</h1>
        <p className="text-lg leading-relaxed">{licensing.entityStatement}</p>
      </header>

      <section aria-labelledby="company" className="space-y-2 rounded-2xl bg-mist p-5 ring-1 ring-brand-blue/40">
        <h2 id="company" className="font-heading text-xl font-semibold">
          Company
        </h2>
        <p>
          {licensing.legalName} · NMLS #{licensing.nmls} ·{" "}
          <a href={licensing.nmlsConsumerAccessUrl} rel="noopener" className="font-semibold text-brand-button underline underline-offset-4">
            Look us up on NMLS Consumer Access
          </a>
        </p>
        <p>
          {fullAddress} · <a href={`tel:${licensing.phoneE164}`} className="underline underline-offset-4">{licensing.phone}</a> ·{" "}
          <a href={`mailto:${licensing.email}`} className="underline underline-offset-4">
            {licensing.email}
          </a>
        </p>
      </section>

      <section aria-labelledby="states" className="space-y-4">
        <h2 id="states" className="font-heading text-2xl font-semibold">
          State licenses
        </h2>
        {licensing.states.map((s) => (
          <div key={s.code} className="space-y-1 rounded-2xl border border-brand-steel/30 p-5">
            <h3 className="font-heading text-lg font-semibold">{s.name}</h3>
            <p>
              <span className="font-semibold">Regulator:</span> {s.regulator}
            </p>
            <p>
              <span className="font-semibold">License:</span> {s.licenseType} · #{s.licenseNumber}
            </p>
            <p className="text-sm leading-relaxed text-brand-slate">{s.statement}</p>
          </div>
        ))}
      </section>

      <section aria-labelledby="lender-broker" className="space-y-2">
        <h2 id="lender-broker" className="font-heading text-2xl font-semibold">
          Lender or broker?
        </h2>
        <p className="leading-relaxed">
          We are the direct lender on conventional, VA, and Non-QM loans. FHA loans, reverse mortgages, and HELOCs are arranged through
          approved partner lenders, with {licensing.brandName} acting as mortgage broker. Your Loan Estimate shows who your lender is and how we
          are paid. See <Link href="/costs" className="underline underline-offset-4">costs and how we&apos;re paid</Link>.
        </p>
      </section>

      <section aria-labelledby="ehl" className="flex items-center gap-4 rounded-2xl border border-brand-steel/30 p-5">
        <EqualHousingLenderLogo className="h-14 w-14 shrink-0 text-brand-slate" />
        <p id="ehl" className="leading-relaxed">
          <span className="font-semibold">Equal Housing Lender.</span> We do business in accordance with the Fair Housing Act and the Equal
          Credit Opportunity Act.
        </p>
      </section>

      <Disclosures entry={{ category: "reverse-mortgage", products: ["hecm", "reverse-second", "heloc", "va", "fha"] }} debt />
    </article>
  );
}
