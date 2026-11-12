import { getEdition, getEditions } from "@/lib/news";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "The Advisory Report from The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export function generateStaticParams() {
  return getEditions("en").map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const e = getEdition((await params).slug, "en");
  return shareImage({
    photo: "/images/pages/home-banner-photo.jpg",
    headline: e?.title ?? "The Advisory Report",
    sub: "The Advisory Report · Every Monday",
  });
}
