import { PRE_APPROVAL_PHOTO as PHOTO } from "@/lib/preApproval";
import { shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "¿Cómo obtengo una preaprobación hipotecaria? The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

// Spanish link preview for /es/pre-approval: same young family as the English one (Ace, Oct 2026).
export default function Image() {
  return shareImage({
    photo: PHOTO.src,
    position: PHOTO.sharePosition,
    headline: "¿Para qué puedo calificar?",
    sub: "Preaprobación · Cuestionario de 2 minutos",
  });
}
