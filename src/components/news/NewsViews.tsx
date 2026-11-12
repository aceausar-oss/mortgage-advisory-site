import Link from "next/link";
import { AuthorBox, Breadcrumbs, DraftBanner, SourcesList, TldrBox } from "@/components/AnswerParts";
import { DidYouKnow } from "@/components/DidYouKnow";
import { Disclosures } from "@/components/Disclosures";
import { JsonLd } from "@/components/JsonLd";
import { NewsHero } from "@/components/news/MarketArt";
import { EditionCard, EventsList, StatsGrid, TreasuryWeek } from "@/components/news/NewsParts";
import { NewsletterSignup } from "@/components/news/NewsletterSignup";
import { eventsJsonLd } from "@/lib/events";
import type { Lang } from "@/lib/i18n";
import { NEWS_NAME, editionDate, getEditions, newsSignupEnabled, type Edition } from "@/lib/news";
import { licensing, siteUrl } from "@/lib/site";

// Shared page bodies for The Advisory Report in English (/news) and Spanish (/es/news).

const pre = (lang: Lang) => (lang === "es" ? "/es" : "");

function Cta({ lang }: { lang: Lang }) {
  const es = lang === "es";
  return (
    <section aria-label={es ? "Hable con nuestro equipo" : "Talk to our team"} className="rounded-2xl bg-mist p-6 ring-1 ring-brand-blue/40">
      <p className="font-heading text-xl font-semibold">{es ? "¿Qué significan estos números para usted?" : "What do these numbers mean for you?"}</p>
      <p className="mt-1 text-brand-slate">
        {es ? "Hable con nuestro equipo, sin presión. Puede pedir una llamada en español." : "Talk it through with our team, no pressure and no jargon."}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={`${pre(lang)}/book`} className="rounded-full bg-brand-button px-5 py-2.5 font-semibold text-white hover:bg-brand-slate">
          {es ? "Reserve una llamada con un asesor" : "Book a call with an advisor"}
        </Link>
        <Link href={`${pre(lang)}/qualify`} className="rounded-full px-5 py-2.5 font-semibold text-brand-button ring-1 ring-brand-button hover:bg-white">
          {es ? "Vea para qué califica" : "See what you qualify for"}
        </Link>
        <a href={`tel:${licensing.phoneE164}`} className="rounded-full px-5 py-2.5 font-semibold text-brand-slate underline underline-offset-4">
          {es ? `Llame al ${licensing.phone}` : `Call ${licensing.phone}`}
        </a>
      </div>
    </section>
  );
}

