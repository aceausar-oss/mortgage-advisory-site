import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramPage } from "@/components/ProgramPage";
import { getLocationPages, getLocationPage } from "@/lib/loans";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocationPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/locations/[slug]">): Promise<Metadata> {
  const page = getLocationPage((await params).slug);
  if (!page) return {};
  const title = page.seoTitle ?? page.question;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: `/locations/${page.slug}` },
    openGraph: { type: "article", title, description: page.description, url: `/locations/${page.slug}`, modifiedTime: page.updated },
    robots: page.isDraft ? { index: false, follow: false } : undefined,
  };
}

export default async function LocationPage({ params }: PageProps<"/locations/[slug]">) {
  const page = getLocationPage((await params).slug);
  if (!page) notFound();
  return <ProgramPage page={page} />;
}
