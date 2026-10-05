import { getLocationPage, getLocationPages } from "@/lib/loans";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Home loans by state from The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export function generateStaticParams() {
  return getLocationPages().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = getLocationPage((await params).slug);
  return shareImage({
    photo: "/images/pages/home-banner-photo.jpg",
    headline: page?.question ?? "Home loans in California, Texas, Florida, and Colorado",
    sub: page ? `${page.name} · Licensed lender and broker` : undefined,
    position: "center 65%",
  });
}
