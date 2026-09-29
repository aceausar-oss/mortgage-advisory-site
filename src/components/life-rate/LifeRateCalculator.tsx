"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DEFAULT_DEBTS, MAX_BALANCE, clampBalance, clampRate, lifeRate, pct, usd, type Debt } from "@/lib/lifeRate";

// Interactive Life Rate calculator. The page renders it server-side with the same numbers, and it sits inside a GET
// form, so without JavaScript the visitor edits the fixed rows and presses Calculate. Math runs on the device only.
const SERIES = { debt: "#2a78d6", interest: "#eb6834" }; // validated categorical pair (dataviz palette slots 1–2)

const short = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);

export function LifeRateCalculator({ initial }: { initial: Debt[] }) {
  const [debts, setDebts] = useState<Debt[]>(initial);
  const result = useMemo(() => lifeRate(debts), [debts]);
  const mortgage = debts.find((d) => d.id === "mortgage");

  const update = (id: string, patch: Partial<Debt>) => setDebts((ds) => ds.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const addRow = () =>
    setDebts((ds) => [...ds, { id: `extra-${Date.now()}`, label: "Other debt", balance: 10_000, rate: 15 }]);
  const removeRow = (id: string) => setDebts((ds) => ds.filter((d) => d.id !== id));

  const askQ = `My Life Rate is ${pct(result.rate)}. ${debts
    .filter((d) => d.balance > 0)
    .map((d) => `${d.label} ${short(d.balance)} at ${d.rate}%`)
    .join(", ")}. How can I lower my Life Rate?`.slice(0, 295);

  return (
    <form action="/life-rate" method="get" className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
      <fieldset className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <legend className="sr-only">Your debts</legend>
        <p className="font-heading text-lg font-semibold">What you owe</p>
        {debts.map((d, i) => {
          const fixed = DEFAULT_DEBTS.some((x) => x.id === d.id);
          return (
            <div key={d.id} className="space-y-2 border-t border-brand-steel/20 pt-4 first-of-type:border-0 first-of-type:pt-0">
              <div className="flex items-center justify-between gap-3">
                {fixed ? (
                  <span className="font-semibold">{d.label}</span>
                ) : (
                  <input
                    aria-label={`Name of debt ${i + 1}`}
                    value={d.label}
                    maxLength={40}
                    onChange={(e) => update(d.id, { label: e.target.value })}
                    className="w-full rounded-lg border border-brand-steel/40 px-2 py-1 font-semibold"
                  />
                )}
                {!fixed && (
                  <button type="button" onClick={() => removeRow(d.id)} className="text-sm font-semibold text-brand-button underline">
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <label className="text-sm">
                  <span className="sr-only">{d.label} balance</span>
                  <input
                    type="range"
                    min={0}
                    max={d.id === "mortgage" ? 2_000_000 : 250_000}
                    step={d.id === "mortgage" ? 5_000 : 500}
                    value={Math.min(d.balance, d.id === "mortgage" ? 2_000_000 : 250_000)}
                    onChange={(e) => update(d.id, { balance: clampBalance(Number(e.target.value)) })}
                    className="js-only w-full accent-[#0b64b3]"
                    aria-label={`${d.label} balance`}
                  />
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center rounded-lg border border-brand-steel/40 bg-white px-2 py-1 text-sm">
                    <span aria-hidden="true">$</span>
                    <input
                      name={fixed ? `b_${d.id}` : undefined}
                      inputMode="numeric"
                      aria-label={`${d.label} balance in dollars`}
                      value={d.balance.toLocaleString("en-US")}
                      onChange={(e) => update(d.id, { balance: clampBalance(Number(e.target.value.replace(/[^0-9]/g, ""))) })}
                      className="w-24 bg-transparent text-right tabular-nums outline-none"
                    />
                  </label>
                  <label className="flex items-center rounded-lg border border-brand-steel/40 bg-white px-2 py-1 text-sm">
                    <input
                      name={fixed ? `r_${d.id}` : undefined}
                      type="number"
                      min={0}
                      max={40}
                      step={0.125}
                      aria-label={`${d.label} interest rate in percent`}
                      value={d.rate}
                      onChange={(e) => update(d.id, { rate: clampRate(Number(e.target.value)) })}
                      className="w-16 bg-transparent text-right tabular-nums outline-none"
                    />
                    <span aria-hidden="true">%</span>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-3 border-t border-brand-steel/20 pt-4">
          <button type="button" onClick={addRow} className="js-only rounded-full border-2 border-brand-blue bg-white px-4 py-1.5 text-sm font-semibold text-brand-button">
            + Add another debt
          </button>
          <button type="submit" className="no-js-only rounded-full bg-brand-soft px-5 py-2 font-semibold text-brand-ink">
            Calculate
          </button>
          <p className="text-xs">Balances up to {usd(MAX_BALANCE)}. Rates from your statements.</p>
        </div>
      </fieldset>

      <section aria-labelledby="life-rate-result" aria-live="polite" className="space-y-6 rounded-2xl bg-charcoal p-5 text-white sm:p-6">
        <div>
          <p id="life-rate-result" className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Your Life Rate
          </p>
          <p className="font-heading text-6xl font-bold tracking-tight">{result.total > 0 ? pct(result.rate) : "—"}</p>
          {mortgage && mortgage.balance > 0 && (
            <p className="mt-1 text-white/85">compared with your {mortgage.rate}% mortgage rate</p>
          )}
          <p className="mt-3 text-lg">
            <span className="font-semibold">{usd(result.yearlyInterest)} a year</span> goes to interest on {usd(result.total)} of debt.
          </p>
        </div>

        {result.breakdown.length > 0 && (
          <figure className="rounded-xl bg-white p-4 text-brand-ink">
            <figcaption className="text-sm font-semibold">Where your interest goes</figcaption>
            <ul aria-label="Legend" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: SERIES.debt }} /> Share of what you owe
              </li>
              <li className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: SERIES.interest }} /> Share of interest you pay
              </li>
            </ul>
            <ul className="mt-3 space-y-3">
              {result.breakdown.map((b) => (
                <li key={b.id}>
                  <p className="text-sm font-semibold">{b.label}</p>
                  {(
                    [
                      ["debt", b.shareOfDebt, "of what you owe"],
                      ["interest", b.shareOfInterest, "of your interest"],
                    ] as const
                  ).map(([key, v, words]) => (
                    <div key={key} className="mt-1 flex items-center gap-2" title={`${b.label}: ${pct(v * 100, 0)} ${words}`}>
                      <div className="h-2.5 flex-1 rounded-r bg-mist">
                        <div className="h-2.5 rounded-r" style={{ width: `${Math.max(v * 100, 0.5)}%`, background: SERIES[key] }} />
                      </div>
                      <span className="w-24 shrink-0 text-right text-xs tabular-nums">
                        {pct(v * 100, 0)} {key === "debt" ? "owed" : "interest"}
                      </span>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </figure>
        )}

        <div className="space-y-3">
          <p className="text-white/90">
            Want to see how low it could go? We&apos;ll compare a HELOC, a cash-out refinance, and a reverse mortgage second with real
            quotes and every cost on paper.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/book#equity" className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-ink hover:bg-mist">
              Book a call with an advisor
            </Link>
            <Link href={`/ask?q=${encodeURIComponent(askQ)}`} className="js-only rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10">
              Show me how to lower it
            </Link>
          </div>
          <p className="text-xs text-white/75">Your numbers stay on your device. Nothing you type here is sent or saved.</p>
        </div>
      </section>
    </form>
  );
}
