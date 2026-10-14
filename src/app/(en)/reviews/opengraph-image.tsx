import { reviewsData } from "@/components/Reviews";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Client reviews of The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export default function Image() {
  return shareImage({
    photo: "/images/first-home-family.jpg",
    headline: `${reviewsData.rating.toFixed(1)} stars from ${reviewsData.count} Google reviews`,
    sub: "Real reviews from real homeowners",
    position: "center",
  });
}
