import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Resources for financial professionals from The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

// Also used by the printable handouts under /pros.
export default function Image() {
  return shareImage({
    photo: "/images/pages/pros-planner-meeting.jpg",
    headline: "Home equity in your clients’ retirement plans",
    sub: "Free tools for financial professionals",
    position: "40% center",
    flags: true,
  });
}
