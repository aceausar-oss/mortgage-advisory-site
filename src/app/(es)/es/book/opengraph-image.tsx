import { SPANISH_FAMILY, shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "Reserve una llamada con un asesor de The Mortgage Advisory";
export const size = shareSize;
export const contentType = shareContentType;

export default function Image() {
  return shareImage({
    photo: SPANISH_FAMILY.photo,
    headline: "Reserve una llamada con un asesor",
    sub: "En español o en inglés · Hipotecas inversas · HELOC · Refinanciamiento · Comprar casa",
    position: SPANISH_FAMILY.position,
  });
}
