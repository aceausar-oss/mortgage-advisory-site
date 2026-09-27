import { TREASURY_SOURCE_URL, formatYieldDate, getTreasuryYields, type YieldPoint } from "@/lib/treasury";

// 10-year Treasury candle chart. Treasury publishes one closing yield per day, so 1M candles show each
// day's move from the prior close and 6M/1Y candles are weekly (open, high, low, close of daily closes).
// Server-rendered SVG with CSS-only range tabs: works with JavaScript off.
type Candle = { date: string; open: number; close: number; high: number; low: number };

const RANGES = [
  { key: "1m", label: "1M", days: 31, weekly: false, note: "Daily" },
  { key: "6m", label: "6M", days: 183, weekly: true, note: "Weekly" },
  { key: "1y", label: "1Y", days: 365, weekly: true, note: "Weekly" },
] as const;

const W = 640;
const H = 250;
const PAD = { top: 12, right: 48, bottom: 26, left: 8 };

function dailyCandles(points: YieldPoint[], from: string): Candle[] {
  return points.flatMap((p, i) => {
    if (i === 0 || p.date < from) return [];
    const open = points[i - 1].y10;
    return [{ date: p.date, open, close: p.y10, high: Math.max(open, p.y10), low: Math.min(open, p.y10) }];
  });
}

