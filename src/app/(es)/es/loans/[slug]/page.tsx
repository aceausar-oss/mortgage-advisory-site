import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramPage } from "@/components/ProgramPage";
import { alternates } from "@/lib/i18n";
import { getLoanPage, getLoanPages } from "@/lib/loans";

// Spanish loan program pages (/es/loans/*), from content/es/loans/. Same template as English.
export const dynamicParams = false;

export function generateStaticParams() {
  return getLoanPages("es").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = getLoanPage((await params).slug, "es");
  if (!page) return {};
  const title = page.seoTitle ?? page.question;
  const path = `/loans/${page.slug}`;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: alternates(path, "es"),
    openGraph: { type: "article", title, description: page.description, url: `/es${path}`, modifiedTime: page.updated, locale: "es_US" },
    robots: page.isDraft ? { index: false, follow: false } : undefined,
  };
}

function ReverseCalculatorLink() {
  return (
    <section aria-labelledby="calc" className="rounded-2xl border border-brand-blue/50 bg-white p-5">
      <h2 id="calc" className="font-heading text-lg font-semibold">
        Calcule cuánto podría recibir
      </h2>
      <p className="mt-1 leading-relaxed">
        Nuestra calculadora de hipoteca inversa le da un estimado rápido según su edad y el valor de su casa. Por ahora está en inglés; si prefiere,
        un asesor puede hacer el cálculo con usted en español.
      </p>
      <p className="mt-3 flex flex-wrap gap-3">
        <a href="/reverse-calculator" hrefLang="en" className="rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue">
          Abrir la calculadora (en inglés)
        </a>
        <a href="/es/book#reverse" className="rounded-full border border-brand-slate px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
          Hacer el cálculo con un asesor
        </a>
      </p>
    </section>
  );
}

export default async function SpanishLoanPage({ params }: { params: Promise<{ slug: string }> }) {
  const page = getLoanPage((await params).slug, "es");
  if (!page) notFound();
  if (page.slug === "reverse-mortgage") return <ProgramPage page={page} extra={<ReverseCalculatorLink />} />;
  return <ProgramPage page={page} />;
}
