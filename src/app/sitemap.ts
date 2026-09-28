import type { MetadataRoute } from "next";
import { getEntries } from "@/lib/kb";
import { getLoanPages, getLocationPages } from "@/lib/loans";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Drafts never go in the sitemap, even on preview deploys.
  const answers = getEntries().filter((e) => !e.isDraft);
  const loans = [...getLoanPages(), ...getLocationPages()].filter((p) => !p.isDraft);
  const latest = answers.map((e) => e.updated).sort().at(-1);

  return [
    { url: `${siteUrl}/`, lastModified: latest ?? new Date().toISOString().slice(0, 10) },
    { url: `${siteUrl}/answers`, lastModified: latest ?? new Date().toISOString().slice(0, 10) },
    { url: `${siteUrl}/how-we-estimate` },
    { url: `${siteUrl}/book` },
    { url: `${siteUrl}/reviews` },
    ...loans.map((p) => ({ url: `${siteUrl}${p.basePath}/${p.slug}`, lastModified: p.updated })),
    ...answers.map((e) => ({ url: `${siteUrl}/answers/${e.slug}`, lastModified: e.updated })),
  ];
}
