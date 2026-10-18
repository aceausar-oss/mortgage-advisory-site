import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QualifyPageView } from "@/components/qualify/QualifyPageView";
import { alternates } from "@/lib/i18n";
import { QUALIFY_PATHS, qualifyPath } from "@/lib/qualifyPaths";

// Spanish twin of /qualify/[slug].
export const dynamicParams = false;
export const generateStaticParams = () => QUALIFY_PATHS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: PageProps<"/es/qualify/[slug]">): Promise<Metadata> {
  const p = qualifyPath((await params).slug);
  if (!p) return {};
  return { title: { absolute: p.es.title }, description: p.es.description, alternates: alternates(`/qualify/${p.slug}`, "es") };
}

export default async function SpanishQualifyTopicPage({ params }: PageProps<"/es/qualify/[slug]">) {
  const p = qualifyPath((await params).slug);
  if (!p) notFound();
  return <QualifyPageView lang="es" topic={p} />;
}
