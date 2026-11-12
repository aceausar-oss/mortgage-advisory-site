import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthorBox, Breadcrumbs, DraftBanner, SourcesList, TldrBox } from "@/components/AnswerParts";
import { DidYouKnow } from "@/components/DidYouKnow";
import { Disclosures } from "@/components/Disclosures";
import { JsonLd } from "@/components/JsonLd";
import { GuidePopup } from "@/components/guide/GuideOffer";
import { guideEnabled } from "@/lib/guide";
import { alternates } from "@/lib/i18n";
import { getEntries, getEntry } from "@/lib/kb";
import { licensing, siteUrl } from "@/lib/site";

// Spanish answers (/es/answers/*), from content/es/kb/ (Ace, Nov 2026). Same template as the English answer page,
// with hreflang links between the twins.
export const dynamicParams = false;

export function generateStaticParams() {
  return getEntries("es").map((e) => ({ slug: e.slug }));
}

// Spanish loan page for each answer topic, used in the breadcrumb. Topics without one fall back to the Spanish homepage.
const TOPIC: Record<string, { href: string; label: string }> = {
  "reverse-mortgage": { href: "/es/loans/reverse-mortgage", label: "Hipoteca inversa" },
  heloc: { href: "/es/loans/heloc", label: "HELOC y capital" },
  refinancing: { href: "/es/loans/refinance", label: "Refinanciar" },
  buying: { href: "/es/loans/purchase", label: "Comprar casa" },
  "debt-consolidation": { href: "/es/loans/debt-consolidation", label: "Consolidar deudas" },
  "self-employed": { href: "/es/loans/non-qm", label: "Préstamos Non-QM" },
  investor: { href: "/es/loans/dscr", label: "Préstamos DSCR" },
  va: { href: "/es/loans/va", label: "Préstamos VA" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const entry = getEntry((await params).slug, "es");
  if (!entry) return {};
  const title = entry.seoTitle ?? entry.question;
  const path = `/answers/${entry.slug}`;
  return {
    title: { absolute: title },
    description: entry.description,
    alternates: alternates(path, "es"),
    openGraph: { type: "article", title, description: entry.description, url: `/es${path}`, modifiedTime: entry.updated, locale: "es_US" },
    robots: entry.isDraft ? { index: false, follow: false } : undefined,
  };
}

function SpanishCta() {
  return (
    <section aria-label="Hable con nuestro equipo" className="rounded-2xl bg-brand-slate p-6 text-white">
      <p className="font-heading text-xl font-semibold text-white">¿Tiene una pregunta sobre su situación?</p>
      <p className="mt-1 text-white/90">Hable con nuestro equipo, sin presión y sin complicaciones. Puede pedir una llamada en español.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/es/book" className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
          Reserve una llamada con un asesor
        </Link>
        <a href={`tel:${licensing.phoneE164}`} className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10">
          Llame al {licensing.phone}
        </a>
      </div>
    </section>
  );
}

export default async function SpanishAnswerPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getEntry((await params).slug, "es");
  if (!entry) notFound();

  const url = `${siteUrl}/es/answers/${entry.slug}`;
  const topic = TOPIC[entry.category];
  const crumbs = [
    { href: "/es", label: "Inicio" },
    ...(topic ? [topic] : []),
    { href: `/es/answers/${entry.slug}`, label: entry.seoTitle ?? entry.question },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: entry.question,
        description: entry.description,
        abstract: entry.tldr,
        url,
        mainEntityOfPage: url,
        dateModified: entry.updated,
        datePublished: entry.updated,
        inLanguage: "es-US",
        translationOfWork: { "@id": `${siteUrl}/answers/${entry.slug}#article` },
        author: { "@id": `${siteUrl}/#ace-ausar` },
        publisher: { "@id": `${siteUrl}/#organization` },
        ...(entry.sources.length && { citation: entry.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })) }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${siteUrl}${c.href}` })),
      },
    ],
  };

  const guide = entry.category === "reverse-mortgage" && guideEnabled();

  return (
    <div className="mx-auto max-w-[75rem] px-4 py-10 sm:px-6">
      {guide && <GuidePopup lang="es" />}
      <JsonLd data={jsonLd} />
      <div className={entry.didYouKnow.length ? "lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10" : "mx-auto max-w-3xl"}>
        <article lang="es" className="min-w-0 max-w-3xl space-y-8">
          {entry.isDraft && <DraftBanner lang="es" />}
          <Breadcrumbs items={crumbs} />
          <header className="space-y-5">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{entry.question}</h1>
            <TldrBox text={entry.tldr} lang="es" />
          </header>
          {entry.didYouKnow.length > 0 && (
            <div className="lg:hidden">
              <DidYouKnow facts={entry.didYouKnow} lang="es" />
            </div>
          )}
          <div className="answer-body" dangerouslySetInnerHTML={{ __html: entry.html }} />
          {entry.sources.length > 0 && <SourcesList sources={entry.sources} lang="es" />}
          <AuthorBox entry={entry} lang="es" />
          <Disclosures entry={entry} lang="es" />
          <SpanishCta />
        </article>
        {entry.didYouKnow.length > 0 && (
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <DidYouKnow facts={entry.didYouKnow} lang="es" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
