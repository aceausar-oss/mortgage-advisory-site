import Link from "next/link";
import { consentedStories } from "@/lib/home";

// Story sections (CLAUDE.md §4.4). Educational copy until real client stories with written consent exist.
const GOALS = [
  {
    goal: "lower-payments",
    headline: "Want lower payments?",
    copy: "If your rate is higher than what's available today, or high-interest cards are eating your budget, there may be a way to lower what you pay each month, without touching a low first-mortgage rate you already have.",
    points: ["Refinance when the numbers actually work", "Consolidate high-interest debt with a HELOC or fixed second", "See every fee before you decide"],
    cta: { label: "Lower my payments", q: "How can I lower my monthly payments?" },
    related: { href: "/answers/homeowner-credit-card-debt-options", label: "Homeowner with credit card debt? Your options" },
    icon: "M4 17l6-6 4 4 6-8M14 7h6v6",
  },
  {
    goal: "first-home",
    headline: "Buying your first home?",
    copy: "FHA, VA, conventional, and down payment assistance programs in California, Texas, Florida, and Colorado. We'll help you find a payment you're comfortable with, not just the most you can borrow.",
    points: ["Pre-approval you can count on", "Down payment help in all four of our states", "Loan Estimates explained line by line"],
    cta: { label: "Get pre-approved", q: "I want to get pre-approved to buy my first home" },
    related: { href: "/answers/how-much-house-can-i-afford", label: "How much house can I afford?" },
    icon: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
  },
  {
    goal: "retirement-equity",
    headline: "Tapping equity in retirement?",
    copy: "In other countries, a reverse mortgage is called a housing pension: a way to use the money you've put into your home while you age in place. We offer FHA-insured reverse mortgages and reverse mortgage seconds that let you keep your current first mortgage.",
    points: ["Stay in your home", "No required monthly mortgage payment on the reverse mortgage", "Family welcome at every meeting"],
    cta: { label: "See reverse mortgage options", q: "Is a reverse mortgage right for me?" },
    related: { href: "/answers/is-a-reverse-mortgage-a-scam", label: "Is a reverse mortgage a scam?" },
    icon: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z",
  },
  {
    goal: "self-employed",
    headline: "Self-employed?",
    copy: "Great business, big write-offs, and a tax return that doesn't show what you really earn? Bank statement, 1099, and P&L loan programs look at your actual cash flow instead.",
    points: ["Qualify with bank statements", "Programs for 1099 and gig income", "Clear answers on what documents you need"],
    cta: { label: "Qualify with bank statements", q: "Can I get a mortgage if I'm self-employed?" },
    related: null,
    icon: "M4 7h16v12H4zM9 7V5h6v2M4 12h16",
  },
];

export function StorySections() {
  const stories = consentedStories();
  return (
    <div className="space-y-16">
      {GOALS.map((g, i) => {
        const story = stories.find((s) => s.goal === g.goal);
        return (
          <section key={g.goal} aria-labelledby={`story-${g.goal}`} className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className={i % 2 === 1 ? "md:order-2" : undefined}>
              <h3 id={`story-${g.goal}`} className="text-2xl font-bold sm:text-3xl">
                {g.headline}
              </h3>
              <p className="mt-3 text-lg leading-relaxed">{g.copy}</p>
              {story && (
                <blockquote className="mt-4 rounded-2xl border-l-4 border-brand-blue bg-mist p-4">
                  <p className="font-semibold text-brand-slate">{story.title}</p>
                  <p className="mt-1 leading-relaxed">{story.body}</p>
                </blockquote>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link
                  href={`/ask?q=${encodeURIComponent(g.cta.q)}`}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-slate py-2.5 pl-3 pr-5 font-semibold text-white hover:bg-brand-ink"
                >
                  <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={g.icon} />
                    </svg>
                  </span>
                  {g.cta.label}
                  <span aria-hidden="true">→</span>
                </Link>
                {g.related && (
                  <Link href={g.related.href} className="text-sm font-semibold text-brand-slate underline underline-offset-4">
                    {g.related.label}
                  </Link>
                )}
              </div>
            </div>
            <div className={`rounded-3xl bg-gradient-to-br from-mist to-white p-8 shadow-sm ring-1 ring-brand-steel/20 ${i % 2 === 1 ? "md:order-1" : ""}`}>
              <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue text-white">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={g.icon} />
                </svg>
              </span>
              <ul className="mt-6 space-y-3">
                {g.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-brand-slate">
                    <span aria-hidden="true" className="mt-1 text-brand-blue-deep">
                      ✓
                    </span>
                    <span className="font-medium">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}
