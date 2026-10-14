import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Book a call with an advisor at The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export default function Image() {
  return shareImage({ photo: "/images/pages/book-call.jpg", headline: "Book a call with an advisor", sub: "Reverse mortgages · HELOCs · Refinancing · Home buying", position: "60% center" });
}
