"use client";

import Link from "next/link";
import { useId, useState } from "react";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (n: number) => `${Math.round(n * 100)}%`;

type Mode = "heloc" | "cashOut";

// Airbnb-style equity estimate (CLAUDE.md §4.3). The math is shown on purpose: pricing transparency.
// Server-rendered with default values, so the estimate and formula are readable without JavaScript.
export function EquitySlider({ maxCLTV }: { maxCLTV: Record<Mode, number> }) {
  const [homeValue, setHomeValue] = useState(750_000);
  const [balance, setBalance] = useState(300_000);
  const [cashNeeded, setCashNeeded] = useState(75_000);
  const [mode, setMode] = useState<Mode>("heloc");
  const [goal, setGoal] = useState("");
  const id = useId();
  const cltv = maxCLTV[mode];
  const available = Math.max(0, Math.round(homeValue * cltv - balance));
  const fits = cashNeeded <= available;
  const shortBy = cashNeeded - available;
  const combinedLtv = homeValue > 0 ? (balance + cashNeeded) / homeValue : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-slate">Home equity estimate</p>
        <p className="mt-2 font-heading text-3xl font-bold leading-tight text-brand-slate sm:text-4xl" aria-live="polite">
          Your home could unlock <span className="text-brand-blue-deep">{usd(available)}</span>
        </p>
        <p className="mt-2 text-sm text-brand-slate">
          {usd(homeValue)} × {pct(cltv)} − {usd(balance)} mortgage balance = <strong>{usd(available)}</strong>
        </p>
        <p className="mt-2 text-xs leading-relaxed text-brand-slate">
          Estimate only. Not an offer or commitment to lend. Subject to credit approval, property valuation, and program guidelines.{" "}
          <Link href="/how-we-estimate" className="font-semibold underline underline-offset-2">
            Learn how we estimate
          </Link>
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-brand-slate">How do you want to access it?</legend>
        <div className="inline-flex rounded-full border border-brand-steel/40 bg-white p-1">
          {(
            [
              ["heloc", "HELOC (keep your rate)"],
              ["cashOut", "Cash-out refinance"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold ${mode === key ? "bg-brand-blue text-brand-ink" : "text-brand-slate"}`}>
              <input type="radio" name={`${id}-mode`} value={key} checked={mode === key} onChange={() => setMode(key)} className="sr-only" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <Slider id={`${id}-value`} label="Home value" value={homeValue} min={150_000} max={3_000_000} step={5_000} onChange={setHomeValue} />
      <Slider id={`${id}-balance`} label="Current mortgage balance" value={balance} min={0} max={2_500_000} step={5_000} onChange={setBalance} />
      <Slider id={`${id}-cash`} label="Cash needed" value={cashNeeded} min={5_000} max={1_000_000} step={5_000} onChange={setCashNeeded} />

      <div
        aria-live="polite"
        className={`rounded-2xl p-4 text-sm leading-relaxed ring-1 ${fits ? "bg-white ring-emerald-500/40" : "bg-white ring-amber-500/50"}`}
      >
        {fits ? (
          <p>
            <strong className="text-emerald-700">Good news:</strong> {usd(cashNeeded)} fits within your estimated {usd(available)}. Your total
            borrowing would be about {pct(combinedLtv)} of your home&apos;s value.
          </p>
        ) : (
          <p>
            <strong className="text-amber-800">Close, but not quite:</strong> {usd(cashNeeded)} is about {usd(shortBy)} more than this estimate.
            You still have options: a smaller amount now, a program that allows more, or, if you&apos;re 62 or older, a reverse mortgage. Let&apos;s
            talk it through.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/ask?q=${encodeURIComponent(
            `I need about ${usd(cashNeeded)} from my home (value ${usd(homeValue)}, balance ${usd(balance)}). ${
              mode === "heloc" ? "How can I get a HELOC and keep my low first-mortgage rate?" : "Should I do a cash-out refinance?"
            }`,
          )}`}
          className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue/75"
        >
          See my {mode === "heloc" ? "HELOC" : "cash-out"} options <span aria-hidden="true">→</span>
        </Link>
        <Link
          href={`/ask?q=${encodeURIComponent("Is a reverse mortgage right for me?")}`}
          className="inline-flex items-center gap-2 rounded-full border border-brand-slate px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist"
        >
          62 or older? See your reverse mortgage options <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* One "Ask" sends the sliders along with city and goal, so the next step starts with the whole picture. */}
      <form action="/ask" method="get" className="grid gap-2 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-brand-blue/40 sm:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="value" value={homeValue} />
        <input type="hidden" name="balance" value={balance} />
        <input type="hidden" name="cash" value={cashNeeded} />
        <input type="hidden" name="product" value={mode === "heloc" ? "HELOC" : "cash-out refinance"} />
        <label className="sr-only" htmlFor={`${id}-city`}>
          City
        </label>
        <input id={`${id}-city`} name="city" placeholder="City" className="rounded-full px-4 py-2 text-brand-ink placeholder:text-brand-steel" />
        <label className="sr-only" htmlFor={`${id}-goal`}>
          Loan goal
        </label>
        <select
          id={`${id}-goal`}
          name="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className={`rounded-full bg-white px-4 py-2 ${goal ? "text-brand-ink" : "text-brand-steel"}`}
        >
          <option value="" disabled>
            Loan goal
          </option>
          <option>Get cash and keep my rate</option>
          <option>Pay off debt</option>
          <option>Home improvements</option>
          <option>Reverse mortgage</option>
          <option>Buy a home</option>
          <option>Lower my payment</option>
        </select>
        <button type="submit" className="rounded-full bg-brand-blue px-6 py-2 font-semibold text-brand-ink hover:bg-brand-blue/75">
          Ask
        </button>
      </form>
    </div>
  );
}

function Slider({ id, label, value, min, max, step, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-brand-slate">
          {label}
        </label>
        <input
          type="number"
          aria-label={`${label} in dollars`}
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-36 rounded-lg border border-brand-steel/50 px-2 py-1 text-right text-sm"
        />
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(Math.max(value, min), max)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-brand-blue-deep)]"
      />
    </div>
  );
}
