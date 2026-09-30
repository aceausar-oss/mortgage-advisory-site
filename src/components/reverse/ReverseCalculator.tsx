"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { MIN_AGE, estimateReverse, usd, type ReverseEstimate } from "@/lib/reverseCalc";

// Reverse mortgage calculator (shared by /reverse-calculator, the Reverse Mortgage page, and /pros).
// Four inputs, an estimated range, and a plain-English fit rating. Math runs on the device; nothing is sent or saved.
const digits = (s: string) => Number(s.replace(/[^0-9]/g, "") || NaN);
const money = (s: string) => {
  const n = digits(s);
  return Number.isFinite(n) ? n.toLocaleString("en-US") : "";
};

const FIT_TEXT: Record<ReverseEstimate["fit"], { label: string; tone: string; body: string }> = {
  strong: {
    label: "Strong fit: worth a conversation",
    tone: "bg-emerald-50 ring-emerald-600/30 text-emerald-900",
    body: "There's meaningful equity available after paying off any current mortgage and costs.",
  },
  possible: {
    label: "Possible fit",
    tone: "bg-amber-50 ring-amber-600/30 text-amber-900",
    body: "There's some equity available. Whether it's worth it depends on the goal, like removing a mortgage payment.",
  },
  "not-enough-equity": {
    label: "Not enough equity for a HECM today",
    tone: "bg-mist ring-brand-steel/40 text-brand-ink",
    body: "The current mortgage and costs would use up what a HECM allows. A reverse mortgage second, which keeps the current mortgage, or another option may still work.",
  },
  "too-young": {
    label: `HECMs start at age ${MIN_AGE}`,
    tone: "bg-mist ring-brand-steel/40 text-brand-ink",
    body: "Every borrower on an FHA-insured HECM must be 62 or older. Some private reverse mortgages start at 55 in certain states, and a younger spouse can be protected as a non-borrowing spouse.",
  },
};

