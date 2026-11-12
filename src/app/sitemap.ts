import type { MetadataRoute } from "next";
import { getHandouts } from "@/lib/handouts";
import { getEntries } from "@/lib/kb";
import { getLoanPages, getLocationPages } from "@/lib/loans";
import { getEditions } from "@/lib/news";
import { toEs } from "@/lib/i18n";
import { QUALIFY_PATHS } from "@/lib/qualifyPaths";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Drafts never go in the sitemap, even on preview deploys.
  const answers = getEntries().filter((e) => !e.isDraft);
  const loans = [...getLoanPages(), ...getLocationPages()].filter((p) => !p.isDraft);
  const latest = answers.map((e) => e.updated).sort().at(-1);
  // Pages with a Spanish twin under /es list both languages (hreflang), and the Spanish page gets its own entry.
  const esLoans = getLoanPages("es").filter((p) => !p.isDraft);
  const both = (path: string) => ({ alternates: { languages: { "en-US": `${siteUrl}${path}`, "es-US": `${siteUrl}${toEs(path)}` } } });
  const esLoanSlugs = new Set(esLoans.map((p) => p.slug));
  const esAnswers = getEntries("es").filter((e) => !e.isDraft);
  const esAnswerSlugs = new Set(esAnswers.map((e) => e.slug));
  const editions = getEditions().filter((e) => !e.isDraft);
  const esEditions = getEditions("es").filter((e) => !e.isDraft);
  const newsLatest = editions[0]?.date;

  return [
    { url: `${siteUrl}/`, lastModified: latest ?? new Date().toISOString().slice(0, 10), ...both("/") },
    { url: `${siteUrl}/answers`, lastModified: latest ?? new Date().toISOString().slice(0, 10) },
    { url: `${siteUrl}/how-we-estimate` },
    { url: `${siteUrl}/book`, ...both("/book") },
    { url: `${siteUrl}/pre-approval`, lastModified: "2026-10-17", ...both("/pre-approval") },
    { url: `${siteUrl}/qualify`, ...both("/qualify") },
    ...QUALIFY_PATHS.map((p) => ({ url: `${siteUrl}/qualify/${p.slug}`, ...both(`/qualify/${p.slug}`) })),
    { url: `${siteUrl}/reviews` },
    { url: `${siteUrl}/news`, lastModified: newsLatest, ...both("/news") },
    { url: `${siteUrl}/es/news`, lastModified: esEditions[0]?.date, ...both("/news") },
    ...editions.map((e) => ({ url: `${siteUrl}/news/${e.slug}`, lastModified: e.date, ...both(`/news/${e.slug}`) })),
    ...esEditions.map((e) => ({ url: `${siteUrl}/es/news/${e.slug}`, lastModified: e.date, ...both(`/news/${e.slug}`) })),
    ...["life-rate", "reverse-calculator", "costs", "pros", "about", "licensing", "privacy", "terms", "accessibility", "do-not-sell"].map((p) => ({ url: `${siteUrl}/${p}` })),
    ...loans.map((p) => ({
      url: `${siteUrl}${p.basePath}/${p.slug}`,
      lastModified: p.updated,
      ...(p.basePath === "/loans" && esLoanSlugs.has(p.slug) && both(`/loans/${p.slug}`)),
    })),
    { url: `${siteUrl}/es`, ...both("/") },
    { url: `${siteUrl}/es/book`, ...both("/book") },
    { url: `${siteUrl}/es/pre-approval`, lastModified: "2026-10-17", ...both("/pre-approval") },
    { url: `${siteUrl}/es/qualify`, ...both("/qualify") },
    ...QUALIFY_PATHS.map((p) => ({ url: `${siteUrl}/es/qualify/${p.slug}`, ...both(`/qualify/${p.slug}`) })),
    ...esLoans.map((p) => ({ url: `${siteUrl}/es/loans/${p.slug}`, lastModified: p.updated, ...both(`/loans/${p.slug}`) })),
    ...answers.map((e) => ({ url: `${siteUrl}/answers/${e.slug}`, lastModified: e.updated, ...(esAnswerSlugs.has(e.slug) && both(`/answers/${e.slug}`)) })),
    ...esAnswers.map((e) => ({ url: `${siteUrl}/es/answers/${e.slug}`, lastModified: e.updated, ...both(`/answers/${e.slug}`) })),
    ...getHandouts()
      .filter((h) => !h.isDraft)
      .map((h) => ({ url: `${siteUrl}/pros/handouts/${h.slug}`, lastModified: h.updated })),
  ];
}
