"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { HECM, MIN_AGE, estimateReverse, usd, type ReverseEstimate } from "@/lib/reverseCalc";

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
  cta = "book",
  stacked = false,
}: {
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
    setResult(estimateReverse({ zip, value: v, balance: b, age: a }));
  }

  const range = (r: [number, number]) => (r[0] === r[1] ? usd(r[0]) : `${usd(r[0])} – ${usd(r[1])}`);

  async function copySummary() {
    if (!result) return;
    const lines = [
      "Reverse mortgage estimate (The Mortgage Advisory)",
      `Youngest borrower: ${digits(age)} · Home value: ${usd(digits(value))} · Mortgage balance: ${usd(Number.isFinite(digits(balance)) ? digits(balance) : 0)} · ZIP: ${zip}`,
      `Fit: ${FIT_TEXT[result.fit].label}`,
      ...(result.fit === "strong" || result.fit === "possible"
        ? [`Adjustable-rate (line of credit or monthly payments): ${range(result.arm.available)}`, `Fixed-rate (one lump sum): ${range(result.fixed.available)}`]
        : []),
      "Estimate only. A loan officer's quote is more accurate. TheMortgageAdvisory.com/reverse-calculator",
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
    <section aria-labelledby={`${id}-h`} className={`grid gap-6 ${!stacked && result ? "lg:grid-cols-[1fr_1.1fr]" : ""}`}>
      <form
        onSubmit={calculate}
        className={`space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6 ${!stacked && !result ? "lg:max-w-2xl" : ""}`}
        noValidate
      >
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
          <span className={hint}>Age at the nearest birthday: if the next birthday is within 6 months, use that age. If a spouse is younger, use the spouse&apos;s age, even if they won&apos;t be on the loan.</span>
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
        {result && (
          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <div className={`rounded-xl p-4 ring-1 ${FIT_TEXT[result.fit].tone}`}>
              <p className="font-heading text-lg font-semibold">{FIT_TEXT[result.fit].label}</p>
              <p className="mt-1">{FIT_TEXT[result.fit].body}</p>
            </div>

            {(result.fit === "strong" || result.fit === "possible") && (
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-mist p-4 sm:col-span-2">
                  <dt className="text-sm font-semibold text-brand-slate">Adjustable-rate: estimated available after paying off the mortgage and costs</dt>
                  <dd className="mt-1 font-heading text-3xl font-bold text-brand-ink">{range(result.arm.available)}</dd>
                  <dd className="mt-1 text-sm text-brand-slate">As a line of credit that grows, monthly payments, or a mix.</dd>
                </div>
                <div className="rounded-xl bg-mist p-4 sm:col-span-2">
                  <dt className="text-sm font-semibold text-brand-slate">Fixed-rate: estimated lump sum at closing</dt>
                  <dd className="mt-1 text-xl font-bold">{result.fixed.available[1] > 0 ? range(result.fixed.available) : "Not enough after payoff and costs"}</dd>
                  <dd className="mt-1 text-sm text-brand-slate">One payout at closing, limited by HUD&apos;s first-year rules.</dd>
                </div>
                <div className="rounded-xl bg-mist p-4">
                  <dt className="text-sm font-semibold text-brand-slate">Estimated total loan limit (adjustable)</dt>
                  <dd className="mt-1 text-xl font-bold">{range(result.arm.principalLimit)}</dd>
                </div>
                <div className="rounded-xl bg-mist p-4">
                  <dt className="text-sm font-semibold text-brand-slate">Estimated upfront costs (can be paid from the loan)</dt>
                  <dd className="mt-1 text-xl font-bold">{range(result.costs)}</dd>
                </div>
              </dl>
            )}

            <ul className="list-disc space-y-1 pl-5 text-sm text-brand-slate">
              {result.arm.firstYearCap !== null && (
                <li>Adjustable-rate: in the first 12 months, about {usd(result.arm.firstYearCap)} is available; the rest opens up after year one.</li>
              )}
              {result.aboveLimit && (
                <li>Your home is worth more than FHA&apos;s limit, so a HECM only counts {usd(result.countedValue)}. A jumbo reverse mortgage may provide more.</li>
              )}
              {result.state === null && <li>That ZIP code looks outside California, Texas, Florida, and Colorado, where we lend.</li>}
              <li>Not an offer or commitment to lend. Actual amounts depend on the appraisal, interest rates, and costs at the time.</li>
            </ul>

            <p className="rounded-xl border-l-4 border-brand-blue bg-mist p-4 font-semibold text-brand-ink">
              These numbers are estimates only. A quote from a licensed loan officer is more accurate.{" "}
              <Link href="/book#reverse" className="text-brand-button underline underline-offset-4">
                Book a call for an accurate quote
              </Link>
              .
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/book#reverse" className="rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue">
                {cta === "pros" ? "Book a case review" : "Book a call with an advisor"}
              </Link>
              <button type="button" onClick={copySummary} className="rounded-full border border-brand-blue px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
                {copied ? "Copied" : "Copy summary"}
              </button>
            </div>
            <p className="text-xs leading-relaxed text-brand-slate">
              How we estimate: HUD&apos;s Principal Limit Factor tables for adjustable- and fixed-rate HECMs, based on the youngest
              borrower&apos;s age and typical current lender pricing; FHA&apos;s 2% upfront insurance, HUD&apos;s origination fee cap, and
              typical third-party costs. FHA counts home value up to {usd(HECM.maxClaimAmount)} in {HECM.maxClaimYear}.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
