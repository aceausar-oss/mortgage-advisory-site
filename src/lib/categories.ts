// FAQ tabs / knowledge-base categories (CLAUDE.md §4.5). Keys match `category` in content/kb and content/research.
export const CATEGORIES = [
  { key: "buying", label: "Buying", long: "Buying a home (incl. FHA & VA)" },
  { key: "refinancing", label: "Refinancing", long: "Refinancing" },
  { key: "heloc", label: "HELOC & Equity", long: "HELOCs & home equity" },
  { key: "debt-consolidation", label: "Debt Consolidation", long: "Debt consolidation with home equity" },
  { key: "reverse-mortgage", label: "Reverse Mortgage", long: "Reverse mortgages" },
  { key: "self-employed", label: "Self-Employed / Non-QM", long: "Self-employed & Non-QM loans" },
  { key: "costs", label: "Costs & Pricing", long: "Costs, rates & pricing" },
  { key: "about", label: "About Us", long: "About The Mortgage Advisory" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as [CategoryKey, ...CategoryKey[]];

export function categoryLabel(key: CategoryKey) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
