import { QUALIFY_PATHS, qualifyPath } from "@/lib/qualifyPaths";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "See what you qualify for at The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;
export const generateStaticParams = () => QUALIFY_PATHS.map((p) => ({ slug: p.slug }));

// Each path's own photo and headline (same photo as its loan page).
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = qualifyPath((await params).slug) ?? QUALIFY_PATHS[0];
  return shareImage({ photo: p.photo, position: p.position, headline: p.en.share, sub: p.en.shareSub });
}
