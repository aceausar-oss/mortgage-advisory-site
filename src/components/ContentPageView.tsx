import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Breadcrumbs, TldrBox } from "@/components/AnswerParts";
import { JsonLd } from "@/components/JsonLd";
import type { ContentPage } from "@/lib/pages";
import { siteUrl } from "@/lib/site";

export function contentPageMetadata(page: ContentPage): Metadata {
  return {
    // Long legal titles (e.g. Do Not Sell or Share…) skip the brand suffix to stay near 60 characters.
    title: page.title.length > 35 ? { absolute: page.title } : page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.title, description: page.description, url: `/${page.slug}` },
  };
}

// Layout for content/pages/*.md: H1, optional short answer, body, optional FAQ, and extra blocks around the body.
export function ContentPageView({ page, top, bottom }: { page: ContentPage; top?: ReactNode; bottom?: ReactNode }) {
  const crumbs = [
    { href: "/", label: "Home" },
    { href: `/${page.slug}`, label: page.title },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/${page.slug}#webpage`,
        name: page.h1,
        description: page.description,
        url: `${siteUrl}/${page.slug}`,
        dateModified: page.updated,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${siteUrl}${c.href}` })),
      },
      ...(page.faq.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: page.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
            },
          ]
        : []),
    ],
  };

  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <JsonLd data={jsonLd} />
      {page.attorneyReview === "pending" && (
        <p role="note" className="rounded-xl border-2 border-dashed border-brand-slate bg-white px-4 py-3 text-sm font-semibold text-brand-slate">
          Draft — pending attorney review before launch.
        </p>
      )}
      <Breadcrumbs items={crumbs} />
      <header className="space-y-5">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{page.h1}</h1>
        {page.intro && <TldrBox text={page.intro} />}
        <p className="text-sm text-brand-slate">
          Last updated <time dateTime={page.updated}>{page.updated}</time>
        </p>
      </header>
      {top}
      <div className="answer-body" dangerouslySetInnerHTML={{ __html: page.html }} />
      {page.faq.length > 0 && (
        <section aria-labelledby="faq" className="space-y-4">
          <h2 id="faq" className="font-heading text-2xl font-semibold">
            Common questions
          </h2>
          {page.faq.map((f) => (
            <div key={f.q} className="rounded-2xl bg-mist p-5 ring-1 ring-brand-blue/40">
              <h3 className="font-heading text-lg font-semibold">{f.q}</h3>
              <p className="mt-1 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </section>
      )}
      {bottom}
    </article>
  );
}