function weeklyCandles(points: YieldPoint[], from: string): Candle[] {
  const weeks = new Map<string, YieldPoint[]>();
  for (const p of points) {
    const d = new Date(`${p.date}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7)); // Monday of that week
    const key = d.toISOString().slice(0, 10);
    weeks.set(key, [...(weeks.get(key) ?? []), p]);
  }
  const keys = [...weeks.keys()].sort();
  return keys.flatMap((key, i) => {
    if (i === 0 || key < from) return [];
    const days = weeks.get(key)!;
    const prevDays = weeks.get(keys[i - 1])!;
    const open = prevDays[prevDays.length - 1].y10;
    const closes = days.map((d) => d.y10);
    return [{ date: key, open, close: closes[closes.length - 1], high: Math.max(open, ...closes), low: Math.min(open, ...closes) }];
  });
}

function CandleSvg({ candles, label, daily }: { candles: Candle[]; label: string; daily: boolean }) {
  const lo = Math.min(...candles.map((c) => c.low));
  const hi = Math.max(...candles.map((c) => c.high));
  const pad = Math.max((hi - lo) * 0.08, 0.02);
  const [min, max] = [lo - pad, hi + pad];
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + ((i + 0.5) * plotW) / candles.length;
  const y = (v: number) => PAD.top + ((max - v) / (max - min)) * plotH;
  const bodyW = Math.max(2, Math.min(14, (plotW / candles.length) * 0.6));

  const step = (max - min) / 4;
  const ticks = Array.from({ length: 5 }, (_, i) => min + step * i);
  // Daily range: a date label about once a week. Weekly ranges: one label per month. Skip labels that would collide.
  const minGap = 56;
  const months: { i: number; text: string }[] = [];
  candles.forEach((c, i) => {
    const isStart = daily ? i % 5 === 0 : i > 0 && c.date.slice(0, 7) !== candles[i - 1].date.slice(0, 7);
    if (!isStart || (months.length && x(i) - x(months[months.length - 1].i) < minGap) || x(i) < PAD.left + 16) return;
    months.push({ i, text: formatMonth(c.date, daily) });
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="h-auto w-full">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#d6e2ee" strokeWidth="1" />
          <text x={W - PAD.right + 6} y={y(t) + 4} fontSize="11" fill="#43565f">
            {t.toFixed(2)}%
          </text>
        </g>
      ))}
      {months.map(({ i, text }) => (
        <text key={i} x={x(i)} y={H - 8} fontSize="11" fill="#43565f" textAnchor="middle">
          {text}
        </text>
      ))}
      {candles.map((c, i) => {
        const down = c.close < c.open;
        const color = c.close === c.open ? "#87959f" : down ? "#15803d" : "#dc2626";
        const top = y(Math.max(c.open, c.close));
        return (
          <g key={c.date}>
            <line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth="1.5" />
            <rect x={x(i) - bodyW / 2} y={top} width={bodyW} height={Math.max(1.5, y(Math.min(c.open, c.close)) - top)} fill={color} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}

const formatMonth = (iso: string, withDay: boolean) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", withDay ? { month: "short", day: "numeric", timeZone: "UTC" } : { month: "short", year: "2-digit", timeZone: "UTC" });

export async function TreasuryChart({ idPrefix = "tsy" }: { idPrefix?: string }) {
  const data = await getTreasuryYields();
  if (!data) return null;
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const change = latest.y10 - prev.y10;
  const lastDate = new Date(`${latest.date}T12:00:00Z`);

  const panels = RANGES.map((r) => {
    const from = new Date(lastDate.getTime() - r.days * 86400000).toISOString().slice(0, 10);
    const candles = r.weekly ? weeklyCandles(data, from) : dailyCandles(data, from);
    const first = candles[0];
    const summary = `10-year Treasury yield, ${r.label} ${r.note.toLowerCase()} candles: ${first.open.toFixed(2)}% to ${latest.y10.toFixed(2)}%, low ${Math.min(...candles.map((c) => c.low)).toFixed(2)}%, high ${Math.max(...candles.map((c) => c.high)).toFixed(2)}%.`;
    return { ...r, id: `${idPrefix}-${r.key}`, candles, summary };
  }).filter((p) => p.candles.length > 1);
  const initial = panels.find((p) => p.key === "6m") ?? panels[0];

  const css = panels
    .map(
      (p) => `#${p.id}:checked ~ .tsy-panels [data-panel="${p.id}"]{display:block}
#${p.id}:checked ~ .tsy-tabs label[for="${p.id}"]{background:var(--color-brand-soft);color:var(--color-brand-ink)}
#${p.id}:focus-visible ~ .tsy-tabs label[for="${p.id}"]{outline:3px solid var(--color-brand-blue);outline-offset:2px}`,
    )
    .join("\n");

  return (
    <figure id="treasury-chart" className="relative scroll-mt-24 rounded-3xl bg-white p-5 shadow-md ring-1 ring-brand-blue/40 sm:p-6">
      <style>{`.tsy-panels [data-panel]{display:none}\n${css}`}</style>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-slate">10-Year Treasury yield</p>
          <p className="font-heading text-3xl font-bold text-brand-ink">
            {latest.y10.toFixed(2)}%{" "}
            <span className={`text-base font-semibold ${change < 0 ? "text-green-700" : change > 0 ? "text-red-600" : "text-brand-slate"}`}>
              {change < 0 ? "▼" : change > 0 ? "▲" : "■"} {Math.abs(change).toFixed(2)}
            </span>
          </p>
          <p className="text-xs text-brand-slate">Close {formatYieldDate(latest.date)}</p>
        </div>
      </div>
      <div className="mt-3">
        {panels.map((p) => (
          <input key={p.id} type="radio" name={`${idPrefix}-range`} id={p.id} defaultChecked={p.id === initial.id} className="sr-only" />
        ))}
        <div className="tsy-tabs flex gap-1" aria-label="Chart range">
          {panels.map((p) => (
            <label key={p.id} htmlFor={p.id} className="cursor-pointer rounded-lg px-3 py-1 text-sm font-semibold text-brand-slate hover:bg-mist">
              {p.label}
            </label>
          ))}
        </div>
        <div className="tsy-panels mt-2">
          {panels.map((p) => (
            <div key={p.id} data-panel={p.id}>
              <CandleSvg candles={p.candles} label={p.summary} daily={!p.weekly} />
              <p className="text-xs text-brand-slate">{p.note} candles</p>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="mt-3 space-y-1 text-sm text-brand-slate">
        <p>
          <span className="font-semibold text-green-700">Green</span> means the yield fell (usually good for mortgage rates).{" "}
          <span className="font-semibold text-red-600">Red</span> means it rose.
        </p>
        <p className="text-xs">
          Source:{" "}
          <a href={TREASURY_SOURCE_URL} className="underline" rel="noopener noreferrer" target="_blank">
            U.S. Department of the Treasury
          </a>
          , daily closing yields, updated each business day. This is market data, not a mortgage rate or an offer to lend.
        </p>
      </figcaption>
    </figure>
  );
}