export function ReverseCalculator({
  treasury10y,
  asOf,
  cta = "book",
  stacked = false,
}: {
  treasury10y: number;
  asOf: string | null;
  cta?: "book" | "pros";
  stacked?: boolean; // one column, for narrow spots like the Reverse Mortgage page
}) {
  const id = useId();
  const [zip, setZip] = useState("");
  const [value, setValue] = useState("");
  const [balance, setBalance] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ReverseEstimate | null>(null);
  const [copied, setCopied] = useState(false);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    const v = digits(value);
    const b = Number.isFinite(digits(balance)) ? digits(balance) : 0;
    const a = digits(age);
    if (!/^\d{5}$/.test(zip)) return setError("Enter a 5-digit ZIP code.");
    if (!Number.isFinite(v) || v < 50_000 || v > 50_000_000) return setError("Enter the home's approximate value.");
    if (b > v) return setError("The mortgage balance can't be more than the home value.");
    if (!Number.isFinite(a) || a < 18 || a > 120) return setError("Enter the age of the youngest borrower.");
    setError("");
    setCopied(false);
    setResult(estimateReverse({ zip, value: v, balance: b, age: a }, treasury10y));
  }

  const range = (r: [number, number]) => (r[0] === r[1] ? usd(r[0]) : `${usd(r[0])} – ${usd(r[1])}`);

  async function copySummary() {
    if (!result) return;
    const lines = [
      "Reverse mortgage estimate (The Mortgage Advisory)",
      `Youngest borrower: ${digits(age)} · Home value: ${usd(digits(value))} · Mortgage balance: ${usd(Number.isFinite(digits(balance)) ? digits(balance) : 0)} · ZIP: ${zip}`,
      `Fit: ${FIT_TEXT[result.fit].label}`,
      ...(result.fit === "strong" || result.fit === "possible" ? [`Estimated available after payoff and costs: ${range(result.available)}`] : []),
      "Estimate only, not an offer to lend. TheMortgageAdvisory.com/reverse-calculator",
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const field = "w-full rounded-xl border border-brand-steel/40 bg-white px-4 py-3 text-lg focus:border-brand-blue";
  const labelCls = "block font-semibold text-brand-ink";
  const hint = "mt-1 block text-sm text-brand-slate";

  return (
    <section aria-labelledby={`${id}-h`} className={`grid gap-6 ${stacked ? "" : "lg:grid-cols-[1fr_1.1fr]"}`}>
      <form onSubmit={calculate} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6" noValidate>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M9 6h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01M9 18h6" />
            </svg>
          </span>
          <h2 id={`${id}-h`} className="font-heading text-xl font-semibold">
            Reverse mortgage calculator
          </h2>
        </div>
        <p className="text-brand-slate">See how much cash a reverse mortgage could provide in retirement.</p>

        <label className="block">
          <span className={labelCls}>ZIP code</span>
          <input value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} inputMode="numeric" autoComplete="postal-code" className={field} />
        </label>
        <label className="block">
          <span className={labelCls}>Home value</span>
          <input value={value} onChange={(e) => setValue(money(e.target.value))} inputMode="numeric" placeholder="$" className={field} />
          <span className={hint}>Your best estimate is fine.</span>
        </label>
        <label className="block">
          <span className={labelCls}>Mortgage balance</span>
          <input value={balance} onChange={(e) => setBalance(money(e.target.value))} inputMode="numeric" placeholder="$0" className={field} />
          <span className={hint}>What&apos;s still owed on the home, including any HELOC. Enter 0 if it&apos;s paid off.</span>
        </label>
        <label className="block">
          <span className={labelCls}>Age of youngest borrower</span>
          <input value={age} onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" className={field} />
          <span className={hint}>If a spouse is younger, use the spouse&apos;s age, even if they won&apos;t be on the loan.</span>
        </label>
        {error && (
          <p role="alert" className="font-semibold text-rose-700">
            {error}
          </p>
        )}
        <button type="submit" className="w-full rounded-xl bg-brand-button px-5 py-3.5 text-lg font-semibold text-white hover:bg-brand-slate">
          Calculate →
        </button>
        <p className="text-xs text-brand-slate">Runs on this device only. Nothing you enter is sent or saved.</p>
      </form>

      <div aria-live="polite" className="space-y-4">
        {!result ? (
          <div className="flex h-full min-h-48 items-center rounded-2xl border-2 border-dashed border-brand-steel/40 p-6 text-brand-slate">
            Enter four numbers to see an estimated range and whether a reverse mortgage looks like a fit.
          </div>
        ) : (
          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <div className={`rounded-xl p-4 ring-1 ${FIT_TEXT[result.fit].tone}`}>
              <p className="font-heading text-lg font-semibold">{FIT_TEXT[result.fit].label}</p>
              <p className="mt-1">{FIT_TEXT[result.fit].body}</p>
            </div>

            {(result.fit === "strong" || result.fit === "possible") && (
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-mist p-4 sm:col-span-2">
                  <dt className="text-sm font-semibold text-brand-slate">Estimated available after paying off the mortgage and costs</dt>
                  <dd className="mt-1 font-heading text-3xl font-bold text-brand-ink">{range(result.available)}</dd>
                  <dd className="mt-1 text-sm text-brand-slate">As cash, monthly payments, a line of credit that grows, or a mix.</dd>
                </div>
                <div className="rounded-xl bg-mist p-4">
                  <dt className="text-sm font-semibold text-brand-slate">Estimated total loan limit</dt>
                  <dd className="mt-1 text-xl font-bold">{range(result.principalLimit)}</dd>
                </div>
                <div className="rounded-xl bg-mist p-4">
                  <dt className="text-sm font-semibold text-brand-slate">Estimated upfront costs (can be paid from the loan)</dt>
                  <dd className="mt-1 text-xl font-bold">{range(result.costs)}</dd>
                </div>
              </dl>
            )}

            <ul className="list-disc space-y-1 pl-5 text-sm text-brand-slate">
              {result.firstYearCap !== null && (
                <li>In the first 12 months, about {usd(result.firstYearCap)} of that is available; the rest opens up after year one.</li>
              )}
              {result.aboveLimit && (
                <li>Your home is worth more than FHA&apos;s limit, so a HECM only counts {usd(result.countedValue)}. A jumbo reverse mortgage may provide more.</li>
              )}
              {result.state === null && <li>That ZIP code looks outside California, Texas, Florida, and Colorado, where we lend.</li>}
              <li>Estimate only, not an offer or commitment to lend. Actual amounts depend on the appraisal, interest rates, and costs at the time.</li>
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href="/book" className="rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue">
                {cta === "pros" ? "Book a case review" : "Book a call with an advisor"}
              </Link>
              <button type="button" onClick={copySummary} className="rounded-full border border-brand-blue px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
                {copied ? "Copied" : "Copy summary"}
              </button>
            </div>
          </div>
        )}
        <p className="text-xs leading-relaxed text-brand-slate">
          How we estimate: HUD&apos;s Principal Limit Factor tables for an adjustable-rate HECM, based on the youngest borrower&apos;s age and an expected
          rate built from the 10-year Treasury{asOf ? ` (close ${asOf})` : ""} plus a typical lender margin; FHA&apos;s 2% upfront insurance, HUD&apos;s
          origination fee cap, and typical third-party costs. FHA counts home value up to $1,249,125 in 2026.
        </p>
      </div>
    </section>
  );
}
