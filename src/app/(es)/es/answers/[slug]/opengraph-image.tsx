import { getEntries, getEntry } from "@/lib/kb";
import { SPANISH_FAMILY, shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Una respuesta clara de The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export function generateStaticParams() {
  return getEntries("es").map((e) => ({ slug: e.slug }));
}

// Same card as the Spanish loan pages: the answer's own question over the Spanish family photo.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getEntry((await params).slug, "es");
  return shareImage({
    photo: SPANISH_FAMILY.photo,
    headline: entry?.question ?? "Respuestas claras sobre hipotecas",
    sub: "Respondido por Ace Ausar, banquero hipotecario",
    position: SPANISH_FAMILY.position,
  });
}
