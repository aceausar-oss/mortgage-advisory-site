import { getEntries, getEntry } from "@/lib/kb";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "A plain-English answer from The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

// A photo that fits each topic; the answer's own question is the headline.
const PHOTO: Record<string, { photo: string; position?: string }> = {
  buying: { photo: "/images/first-home-family.jpg" },
  va: { photo: "/images/loans/loan-va.jpg", position: "40% center" },
  "fha-conventional": { photo: "/images/loans/loan-fha.jpg", position: "60% center" },
  refinancing: { photo: "/images/loans/loan-refinance.jpg" },
  heloc: { photo: "/images/loans/loan-heloc.jpg", position: "40% center" },
  "debt-consolidation": { photo: "/images/goals/goal-debt-photo.jpg" },
  "reverse-mortgage": { photo: "/images/retirement-couple-2.jpg", position: "center 30%" },
  "self-employed": { photo: "/images/self-employed-cafe.jpg", position: "45% center" },
  costs: { photo: "/images/pages/costs.jpg" },
  pros: { photo: "/images/pages/pros-planner-meeting.jpg", position: "40% center" },
};

export function generateStaticParams() {
  return getEntries().map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const entry = getEntry((await params).slug);
  const pick = (entry && PHOTO[entry.category]) || { photo: "/images/pages/home-banner-photo.jpg" };
  return shareImage({
    photo: pick.photo,
    headline: entry?.question ?? "Plain-English mortgage answers",
    sub: "Answered by Ace Ausar, mortgage banker",
    position: pick.position,
  });
}
