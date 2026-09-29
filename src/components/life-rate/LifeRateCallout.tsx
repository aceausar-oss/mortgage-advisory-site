import Link from "next/link";

// Small charcoal banner that sends visitors to the Life Rate calculator (Costs and Answers pages).
export function LifeRateCallout() {
  return (
    <aside aria-label="Life Rate calculator" className="flex flex-col gap-4 rounded-2xl bg-charcoal p-6 text-white sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-heading text-xl font-semibold text-white">What does your money really cost?</p>
        <p className="mt-1 text-white/85">Your Life Rate is the blended rate on everything you owe, not just your mortgage. See yours in 30 seconds.</p>
      </div>
      <Link href="/life-rate" className="shrink-0 rounded-full bg-white px-5 py-2.5 text-center font-semibold text-brand-ink hover:bg-mist">
        Calculate my Life Rate →
      </Link>
    </aside>
  );
}
