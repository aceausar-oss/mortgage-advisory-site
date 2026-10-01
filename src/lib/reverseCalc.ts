import plfTable from "../../content/data/hecm-plf.json";
import pricing from "../../content/data/pricing.json";

// Reverse mortgage (HECM) estimate for /reverse-calculator. Pure math, runs in the browser; nothing is sent or saved.
// Principal limit = HUD Principal Limit Factor (by the youngest borrower's age and the expected rate) × the home's value
// up to FHA's limit. Expected rates come from Ace's current pricing in pricing.json (adjustable and fixed). We never
// display a rate or payment, only estimated dollar amounts.

export const HECM = pricing.hecm;
export const MIN_AGE = 62;

export type ReverseInput = { zip: string; value: number; balance: number; age: number };

export type Fit = "strong" | "possible" | "not-enough-equity" | "too-young";

type Range = [number, number]; // low, high

export type ReverseEstimate = {
  fit: Fit;
  state: "CA" | "TX" | "FL" | "CO" | null;
  countedValue: number; // home value FHA counts (capped at the limit)
  aboveLimit: boolean;
  costs: Range;
  // Adjustable-rate HECM: line of credit, monthly payments, or a mix.
  arm: { principalLimit: Range; available: Range; firstYearCap: number | null };
  // Fixed-rate HECM: one lump sum at closing, limited to what HUD allows in the first year.
  fixed: { available: Range };
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

// First 12 months: generally the greater of 60% of the principal limit, or required payoffs and costs plus 10%.
const firstYearLimit = (pl: number, mandatory: number) => Math.max(0.6 * pl, mandatory + 0.1 * pl);

export function estimateReverse({ zip, value, balance, age }: ReverseInput): ReverseEstimate {
  const state = stateForZip(zip);
  const countedValue = Math.min(value, HECM.maxClaimAmount);
  const zero: Range = [0, 0];
  const base = { state, countedValue, aboveLimit: value > HECM.maxClaimAmount };
  if (age < MIN_AGE) return { ...base, fit: "too-young", costs: zero, arm: { principalLimit: zero, available: zero, firstYearCap: null }, fixed: { available: zero } };

  const fixedCosts = 0.02 * countedValue + originationCap(countedValue); // upfront FHA insurance + origination
  const costsLow = fixedCosts + HECM.thirdPartyCostsLow;
  const costsHigh = fixedCosts + HECM.thirdPartyCostsHigh;

  // Adjustable: low estimate uses the higher expected rate and higher costs; high estimate the reverse.
  const armPlLow = plf(age, HECM.armExpectedRateHigh) * countedValue;
  const armPlHigh = plf(age, HECM.armExpectedRateLow) * countedValue;
  const armLow = armPlLow - costsHigh - balance;
  const armHigh = armPlHigh - costsLow - balance;
  const firstYear = firstYearLimit(armPlLow, balance + costsHigh) - (balance + costsHigh);
  const firstYearCap = armLow > 0 && firstYear < armLow ? round1k(firstYear) : null;

  // Fixed: the whole loan is drawn at closing, so it's capped at the first-year limit.
  const fixedNet = (rate: number, costs: number) => {
    const pl = plf(age, rate) * countedValue;
    const mandatory = balance + costs;
    return Math.min(pl, firstYearLimit(pl, mandatory)) - mandatory;
  };
  const fixedLow = fixedNet(HECM.fixedRateHigh, costsHigh);
  const fixedHigh = fixedNet(HECM.fixedRateLow, costsLow);

  const fit: Fit = armHigh <= 0 ? "not-enough-equity" : armLow >= Math.max(50_000, 0.2 * armPlLow) ? "strong" : "possible";
  return {
    ...base,
    fit,
    costs: [round1k(costsLow), round1k(costsHigh)],
    arm: { principalLimit: [round1k(armPlLow), round1k(armPlHigh)], available: [round1k(armLow), round1k(armHigh)], firstYearCap },
    fixed: { available: [round1k(fixedLow), round1k(fixedHigh)] },
  };
}

export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
