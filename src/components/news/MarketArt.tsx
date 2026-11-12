// Decorative market artwork for The Advisory Report (Ace, Nov 2026): a deep brand-blue gradient with a faint grid,
// rising candlesticks, a glowing trend line, and a row of rooftops along the bottom. Pure SVG (no image to load),
// hidden from screen readers, and it scales to fill whatever box it sits in.
const CANDLES = [
  [0.38, 0.52], [0.5, 0.44], [0.44, 0.5], [0.52, 0.4], [0.42, 0.48], [0.47, 0.36],
  [0.38, 0.45], [0.4, 0.3], [0.33, 0.39], [0.36, 0.26], [0.29, 0.35], [0.3, 0.2],
];
const ROOFS = "M0 300 L0 262 L40 238 L80 262 L80 250 L120 226 L165 250 L165 268 L205 244 L245 268 L245 256 L290 230 L335 256 L335 262 L380 236 L420 262 L420 248 L462 222 L505 248 L505 266 L548 240 L590 266 L590 252 L634 228 L680 252 L680 264 L722 238 L765 264 L765 250 L808 226 L850 250 L850 262 L892 236 L935 262 L935 252 L980 228 L1000 240 L1000 300 Z";

export function MarketArt({ className = "" }: { className?: string }) {
  const w = 1000;
  const h = 300;
  const step = w / (CANDLES.length + 1);
  const line = CANDLES.map(([, close], i) => `${(i + 1) * step},${close * h}`).join(" ");
  return (
    <svg aria-hidden="true" focusable="false" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <linearGradient id="ma-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b3e47" />
          <stop offset="0.55" stopColor="#2F73B6" />
          <stop offset="1" stopColor="#3D85CC" />
        </linearGradient>
        <linearGradient id="ma-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A7C8EA" stopOpacity="0.45" />
          <stop offset="1" stopColor="#A7C8EA" stopOpacity="0" />
        </linearGradient>
        <pattern id="ma-grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0H0V50" fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
        <filter id="ma-glow" x="-10%" y="-50%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect width={w} height={h} fill="url(#ma-bg)" />
      <rect width={w} height={h} fill="url(#ma-grid)" />
      <circle cx={w * 0.85} cy={h * 0.2} r="150" fill="#88B4E0" opacity="0.18" />
      {CANDLES.map(([open, close], i) => {
        const x = (i + 1) * step;
        const up = close < open;
        const top = Math.min(open, close) * h;
        const bottom = Math.max(open, close) * h;
        return (
          <g key={i} opacity="0.55">
            <line x1={x} x2={x} y1={top - 14} y2={bottom + 14} stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
            <rect x={x - 9} y={top} width="18" height={Math.max(6, bottom - top)} rx="2" fill={up ? "#A7C8EA" : "#ffffff"} fillOpacity={up ? 0.9 : 0.35} />
          </g>
        );
      })}
      <polygon points={`${step},${h} ${line} ${CANDLES.length * step},${h}`} fill="url(#ma-fill)" />
      <polyline points={line} fill="none" stroke="#ffffff" strokeWidth="6" strokeOpacity="0.35" filter="url(#ma-glow)" />
      <polyline points={line} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <path d={`M${CANDLES.length * step - 16} ${CANDLES.at(-1)![1] * h - 1} L${CANDLES.length * step} ${CANDLES.at(-1)![1] * h} L${CANDLES.length * step - 6} ${CANDLES.at(-1)![1] * h + 15}`} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d={ROOFS} fill="#1f2d34" opacity="0.55" />
    </svg>
  );
}

/** Full-width banner with the market artwork behind white text: the top of every Advisory Report page. */
export function NewsHero({ kicker, title, children, as = "h1" }: { kicker: React.ReactNode; title: string; children?: React.ReactNode; as?: "h1" | "p" }) {
  const Title = as;
  return (
    <div className="relative isolate overflow-hidden rounded-[2rem] px-6 py-10 shadow-lg sm:px-10 sm:py-14">
      <MarketArt className="absolute inset-0 -z-10 h-full w-full" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#24343c]/85 via-[#24343c]/45 to-transparent" />
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/85">{kicker}</p>
      {/* Inline color: the global heading color would otherwise win over the utility class on this dark banner. */}
      <Title className="mt-3 max-w-3xl font-heading text-3xl font-bold leading-tight sm:text-5xl" style={{ color: "#fff" }}>
        {title}
      </Title>
      {children && <div className="mt-4 max-w-3xl text-lg leading-relaxed text-white/90">{children}</div>}
    </div>
  );
}
