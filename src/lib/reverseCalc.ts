import plfTable from "../../content/data/hecm-plf.json";
import pricing from "../../content/data/pricing.json";

// Reverse mortgage (HECM) estimate for /reverse-calculator. Pure math, runs in the browser; nothing is sent or saved.
// Principal limit = HUD Principal Limit Factor (by youngest borrower's age and expected rate) × the home's value up to
// FHA's limit. Expected rate = today's 10-year Treasury + a typical lender margin (Ace: 2.5%–2.625%). Most HECMs
// are priced off the 10-year SOFR swap, which usually runs below the Treasury, so this errs on the low side.
// We never display a rate or payment here, only estimated dollar amounts.

export const HECM = pricing.hecm;
export const MIN_AGE = 62;

export type ReverseInput = { zip: string; value: number; balance: number; age: number };

export type Fit = "strong" | "possible" | "not-enough-equity" | "too-young";

export type ReverseEstimate = {
  fit: Fit;
  state: "CA" | "TX" | "FL" | "CO" | null;
  countedValue: number; // home value FHA counts (capped at the limit)
  aboveLimit: boolean;
  principalLimit: [number, number]; // low, high
  costs: [number, number];
  available: [number, number]; // after paying off the mortgage and costs
  firstYearCap: number | null; // when a first-year limit applies, roughly what's available in year one
};

const round1k = (n: number) => Math.max(0, Math.round(n / 1000) * 1000);

// Rough ZIP-prefix check for the states we lend in.
export function stateForZip(zip: string): ReverseEstimate["state"] {
  const p = Number(zip.slice(0, 3));
  if (!/^\d{5}$/.test(zip)) return null;
  if (p >= 900 && p <= 961) return "CA";
  if ((p >= 750 && p <= 799) || p === 885) return "TX";
  if (p >= 320 && p <= 349) return "FL";
  if (p >= 800 && p <= 816) return "CO";
  return null;
}

function plf(age: number, expectedRate: number) {
  const a = Math.min(Math.max(Math.floor(age), plfTable.ages[0]), plfTable.ages[plfTable.ages.length - 1]);
  // Look up at the expected rate rounded down to the nearest 1/8%, within the table's range.
  const r = Math.min(Math.max(Math.floor(expectedRate * 8) / 8, plfTable.rates[0]), plfTable.rates[plfTable.rates.length - 1]);
  const ri = plfTable.rates.findIndex((x) => Math.abs(x - r) < 1e-9);
  return plfTable.plf[plfTable.ages.indexOf(a)][ri];
}

// HUD origination fee cap: greater of $2,500 or 2% of the first $200,000 plus 1% above that, max $6,000.
function originationCap(value: number) {
  return Math.min(6000, Math.max(2500, 0.02 * Math.min(value, 200_000) + 0.01 * Math.max(0, value - 200_000)));
}

export function estimateReverse({ zip, value, balance, age }: ReverseInput, treasury10y: number): ReverseEstimate {
  const state = stateForZip(zip);
  const countedValue = Math.min(value, HECM.maxClaimAmount);
  const base = { state, countedValue, aboveLimit: value > HECM.maxClaimAmount };
  const zero: [number, number] = [0, 0];
  if (age < MIN_AGE) return { ...base, fit: "too-young", principalLimit: zero, costs: zero, available: zero, firstYearCap: null };

  const fixed = 0.02 * countedValue + originationCap(countedValue); // upfront FHA insurance + origination
  const plLow = plf(age, treasury10y + HECM.marginHigh) * countedValue;
  const plHigh = plf(age, treasury10y + HECM.marginLow) * countedValue;
  const costsLow = fixed + HECM.thirdPartyCostsLow;
  const costsHigh = fixed + HECM.thirdPartyCostsHigh;
  const availLow = plLow - costsHigh - balance;
  const availHigh = plHigh - costsLow - balance;

  // First 12 months: generally the greater of 60% of the principal limit, or required payoffs and costs plus 10%.
  const mandatory = balance + costsHigh;
  const firstYearTotal = Math.max(0.6 * plLow, mandatory + 0.1 * plLow);
  const firstYear = firstYearTotal - mandatory;
  const firstYearCap = availLow > 0 && firstYear < availLow ? round1k(firstYear) : null;

  const fit: Fit = availHigh <= 0 ? "not-enough-equity" : availLow >= Math.max(50_000, 0.2 * plLow) ? "strong" : "possible";
  return {
    ...base,
    fit,
    principalLimit: [round1k(plLow), round1k(plHigh)],
    costs: [round1k(costsLow), round1k(costsHigh)],
    available: [round1k(availLow), round1k(availHigh)],
    firstYearCap,
  };
}

export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
