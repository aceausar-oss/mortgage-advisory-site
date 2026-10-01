import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "The Mortgage Advisory: reverse mortgages, HELOCs, and home loans in CA, TX, FL, and CO. NMLS #1549739";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share image for every page (text messages, LinkedIn, Facebook): the home photo with a white card holding the
// logo and what we do. Kept large and simple so it reads at thumbnail size.
export default async function Image() {
  const [logo, photo] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/logo-tma-2026.png"), "base64"),
    readFile(join(process.cwd(), "public/images/pages/home-banner-photo.jpg"), "base64"),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
        <img
          src={`data:image/jpeg;base64,${photo}`}
          width={1200}
          height={630}
          alt=""
          style={{ position: "absolute", inset: 0, width: 1200, height: 630, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            left: 48,
            bottom: 48,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            padding: "32px 40px",
            borderRadius: 28,
            background: "rgba(255,255,255,0.96)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
          }}
        >
          <img src={`data:image/png;base64,${logo}`} width={520} height={141} alt="" />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#231f20" }}>Reverse mortgages · HELOCs · Home loans</div>
          <div style={{ display: "flex", fontSize: 24, color: "#43565f" }}>Licensed in CA · TX · FL · CO · NMLS #1549739</div>
        </div>
      </div>
    ),
    size,
  );
}
