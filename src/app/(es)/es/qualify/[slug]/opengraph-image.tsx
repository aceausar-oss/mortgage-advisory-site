import { QUALIFY_PATHS, qualifyPath } from "@/lib/qualifyPaths";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Vea para qué califica con The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;
export const generateStaticParams = () => QUALIFY_PATHS.map((p) => ({ slug: p.slug }));

// Spanish previews use the Latino homeowner couple, like the Spanish loan pages.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = qualifyPath((await params).slug) ?? QUALIFY_PATHS[0];
  return shareImage({ photo: p.photoEs, position: p.positionEs, headline: p.es.share, sub: p.es.shareSub, flags: p.slug === "reverse-mortgage" });
}
