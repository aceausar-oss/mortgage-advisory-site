import { getLoanPage, getLoanPages } from "@/lib/loans";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Loan program from The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export function generateStaticParams() {
  return getLoanPages().map((p) => ({ slug: p.slug }));
}

// Each loan page's own photo and question.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = getLoanPage((await params).slug);
  return shareImage({
    photo: page?.image ?? "/images/pages/home-banner-photo.jpg",
    headline: page?.question ?? "Plain-English mortgage answers",
    sub: page ? `${page.name} · Answered by Ace Ausar` : undefined,
    position: page?.imagePosition ?? "center",
    flags: page?.slug === "reverse-mortgage",
  });
}
