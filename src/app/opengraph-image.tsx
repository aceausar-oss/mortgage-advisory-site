import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "The Mortgage Advisory — mortgage lender & broker, NMLS #1549739";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social image for every page: horizontal logo on the brand mist background.
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-horizontal.png"), "base64");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #F3F8FC 0%, #FFFFFF 100%)",
        }}
      >
        <img src={`data:image/png;base64,${logo}`} width={907} height={306} alt="" />
      </div>
    ),
    size,
  );
}
