// DSCR calculator (Ace, Nov 2026): debt service coverage ratio = monthly rent ÷ full monthly payment (PITIA).
// The visitor types in their OWN principal & interest (from a quote or their own estimate). We never work out a
// payment from a rate, and never show a rate: that would be advertising loan terms (CLAUDE.md §8, §11).
// The ratio bands only restate what the approved answer says (/answers/how-to-calculate-dscr).

export type DscrInput = {
  rent: number; // monthly
  pi: number; // monthly principal & interest
  taxes: number; // yearly
  insurance: number; // yearly
  hoa: number; // monthly
};

// The "Property A" example from /answers/how-to-calculate-dscr, so the calculator opens on a familiar case.
export const DSCR_EXAMPLE: DscrInput = { rent: 3000, pi: 2050, taxes: 4200, insurance: 1800, hoa: 0 };

export const MAX_DSCR_INPUT = 1_000_000;
export const clampMoney = (n: number) => (Number.isFinite(n) ? Math.min(Math.max(Math.round(n), 0), MAX_DSCR_INPUT) : 0);

export type DscrBand = "strong" | "covers" | "short";

export function dscr(i: DscrInput) {
  const payment = i.pi + i.taxes / 12 + i.insurance / 12 + i.hoa;
  const ratio = payment > 0 ? i.rent / payment : 0;
  const band: DscrBand = ratio >= 1.25 ? "strong" : ratio >= 1 ? "covers" : "short";
  return {
    payment,
    ratio,
    band,
    cashFlow: i.rent - payment, // before vacancy, repairs, and management
    rentFor1: payment, // rent that makes the ratio 1.00
    rentFor125: payment * 1.25,
  };
}

export const usd = (n: number) => `${n < 0 ? "−" : ""}$${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
