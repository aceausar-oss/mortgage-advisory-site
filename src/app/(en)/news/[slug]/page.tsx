import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditionView } from "@/components/news/NewsViews";
import { alternates } from "@/lib/i18n";
import { getEdition, getEditions } from "@/lib/news";

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return getEditions("en").map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = getEdition((await params).slug, "en");
  if (!e) return {};
  const title = e.seoTitle ?? e.title;
  return {
    title: { absolute: title },
    description: e.description,
    alternates: alternates(`/news/${e.slug}`, "en"),
    openGraph: { type: "article", title, description: e.description, url: `/news/${e.slug}`, publishedTime: e.date },
    robots: e.isDraft ? { index: false, follow: false } : undefined,
  };
}

export default async function NewsEditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const e = getEdition((await params).slug, "en");
  if (!e) notFound();
  return <EditionView e={e} lang="en" />;
}
