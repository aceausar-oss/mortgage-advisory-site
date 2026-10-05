import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Meet Ace Ausar, founder of The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export default function Image() {
  return shareImage({ photo: "/brand/ace-hero.png", headline: "Meet Ace Ausar", sub: "Mortgage banker · 25+ years · NMLS #1143018", position: "center 15%" });
}
