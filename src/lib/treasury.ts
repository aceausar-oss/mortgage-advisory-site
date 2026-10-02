// Daily U.S. Treasury par yield curve rates, straight from the U.S. Treasury (public data, no key).
// Refreshed at most twice a day; if Treasury is unreachable, callers get null and render nothing.
const REVALIDATE = 12 * 60 * 60;
export const TREASURY_SOURCE_URL =
  "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve";

export type YieldPoint = { date: string; y2: number; y5: number; y10: number; y30: number };

const csvUrl = (year: number) =>
  `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/${year}/all?type=daily_treasury_yield_curve&field_tdr_date_value=${year}&page&_format=csv`;

// Treasury's site intermittently answers 403/429 to automated requests, so try a few times before giving up.
async function fetchCsv(year: number): Promise<Response> {
  let last: Response | null = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt) await new Promise((r) => setTimeout(r, 1500 * attempt));
    last = await fetch(csvUrl(year), { next: { revalidate: REVALIDATE } });
    if (last.ok) return last;
  }
  throw new Error(`Treasury ${year}: HTTP ${last?.status}`);
}

async function fetchYear(year: number): Promise<YieldPoint[]> {
  const res = await fetchCsv(year);
  const [header, ...rows] = (await res.text()).trim().split(/\r?\n/);
  const cols = header.split(",").map((c) => c.replace(/"/g, "").trim());
  const idx = (name: string) => cols.indexOf(name);
  const [iDate, i2, i5, i10, i30] = [idx("Date"), idx("2 Yr"), idx("5 Yr"), idx("10 Yr"), idx("30 Yr")];
  if ([iDate, i2, i5, i10, i30].includes(-1)) throw new Error("Treasury CSV columns changed");
  return rows.flatMap((row) => {
    const c = row.split(",");
    const [m, d, y] = c[iDate].split("/");
    const p = { date: `${y}-${m}-${d}`, y2: +c[i2], y5: +c[i5], y10: +c[i10], y30: +c[i30] };
    return [p.y2, p.y5, p.y10, p.y30].every(Number.isFinite) ? [p] : [];
  });
}

/** About 13 months of daily closes, oldest first. */
export async function getTreasuryYields(): Promise<YieldPoint[] | null> {
  try {
    const year = new Date().getFullYear();
    const [prev, cur] = await Promise.all([fetchYear(year - 1), fetchYear(year)]);
    const all = [...prev, ...cur].sort((a, b) => a.date.localeCompare(b.date));
    const cutoff = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const recent = all.filter((p) => p.date >= cutoff);
    return recent.length > 1 ? recent : null;
  } catch (err) {
    console.error("treasury data unavailable", err);
    return null;
  }
}

export const formatYieldDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
