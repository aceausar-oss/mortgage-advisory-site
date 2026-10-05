import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "What does a mortgage really cost? Every fee, from The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export default function Image() {
  return shareImage({ photo: "/images/pages/costs.jpg", headline: "What does a mortgage really cost?", sub: "Every fee on paper, including how we’re paid", position: "center" });
}
