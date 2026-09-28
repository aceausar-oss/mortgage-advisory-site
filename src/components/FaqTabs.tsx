import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { CATEGORIES } from "@/lib/categories";
import type { KbEntry } from "@/lib/kb";
import { siteUrl } from "@/lib/site";

// Tabbed Q&A (CLAUDE.md §4.5). Tabs are CSS-only radio buttons, so they work with JavaScript off,
// and every answer is in the HTML (inactive panels are hidden, not missing) for crawlers.
export function FaqTabs({ entries, idPrefix = "faq" }: { entries: KbEntry[]; idPrefix?: string }) {
  const tabs = CATEGORIES.map((c) => ({ ...c, id: `${idPrefix}-${c.key}`, items: entries.filter((e) => e.category === c.key) }));
  const first = tabs.find((t) => t.items.length) ?? tabs[0];

  const css = tabs
    .map(
      (t) => `#${t.id}:checked ~ .faq-panels [data-panel="${t.id}"]{display:block}
#${t.id}:checked ~ .faq-tablist label[for="${t.id}"]{background:var(--color-brand-blue);color:var(--color-brand-ink);border-color:var(--color-brand-blue)}
#${t.id}:focus-visible ~ .faq-tablist label[for="${t.id}"]{outline:3px solid var(--color-brand-blue);outline-offset:2px}`,
    )
    .join("\n");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.tldr, url: `${siteUrl}/answers/${e.slug}` },
    })),
  };

  return (
    <div className="faq-tabs relative">
      <style>{`.faq-panels [data-panel]{display:none}\n${css}`}</style>
      {entries.length > 0 && <JsonLd data={faqJsonLd} />}
      {tabs.map((t) => (
        <input key={t.id} type="radio" name={`${idPrefix}-tabs`} id={t.id} defaultChecked={t.id === first.id} className="sr-only" />
      ))}
      <div className="faq-tablist flex flex-wrap gap-2" aria-label="Question topics">
        {tabs.map((t) => (
          <label
            key={t.id}
            htmlFor={t.id}
            className="cursor-pointer rounded-full border-2 border-brand-blue bg-white px-4 py-2 text-sm font-semibold text-brand-button shadow-sm hover:border-brand-blue-deep"
          >
            {t.label} <span className="font-normal">({t.items.length})</span>
          </label>
        ))}
      </div>
      <div className="faq-panels mt-6">
        {tabs.map((t) => (
          <section key={t.id} data-panel={t.id} aria-label={t.long}>
            <h2 className="sr-only">{t.long}</h2>
            {t.items.length === 0 ? (
              <p className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blue/30">
                We’re writing answers for this topic now. Have a question?{" "}
                <Link href="/book" className="font-semibold underline underline-offset-4">
                  Book a call with an advisor
                </Link>
                .
              </p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {t.items.map((e) => (
                  <li key={e.slug} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-blue/30 transition hover:shadow-md hover:ring-brand-blue">
                    <h3 className="text-lg font-semibold leading-snug">
                      {e.question}
                      {e.isDraft && <span className="ml-2 rounded bg-mist px-2 py-0.5 align-middle text-xs font-semibold">Draft</span>}
                    </h3>
                    <p className="mt-2 line-clamp-4 flex-1 leading-relaxed text-brand-ink">{e.tldr}</p>
                    <Link href={`/answers/${e.slug}`} className="mt-3 inline-block font-semibold text-brand-button underline underline-offset-4">
                      Read the full answer →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
