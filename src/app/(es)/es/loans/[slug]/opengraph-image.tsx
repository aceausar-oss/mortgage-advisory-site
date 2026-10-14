import { getLoanPage, getLoanPages } from "@/lib/loans";
import { SPANISH_BUYERS, SPANISH_FAMILY, shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Préstamo de The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export function generateStaticParams() {
  return getLoanPages("es").map((p) => ({ slug: p.slug }));
}

// Spanish link photos (Ace, Oct 2026): homeowner topics use the couple, buying topics the young family. VA keeps its
// own photo (a service member's family), which fits that page better.
const FAMILY_TOPICS = new Set(["reverse-mortgage", "heloc", "refinance", "debt-consolidation"]);
const BUYER_TOPICS = new Set(["purchase", "fha", "conventional", "non-qm"]);

// Same card as the English loan pages (app/(en)/loans/[slug]/opengraph-image.tsx): the page's photo and question, in Spanish.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = getLoanPage((await params).slug, "es");
  const pick = page && FAMILY_TOPICS.has(page.slug) ? SPANISH_FAMILY : page && BUYER_TOPICS.has(page.slug) ? SPANISH_BUYERS : null;
  return shareImage({
    photo: pick?.photo ?? page?.image ?? "/images/pages/home-banner-photo.jpg",
    headline: page?.question ?? "Respuestas claras sobre hipotecas",
    sub: page ? `${page.name} · Respondido por Ace Ausar` : undefined,
    position: pick?.position ?? page?.imagePosition ?? "center",
    flags: page?.slug === "reverse-mortgage",
  });
}
