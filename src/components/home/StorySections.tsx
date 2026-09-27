import Image from "next/image";
import Link from "next/link";
import { PillCta } from "@/components/PillCta";
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
    image: { src: "/images/heloc-couple.jpg", alt: "Couple at their kitchen table looking at a tablet together" },
    icon: "M4 17l6-6 4 4 6-8M14 7h6v6",
  },
  {
    goal: "first-home",
    headline: "Buying your first home?",
    copy: "FHA, VA, conventional, and down payment assistance programs in California, Texas, Florida, and Colorado. We'll help you find a payment you're comfortable with, not just the most you can borrow.",
    points: ["Pre-approval you can count on", "Down payment help in all four of our states", "Loan Estimates explained line by line"],
    cta: { label: "Get pre-approved", q: "I want to get pre-approved to buy my first home" },
    related: { href: "/answers/how-much-house-can-i-afford", label: "How much house can I afford?" },
    image: { src: "/images/first-home-family.jpg", alt: "Family holding the keys in front of their new home with a sold sign" },
    icon: "M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6",
  },
  {
    goal: "retirement-equity",
    headline: "Tapping equity in retirement?",
    copy: "In other countries, a reverse mortgage is called a housing pension: a way to use the money you've put into your home while you age in place. We offer FHA-insured reverse mortgages and reverse mortgage seconds that let you keep your current first mortgage.",
    points: ["Stay in your home", "No required monthly mortgage payment on the reverse mortgage", "Family welcome at every meeting"],
    cta: { label: "See reverse mortgage options", q: "Is a reverse mortgage right for me?" },
    related: { href: "/answers/is-a-reverse-mortgage-a-scam", label: "Is a reverse mortgage a scam?" },
    image: { src: "/images/retirement-couple.jpg", alt: "Smiling retired couple at home" },
    icon: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z",
  },
  {
    goal: "self-employed",
    headline: "Self-employed?",
    copy: "Great business, big write-offs, and a tax return that doesn't show what you really earn? Bank statement, 1099, and P&L loan programs look at your actual cash flow instead.",
    points: ["Qualify with bank statements", "Programs for 1099 and gig income", "Clear answers on what documents you need"],
    cta: { label: "Qualify with bank statements", q: "Can I get a mortgage if I'm self-employed?" },
    related: null,
    image: { src: "/images/self-employed-cafe.jpg", alt: "Small business owner smiling at her laptop in her cafe" },
    icon: "M4 7h16v12H4zM9 7V5h6v2M4 12h16",
  },
];

export function StorySections() {
  const stories = consentedStories();
  return (
    <div className="space-y-20">
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
                <PillCta href={`/ask?q=${encodeURIComponent(g.cta.q)}`} label={g.cta.label} icon={g.icon} />
                {g.related && (
                  <Link href={g.related.href} className="text-sm font-semibold text-brand-button underline underline-offset-4">
                    {g.related.label}
                  </Link>
                )}
              </div>
            </div>
            {"image" in g && g.image ? (
              // Illustrative photo only (not a client). Points float over the photo on larger screens.
              <div className={`relative ${i % 2 === 1 ? "md:order-1" : ""}`}>
                <Image
                  src={g.image.src}
                  alt={g.image.alt}
                  width={1200}
                  height={1200}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lg ring-1 ring-brand-steel/20"
                />
                {/* Desktop only: dark slate fade at the bottom of the photo so the white checklist stands out. */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/3 rounded-b-3xl bg-gradient-to-t from-brand-slate/90 via-brand-slate/55 to-transparent md:block" />
                <ul className="mt-4 space-y-2 rounded-2xl bg-white/95 p-5 shadow-lg ring-1 ring-brand-blue/40 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:rounded-none md:bg-transparent md:p-7 md:shadow-none md:ring-0">
                  {g.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-brand-ink md:text-white">
                      <span aria-hidden="true" className="mt-0.5 font-bold text-brand-button md:text-brand-blue">
                        ✓
                      </span>
                      <span className="font-semibold">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className={`rounded-3xl bg-gradient-to-br from-brand-blue/25 via-mist to-white p-8 shadow-md ring-1 ring-brand-blue/40 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue text-brand-ink shadow-md">
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
            )}
          </section>
        );
      })}
    </div>
  );
}
