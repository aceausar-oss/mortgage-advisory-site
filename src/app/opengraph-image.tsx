import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "The Mortgage Advisory: your home could be your housing pension. Reverse mortgages, HELOCs, and home loans. NMLS #1549739";
export const size = shareSize;
export const contentType = shareContentType;

// Site-wide link preview (Ace chose option B, Oct 2026). Pages with their own opengraph-image override it.
export default function Image() {
  return shareImage({
    photo: "/images/retirement-couple.jpg",
    headline: "Your home could be your housing pension",
    sub: "Reverse mortgages · HELOCs · Home loans",
    position: "center 25%",
    flags: true,
  });
}