export function EditionView({ e, lang }: { e: Edition; lang: Lang }) {
  const es = lang === "es";
  const url = `${siteUrl}${pre(lang)}/news/${e.slug}`;
  const crumbs = [
    { href: es ? "/es" : "/", label: es ? "Inicio" : "Home" },
    { href: `${pre(lang)}/news`, label: NEWS_NAME },
    { href: `${pre(lang)}/news/${e.slug}`, label: editionDate(e.date, lang) },
  ];
  const statSources = e.stats.map((s) => ({ title: `${s.source} (${s.asOf})`, url: s.sourceUrl }));
  const sources = [...new Map([...statSources, ...e.sources].map((s) => [s.url, s])).values()];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${url}#article`,
        headline: e.title,
        description: e.description,
        abstract: e.tldr,
        url,
        mainEntityOfPage: url,
        datePublished: e.date,
        dateModified: e.date,
        inLanguage: es ? "es-US" : "en-US",
        isPartOf: { "@type": "Periodical", name: NEWS_NAME, url: `${siteUrl}${pre(lang)}/news` },
        author: { "@id": `${siteUrl}/#ace-ausar` },
        publisher: { "@id": `${siteUrl}/#organization` },
        citation: sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })),
        image: `${url}/opengraph-image`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${siteUrl}${c.href}` })),
      },
    ],
  };
  return (
    <div className="mx-auto max-w-[75rem] space-y-8 px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      {e.isDraft && <DraftBanner lang={lang} />}
      <Breadcrumbs items={crumbs} />
      <NewsHero
        kicker={
          <>
            {NEWS_NAME} · <time dateTime={e.date}>{editionDate(e.date, lang)}</time>
          </>
        }
        title={e.title}
      />
      <div className={e.didYouKnow.length ? "lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10" : "mx-auto max-w-3xl"}>
        <article className="min-w-0 max-w-3xl space-y-8">
          <TldrBox text={e.tldr} lang={lang} />
          {e.didYouKnow.length > 0 && (
            <div className="lg:hidden">
              <DidYouKnow facts={e.didYouKnow} lang={lang} />
            </div>
          )}
          <StatsGrid stats={e.stats} lang={lang} />
          {e.treasury && <TreasuryWeek asOf={e.date} lang={lang} />}
          <div className="answer-body" dangerouslySetInnerHTML={{ __html: e.html }} />
          <EventsList lang={lang} compact />
          {newsSignupEnabled() && <NewsletterSignup lang={lang} page={`${pre(lang)}/news/${e.slug}`} />}
          <SourcesList sources={sources} lang={lang} />
          <AuthorBox entry={{ updated: e.date, reviewed_by: e.reviewed_by }} lang={lang} />
          <Disclosures entry={{ category: "costs", products: e.products }} lang={lang} />
          <Cta lang={lang} />
        </article>
        {e.didYouKnow.length > 0 && (
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <DidYouKnow facts={e.didYouKnow} lang={lang} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function NewsHubView({ lang }: { lang: Lang }) {
  const es = lang === "es";
  const editions = getEditions(lang);
  const [latest, ...past] = editions;
  const url = `${siteUrl}${pre(lang)}/news`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${url}#blog`,
        name: NEWS_NAME,
        description: es
          ? "Informe semanal de The Mortgage Advisory sobre vivienda y mercados: números con fuente, datos curiosos y lo que significan para propietarios, compradores, jubilados e inversionistas."
          : "Weekly housing and market report from The Mortgage Advisory: sourced numbers, fun facts, and what they mean for homeowners, buyers, retirees, and investors.",
        url,
        inLanguage: es ? "es-US" : "en-US",
        publisher: { "@id": `${siteUrl}/#organization` },
        author: { "@id": `${siteUrl}/#ace-ausar` },
        blogPost: editions
          .filter((e) => !e.isDraft)
          .map((e) => ({ "@type": "BlogPosting", headline: e.title, url: `${url}/${e.slug}`, datePublished: e.date })),
      },
      ...eventsJsonLd(lang),
    ],
  };
  return (
    <div className="mx-auto max-w-[75rem] space-y-10 px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      <header className="space-y-4">
        <Breadcrumbs items={[{ href: es ? "/es" : "/", label: es ? "Inicio" : "Home" }, { href: `${pre(lang)}/news`, label: NEWS_NAME }]} />
        <NewsHero kicker={es ? "Noticias de vivienda y mercados · Cada lunes" : "Housing & market news · Every Monday"} title={NEWS_NAME}>
          {es
            ? "¿Qué está pasando con los precios de las casas, el valor líquido y los mercados esta semana? Cada lunes, The Mortgage Advisory reúne los números que importan, cada uno con su fuente, más algunos datos curiosos y lo que significan para propietarios, compradores, jubilados e inversionistas en California, Texas, Florida y Colorado."
            : "What's happening with home prices, home equity, and the markets this week? Every Monday, The Mortgage Advisory rounds up the numbers that matter, each with its source, plus a few fun facts and what they mean for homeowners, buyers, retirees, and investors in California, Texas, Florida, and Colorado."}
        </NewsHero>
      </header>
      {latest ? (
        <section aria-labelledby="latest-h" className="space-y-4">
          <h2 id="latest-h" className="text-2xl font-semibold">
            {es ? "Edición más reciente" : "Latest edition"}
          </h2>
          <EditionCard e={latest} lang={lang} big />
        </section>
      ) : (
        <p className="rounded-2xl bg-white p-6">{es ? "La primera edición llega el lunes." : "The first edition arrives Monday."}</p>
      )}
      <EventsList lang={lang} />
      {newsSignupEnabled() && <NewsletterSignup lang={lang} page={`${pre(lang)}/news`} />}
      {past.length > 0 && (
        <section aria-labelledby="past-h" className="space-y-4">
          <h2 id="past-h" className="text-2xl font-semibold">
            {es ? "Ediciones anteriores" : "Past editions"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {past.map((e) => (
              <EditionCard key={e.slug} e={e} lang={lang} />
            ))}
          </div>
        </section>
      )}
      <p className="text-sm text-brand-slate">
        <a href={`${pre(lang)}/news/rss.xml`} className="underline underline-offset-4">
          RSS
        </a>{" "}
        ·{" "}
        {es
          ? "Datos del mercado con fines informativos; no son tasas ni ofertas de The Mortgage Advisory."
          : "Market data for information only; not rates or offers from The Mortgage Advisory."}
      </p>
    </div>
  );
}
