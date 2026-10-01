import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramPage } from "@/components/ProgramPage";
import { ReverseCalculator } from "@/components/reverse/ReverseCalculator";
import { getLoanPages, getLoanPage } from "@/lib/loans";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLoanPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/loans/[slug]">): Promise<Metadata> {
  const page = getLoanPage((await params).slug);
  if (!page) return {};
  const title = page.seoTitle ?? page.question;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: `/loans/${page.slug}` },
    openGraph: { type: "article", title, description: page.description, url: `/loans/${page.slug}`, modifiedTime: page.updated },
    robots: page.isDraft ? { index: false, follow: false } : undefined,
  };
}

export default async function LoanProgramPage({ params }: PageProps<"/loans/[slug]">) {
  const page = getLoanPage((await params).slug);
  if (!page) notFound();
  if (page.slug === "reverse-mortgage") return <ProgramPage page={page} extra={<ReverseCalculator stacked />} />;
  return <ProgramPage page={page} />;
}
