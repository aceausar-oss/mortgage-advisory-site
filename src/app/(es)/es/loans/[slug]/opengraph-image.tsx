import { getLoanPage, getLoanPages } from "@/lib/loans";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Préstamo de The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export function generateStaticParams() {
  return getLoanPages("es").map((p) => ({ slug: p.slug }));
}

// Same card as the English loan pages (app/(en)/loans/[slug]/opengraph-image.tsx): the page's photo and question, in Spanish.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = getLoanPage((await params).slug, "es");
  return shareImage({
    photo: page?.image ?? "/images/pages/home-banner-photo.jpg",
    headline: page?.question ?? "Respuestas claras sobre hipotecas",
    sub: page ? `${page.name} · Respondido por Ace Ausar` : undefined,
    position: page?.imagePosition ?? "center",
    flags: page?.slug === "reverse-mortgage",
  });
}
