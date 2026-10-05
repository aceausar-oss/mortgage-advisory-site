/* eslint-disable @next/next/no-img-element -- share images are drawn by ImageResponse, which needs plain <img> */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Link-preview ("share") images for texts, email, and social posts (Ace, Oct 2026). One layout everywhere: a white
// panel with the logo, a headline that matches the page, and the license line, beside a photo that fits the page.
// Each page's opengraph-image.tsx picks its own photo and words; pages without one use the site-wide image.
export const shareSize = { width: 1200, height: 630 };
export const shareContentType = "image/png";

const FLAGS: [string, number][] = [["kr", 36], ["ch", 24], ["se", 38], ["gb", 48], ["fr", 36], ["au", 48], ["us", 46]];

const asset = async (path: string) => {
  const data = await readFile(join(process.cwd(), "public", path), "base64");
  const type = path.endsWith(".png") ? "image/png" : path.endsWith(".svg") ? "image/svg+xml" : "image/jpeg";
  return `data:${type};base64,${data}`;
};

export async function shareImage({
  photo,
  headline,
  sub,
  position = "center",
  flags = false,
}: {
  photo: string; // path under /public, e.g. "/images/pages/book-call.jpg"
  headline: string;
  sub?: string;
  position?: string; // CSS object-position for the photo
  flags?: boolean; // show the "housing pension" country flags
}) {
  const [logo, img, flagSrcs] = await Promise.all([
    asset("/brand/logo-tma-2026.png"),
    asset(photo),
    flags ? Promise.all(FLAGS.map(([c]) => asset(`/flags/${c}.svg`))) : Promise.resolve([]),
  ]);
  const size = headline.length > 70 ? 34 : headline.length > 46 ? 40 : 50;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff" }}>
        <div style={{ width: 540, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 48px 40px" }}>
          <img src={logo} width={400} height={108} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", fontSize: size, lineHeight: 1.15, color: "#231f20" }}>{headline}</div>
            {sub && <div style={{ display: "flex", fontSize: 24, lineHeight: 1.35, color: "#1f64ad" }}>{sub}</div>}
            {flags && (
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {flagSrcs.map((f, i) => (
                  <img key={i} src={f} width={FLAGS[i][1]} height={24} alt="" style={{ borderRadius: 3 }} />
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#43565f" }}>TheMortgageAdvisory.com · NMLS #1549739</div>
        </div>
        <img src={img} width={660} height={630} alt="" style={{ width: 660, height: 630, objectFit: "cover", objectPosition: position }} />
      </div>
    ),
    shareSize,
  );
}
