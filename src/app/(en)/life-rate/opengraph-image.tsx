import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "What's your Life Rate? Free calculator from The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export default function Image() {
  return shareImage({ photo: "/images/goals/goal-debt-photo.jpg", headline: "What’s your Life Rate?", sub: "The real rate on everything you owe. Free calculator.", position: "center" });
}
