import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "How much could a reverse mortgage give you? Free calculator from The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export default function Image() {
  return shareImage({ photo: "/images/retirement-couple-2.jpg", headline: "How much could a reverse mortgage give you?", sub: "Free estimate built on HUD’s official tables", position: "center 30%" });
}
