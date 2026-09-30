import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AuthorBox, Breadcrumbs, DraftBanner, SourcesList, TldrBox } from "@/components/AnswerParts";
import { DidYouKnow } from "@/components/DidYouKnow";
import { Disclosures } from "@/components/Disclosures";
import { JsonLd } from "@/components/JsonLd";
import { bookingTypes } from "@/lib/home";
import { getEntry } from "@/lib/kb";
import type { LoanPage } from "@/lib/loans";
import { licensing, siteUrl, stateCodes } from "@/lib/site";

// Shared layout for loan program pages (/loans/*) and state pages (/locations/*), per the page template (CLAUDE.md §6).
// "Who funds your loan?" (CLAUDE.md §8): say plainly whether we're the lender or the broker.
const FUNDING: Record<LoanPage["funding"], string> = {
  direct:
    "We're the direct lender on this loan. We make the loan decision and fund it ourselves. (In Florida, where we're licensed as a mortgage broker, we arrange it through an approved lender and tell you upfront who your lender is and how we're paid.)",
  broker:
    "We arrange this loan through approved partner lenders and act as your mortgage broker. The partner lender funds the loan. We'll tell you upfront who your lender is and exactly how we're paid; it's all on your Loan Estimate.",
  mixed:
    "It depends on the loan. We're the direct lender on conventional, VA, and Non-QM loans (in Florida, where we're licensed as a mortgage broker, every loan is arranged through an approved lender). FHA loans, reverse mortgages, and HELOCs are arranged through approved partner lenders, with us as your mortgage broker. Either way, we tell you upfront who your lender is and how we're paid; it's all on your Loan Estimate.",
};

function WhoFunds({ funding }: { funding: LoanPage["funding"] }) {
  return (
    <section aria-labelledby="who-funds" className="rounded-2xl border border-brand-blue/50 bg-white p-5">
      <h2 id="who-funds" className="font-heading text-lg font-semibold">
        Who funds your loan?
      </h2>
      <p className="mt-1 leading-relaxed">{FUNDING[funding]}</p>
    </section>
  );
}

function RelatedAnswers({ slugs }: { slugs: string[] }) {
  const entries = slugs.map((s) => getEntry(s)).filter((e) => !!e);
  if (!entries.length) return null;
  return (
    <section aria-labelledby="related" className="space-y-3">
      <h2 id="related" className="font-heading text-2xl font-semibold">
        Questions people ask
      </h2>
      <ul className="space-y-2">
        {entries.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/answers/${e.slug}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3.5 font-semibold text-brand-ink ring-1 ring-brand-blue/40 hover:ring-brand-blue"
            >
              {e.question}
              <span aria-hidden="true" className="text-brand-button">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LoanCta({ page }: { page: LoanPage }) {
  const booking = bookingTypes.find((b) => b.key === page.booking);
  return (
    <section aria-label="Talk to our team" className="rounded-2xl bg-brand-slate p-6 text-white">
      <p className="font-heading text-xl font-semibold text-white">Want to see your numbers?</p>
      <p className="mt-1 text-white/90">Ask the AI assistant, or book a {booking ? `${booking.title.toLowerCase()} ` : ""}call with an advisor. No pressure, plain English.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={booking ? `/book#${booking.key}` : "/book"} className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
          Book a call with an advisor
        </Link>
        <Link
          href={`/ask?q=${encodeURIComponent(page.state ? `What are my home loan options in ${page.name}?` : `Tell me about ${page.name.toLowerCase()} options for my situation`)}`}
          className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10"
        >
          Ask the AI assistant
        </Link>
        <a href={`tel:${licensing.phoneE164}`} className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10">
          Call {licensing.phone}
        </a>
      </div>
    </section>
  );
}

export function ProgramPage({ page, extra }: { page: LoanPage; extra?: ReactNode }) {
  const url = `${siteUrl}${page.basePath}/${page.slug}`;
  const crumbs = [
    { href: "/", label: "Home" },
    { href: `${page.basePath}/${page.slug}`, label: page.name },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: page.question,
        description: page.description,
        abstract: page.tldr,
        url,
        mainEntityOfPage: url,
        dateModified: page.updated,
        datePublished: page.updated,
        inLanguage: "en-US",
        author: { "@id": `${siteUrl}/#ace-ausar` },
        publisher: { "@id": `${siteUrl}/#organization` },
        about: { "@id": `${url}#service` },
        ...(page.sources.length && { citation: page.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })) }),
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: page.name,
        serviceType: page.name,
        description: page.description,
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: (page.state ? [page.state] : stateCodes).map((s) => ({ "@type": "State", name: s })),
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${siteUrl}${c.href}` })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-[75rem] px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      <div className={page.didYouKnow.length ? "lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10" : "mx-auto max-w-3xl"}>
        <article className="min-w-0 max-w-3xl space-y-8">
          {page.isDraft && <DraftBanner />}
          <Breadcrumbs items={crumbs} />
          <header className="space-y-5">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-button">{page.name}</p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{page.question}</h1>
            {page.image && (
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl sm:aspect-[21/9]">
                <Image
                  src={page.image}
                  alt={page.imageAlt ?? ""}
                  fill
                  preload
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover"
                  style={page.imagePosition ? { objectPosition: page.imagePosition } : undefined}
                />
              </div>
            )}
            <TldrBox text={page.tldr} />
          </header>
          {page.didYouKnow.length > 0 && (
            <div className="lg:hidden">
              <DidYouKnow facts={page.didYouKnow} />
            </div>
          )}
          <div className="answer-body" dangerouslySetInnerHTML={{ __html: page.html }} />
          {extra}
          <WhoFunds funding={page.funding} />
          <RelatedAnswers slugs={page.related} />
          {page.sources.length > 0 && <SourcesList sources={page.sources} />}
          <AuthorBox entry={page} />
          <Disclosures entry={page} />
          <LoanCta page={page} />
        </article>
        {page.didYouKnow.length > 0 && (
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <DidYouKnow facts={page.didYouKnow} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
