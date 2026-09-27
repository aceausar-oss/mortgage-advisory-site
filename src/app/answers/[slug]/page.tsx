import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnswerCta, AuthorBox, Breadcrumbs, DraftBanner, SourcesList, TldrBox } from "@/components/AnswerParts";
import { DidYouKnow } from "@/components/DidYouKnow";
import { Disclosures } from "@/components/Disclosures";
import { JsonLd } from "@/components/JsonLd";
import { categoryLabel } from "@/lib/categories";
import { getEntries, getEntry } from "@/lib/kb";
import { siteUrl } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getEntries().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/answers/[slug]">): Promise<Metadata> {
  const entry = getEntry((await params).slug);
  if (!entry) return {};
  const title = entry.seoTitle ?? entry.question;
  return {
    // Absolute title: the question itself is the best title; skip the "| brand" suffix to stay under 60 chars.
    title: { absolute: title },
    description: entry.description,
    alternates: { canonical: `/answers/${entry.slug}` },
    openGraph: { type: "article", title, description: entry.description, url: `/answers/${entry.slug}`, modifiedTime: entry.updated },
    robots: entry.isDraft ? { index: false, follow: false } : undefined,
  };
}

export default async function AnswerPage({ params }: PageProps<"/answers/[slug]">) {
  const entry = getEntry((await params).slug);
  if (!entry) notFound();

  const url = `${siteUrl}/answers/${entry.slug}`;
  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/answers", label: "Answers" },
    { href: `/answers?category=${entry.category}`, label: categoryLabel(entry.category) },
    { href: `/answers/${entry.slug}`, label: entry.seoTitle ?? entry.question },
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
        inLanguage: "en-US",
        author: { "@id": `${siteUrl}/#ace-ausar` },
        publisher: { "@id": `${siteUrl}/#organization` },
        ...(entry.sources.length && { citation: entry.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })) }),
        ...(entry.states.length && { spatialCoverage: entry.states.map((s) => ({ "@type": "State", name: s })) }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${siteUrl}${c.href}` })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      {/* Side-pill layout: answer column + sticky "Did you know?" rail on large screens. */}
      <div className={entry.didYouKnow.length ? "lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10" : "mx-auto max-w-3xl"}>
        <article className="min-w-0 max-w-3xl space-y-8">
          {entry.isDraft && <DraftBanner />}
          <Breadcrumbs items={crumbs} />
          <header className="space-y-5">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{entry.question}</h1>
            <TldrBox text={entry.tldr} />
          </header>
          {entry.didYouKnow.length > 0 && (
            <div className="lg:hidden">
              <DidYouKnow facts={entry.didYouKnow} />
            </div>
          )}
          <div className="answer-body" dangerouslySetInnerHTML={{ __html: entry.html }} />
          {entry.sources.length > 0 && <SourcesList sources={entry.sources} />}
          <AuthorBox entry={entry} />
          <Disclosures entry={entry} />
          <AnswerCta />
        </article>
        {entry.didYouKnow.length > 0 && (
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <DidYouKnow facts={entry.didYouKnow} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
