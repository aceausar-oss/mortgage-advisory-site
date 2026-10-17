import type { MetadataRoute } from "next";
import { getHandouts } from "@/lib/handouts";
import { getEntries } from "@/lib/kb";
import { getLoanPages, getLocationPages } from "@/lib/loans";
import { toEs } from "@/lib/i18n";
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

  return [
    { url: `${siteUrl}/`, lastModified: latest ?? new Date().toISOString().slice(0, 10), ...both("/") },
    { url: `${siteUrl}/answers`, lastModified: latest ?? new Date().toISOString().slice(0, 10) },
    { url: `${siteUrl}/how-we-estimate` },
    { url: `${siteUrl}/book`, ...both("/book") },
    { url: `${siteUrl}/pre-approval`, lastModified: "2026-10-17", ...both("/pre-approval") },
    { url: `${siteUrl}/qualify`, ...both("/qualify") },
    { url: `${siteUrl}/reviews` },
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
    ...esLoans.map((p) => ({ url: `${siteUrl}/es/loans/${p.slug}`, lastModified: p.updated, ...both(`/loans/${p.slug}`) })),
    ...answers.map((e) => ({ url: `${siteUrl}/answers/${e.slug}`, lastModified: e.updated })),
    ...getHandouts()
      .filter((h) => !h.isDraft)
      .map((h) => ({ url: `${siteUrl}/pros/handouts/${h.slug}`, lastModified: h.updated })),
  ];
}
