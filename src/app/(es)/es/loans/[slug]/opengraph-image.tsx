import { getLoanPage, getLoanPages } from "@/lib/loans";
import { SPANISH_FAMILY, shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Préstamo de The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export function generateStaticParams() {
  return getLoanPages("es").map((p) => ({ slug: p.slug }));
}

// Homeowner topics use the Spanish-links family photo (Ace, Oct 2026); buying topics keep their page photo.
const FAMILY_TOPICS = new Set(["reverse-mortgage", "heloc", "refinance", "debt-consolidation"]);

// Same card as the English loan pages (app/(en)/loans/[slug]/opengraph-image.tsx): the page's photo and question, in Spanish.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = getLoanPage((await params).slug, "es");
  const family = !!page && FAMILY_TOPICS.has(page.slug);
  return shareImage({
    photo: family ? SPANISH_FAMILY.photo : (page?.image ?? "/images/pages/home-banner-photo.jpg"),
    headline: page?.question ?? "Respuestas claras sobre hipotecas",
    sub: page ? `${page.name} · Respondido por Ace Ausar` : undefined,
    position: family ? SPANISH_FAMILY.position : (page?.imagePosition ?? "center"),
    flags: page?.slug === "reverse-mortgage",
  });
}
