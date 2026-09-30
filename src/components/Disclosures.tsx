import type { KbEntry } from "@/lib/kb";

// Topic-specific advertising disclosures (CLAUDE.md §8). Shown on every answer page that touches the topic.
export function Disclosures({ entry, debt: debtTopic = false }: { entry: Pick<KbEntry, "category" | "products">; debt?: boolean }) {
  const has = (p: KbEntry["products"][number]) => entry.products.includes(p);
  const reverse = entry.category === "reverse-mortgage" || has("hecm") || has("proprietary-reverse") || has("reverse-second") || has("homesafe");
  const proprietary = has("proprietary-reverse") || has("reverse-second") || has("homesafe");
  const heloc = has("heloc");
  const debt = debtTopic || entry.category === "debt-consolidation";
  const items: string[] = [];

  if (reverse) {
    items.push(
      "This material has not been reviewed, approved, or issued by HUD, FHA, or any government agency.",
      "With a reverse mortgage, borrowers must continue to pay property taxes and homeowners insurance and maintain the home. The loan becomes due when the last borrower no longer lives in the home as a primary residence, sells the home, or does not meet the loan terms.",
    );
  }
  if (proprietary) {
    items.push(
      "Proprietary reverse mortgages, including second-lien reverse mortgages, are not FHA-insured Home Equity Conversion Mortgages (HECMs). Terms, eligibility, and availability vary by program and state.",
    );
  }
  if (has("homesafe")) {
    items.push(
      "The HomeSafe reverse mortgage is a proprietary product of Finance of America Reverse LLC and is not related to the Home Equity Conversion Mortgage (HECM) program. HomeSafe products are only available in certain states.",
    );
  }
  if (heloc) {
    items.push(
      "HELOC rates may be fixed or variable depending on the program. A variable rate is based on an index plus a margin and can change over time, which changes your payment. Fees, draw requirements, and early closure fees may apply. Your home secures the line of credit.",
    );
  }
  if (debt) {
    items.push(
      "Using home equity to pay off debt turns unsecured debt into debt secured by your home. If you don't make the payments, you could lose your home. Spreading debt over a longer term can increase the total interest you pay.",
    );
  }
  if (has("va")) {
    items.push("The Mortgage Advisory is not affiliated with or endorsed by the U.S. Department of Veterans Affairs.");
  }
  if (has("fha")) {
    items.push("The Mortgage Advisory is not affiliated with or endorsed by HUD or the Federal Housing Administration.");
  }
  items.push("This is general information, not a commitment to lend. All loans are subject to credit approval, underwriting, and property valuation.");

  return (
    <aside aria-label="Important disclosures" className="rounded-2xl border border-brand-steel/40 bg-white p-5 text-sm leading-relaxed">
      <h2 className="mb-2 text-base font-semibold">Important disclosures</h2>
      <ul className="list-disc space-y-1 pl-5">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </aside>
  );
}
