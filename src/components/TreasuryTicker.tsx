import Link from "next/link";
import { formatYieldDate, getTreasuryYields, type YieldPoint } from "@/lib/treasury";

// Slim market bar above the header (like Mortgage News Daily's): official Treasury yields only.
// We never show a mortgage rate here; advertised rates need APR and full terms (CLAUDE.md §8).
const ITEMS: { key: keyof Omit<YieldPoint, "date">; label: string }[] = [
  { key: "y10", label: "10-Yr Treasury" },
  { key: "y2", label: "2-Yr" },
  { key: "y5", label: "5-Yr" },
  { key: "y30", label: "30-Yr" },
];

export async function TreasuryTicker() {
  const data = await getTreasuryYields();
  if (!data) return null;
  const today = data[data.length - 1];
  const prev = data[data.length - 2];

  return (
    <div className="bg-brand-slate text-white">
      <div className="relative mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto whitespace-nowrap px-4 py-1.5 text-xs sm:px-6">
        {ITEMS.map(({ key, label }) => {
          const change = today[key] - prev[key];
          const down = change < 0;
          return (
            <span key={key} className={key === "y10" ? "font-semibold" : ""}>
              {label} <span className="tabular-nums">{today[key].toFixed(2)}%</span>{" "}
              <span className={`tabular-nums ${change === 0 ? "" : down ? "text-emerald-300" : "text-rose-300"}`}>
                <span aria-hidden="true">{change === 0 ? "■" : down ? "▼" : "▲"}</span>
                <span className="sr-only">{change === 0 ? "unchanged" : down ? "down" : "up"}</span>
                {Math.abs(change).toFixed(2)}
              </span>
            </span>
          );
        })}
        <span className="text-white/80">Close {formatYieldDate(today.date)}</span>
        <Link href="/answers/why-mortgage-rates-jumped-lock-or-wait#treasury-chart" className="font-semibold underline underline-offset-2">
          How this moves mortgage rates →
        </Link>
      </div>
    </div>
  );
}
