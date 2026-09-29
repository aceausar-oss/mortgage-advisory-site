// Ace's Life Rate (CLAUDE.md, brochure "Home Equity & Savings Guide"): the blended interest rate on everything a
// homeowner owes, weighted by balance. Life Rate = (total yearly interest ÷ total debt) × 100.
// Pure math, shared by the server-rendered (no-JS) page and the interactive calculator. Nothing is stored or sent.

export type Debt = { id: string; label: string; balance: number; rate: number };

export const MAX_BALANCE = 5_000_000;
export const MAX_RATE = 40;

export const DEFAULT_DEBTS: Debt[] = [
  { id: "mortgage", label: "Mortgage", balance: 350_000, rate: 3.25 },
  { id: "cards", label: "Credit cards", balance: 28_000, rate: 22 },
  { id: "car", label: "Car loan", balance: 30_000, rate: 8 },
  { id: "lien", label: "Solar / PACE / HERO lien", balance: 0, rate: 11 },
  { id: "other", label: "Personal or other loans", balance: 0, rate: 12 },
];

export const clampBalance = (n: number) => (Number.isFinite(n) ? Math.min(Math.max(Math.round(n), 0), MAX_BALANCE) : 0);
export const clampRate = (n: number) => (Number.isFinite(n) ? Math.min(Math.max(Math.round(n * 1000) / 1000, 0), MAX_RATE) : 0);

export function lifeRate(debts: Debt[]) {
  const rows = debts.filter((d) => d.balance > 0);
  const total = rows.reduce((s, d) => s + d.balance, 0);
  const interest = rows.reduce((s, d) => s + (d.balance * d.rate) / 100, 0);
  return {
    total,
    yearlyInterest: interest,
    rate: total > 0 ? (interest / total) * 100 : 0,
    breakdown: rows.map((d) => ({
      id: d.id,
      label: d.label,
      shareOfDebt: total > 0 ? d.balance / total : 0,
      shareOfInterest: interest > 0 ? (d.balance * d.rate) / 100 / interest : 0,
    })),
  };
}

export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const pct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
