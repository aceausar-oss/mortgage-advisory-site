import { PRE_APPROVAL_PHOTO as PHOTO } from "@/lib/preApproval";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "How do I get pre-approved for a mortgage? The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

// Link preview for /pre-approval: the young family with keys and a SOLD sign (Ace, Oct 2026).
export default function Image() {
  return shareImage({
    photo: PHOTO.src,
    position: PHOTO.position,
    headline: "How do I get pre-approved for a mortgage?",
    sub: "2-minute quiz · No credit check",
  });
}
