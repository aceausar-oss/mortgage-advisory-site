import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "The Mortgage Advisory — mortgage lender & broker, NMLS #1549739";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social image for every page: the horizontal logo on white (the logo art has a white background).
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-tma-2026.png"), "base64");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <img src={`data:image/png;base64,${logo}`} width={960} height={269} alt="" />
      </div>
    ),
    size,
  );
}
