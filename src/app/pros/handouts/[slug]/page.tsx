import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DraftBanner } from "@/components/AnswerParts";
import { Disclosures } from "@/components/Disclosures";
import { PrintButton } from "@/components/PrintButton";
import { getHandout, getHandouts } from "@/lib/handouts";
import { fullAddress, licensing } from "@/lib/site";

// One-page handout, laid out to print cleanly (or save as PDF from the print dialog). The site header, ticker, and
// footer are hidden when printing; the handout carries its own brand line and required disclosures.
export function generateStaticParams() {
  return getHandouts().map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: PageProps<"/pros/handouts/[slug]">): Promise<Metadata> {
  const h = getHandout((await params).slug);
  if (!h) return {};
  return { title: h.title, description: h.description, alternates: { canonical: `/pros/handouts/${h.slug}` } };
}

export default async function HandoutPage({ params }: PageProps<"/pros/handouts/[slug]">) {
  const h = getHandout((await params).slug);
  if (!h) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 print:max-w-none print:space-y-4 print:p-0">
      <style>{`@media print { body > :not(main) { display: none !important; } @page { margin: 0.6in; } }`}</style>
      {h.isDraft && (
        <div className="print:hidden">
          <DraftBanner />
        </div>
      )}
      <nav className="flex flex-wrap items-center justify-between gap-3 print:hidden" aria-label="Handout actions">
        <Link href="/pros" className="font-semibold text-brand-button underline underline-offset-4">
          ← Back to resources for financial professionals
        </Link>
        <PrintButton />
      </nav>

      <div className="rounded-3xl bg-white p-6 ring-1 ring-brand-blue/40 sm:p-10 print:rounded-none print:p-0 print:ring-0">
        <header className="flex items-center justify-between gap-4 border-b border-brand-steel/30 pb-4">
          <Image src="/brand/logo-tma-2026.png" alt={licensing.brandName} width={1837} height={497} sizes="200px" className="h-10 w-auto" />
          <p className="text-right text-xs text-brand-slate">
            {licensing.phone}
            <br />
            TheMortgageAdvisory.com
          </p>
        </header>
        <h1 className="mt-6 text-3xl font-bold leading-tight">{h.title}</h1>
        <div className="answer-body mt-4" dangerouslySetInnerHTML={{ __html: h.html }} />
        <footer className="mt-8 space-y-3 border-t border-brand-steel/30 pt-4 text-xs leading-relaxed text-brand-slate">
          <p>
            {licensing.legalName} · NMLS #{licensing.nmls} · {licensing.founder.name}, NMLS #{licensing.founder.nmls} ·{" "}
            {fullAddress} · {licensing.phone} ·
            Equal Housing Lender · For educational purposes only; not legal, tax, or investment advice.
          </p>
          {h.reverse && <Disclosures entry={{ category: "reverse-mortgage", products: ["hecm", "proprietary-reverse", "reverse-second"] }} />}
        </footer>
      </div>
    </article>
  );
}
