import { SPANISH_FAMILY, shareContentType, shareImage, shareSize } from "@/lib/shareImage";

export const alt = "The Mortgage Advisory: su casa podría ser su pensión de vivienda. Hipotecas inversas, HELOC y préstamos hipotecarios. NMLS #1549739";
export const size = shareSize;
export const contentType = shareContentType;

// Spanish site-wide link preview: same card as the English one (app/(en)/opengraph-image.tsx), in Spanish.
// Spanish pages with their own opengraph-image override it.
export default function Image() {
  return shareImage({
    photo: SPANISH_FAMILY.photo,
    headline: "Su casa podría ser su pensión de vivienda",
    sub: "Hipotecas inversas · HELOC · Préstamos hipotecarios",
    position: SPANISH_FAMILY.position,
    flags: true,
  });
}
