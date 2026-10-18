import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QualifyPageView } from "@/components/qualify/QualifyPageView";
import { alternates } from "@/lib/i18n";
import { QUALIFY_PATHS, qualifyPath } from "@/lib/qualifyPaths";

// Shareable quiz link per homeowner path: /qualify/refinance, /qualify/heloc, /qualify/reverse-mortgage.
export const dynamicParams = false;
export const generateStaticParams = () => QUALIFY_PATHS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/qualify/[slug]">): Promise<Metadata> {
  const p = qualifyPath((await params).slug);
  if (!p) return {};
  return { title: { absolute: p.en.title }, description: p.en.description, alternates: alternates(`/qualify/${p.slug}`, "en") };
}

export default async function QualifyTopicPage({ params }: PageProps<"/qualify/[slug]">) {
  const p = qualifyPath((await params).slug);
  if (!p) notFound();
  return <QualifyPageView lang="en" topic={p} />;
}
