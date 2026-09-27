import Link from "next/link";
import { Disclosures } from "@/components/Disclosures";
import { FaqTabs } from "@/components/FaqTabs";
import { BookingSection } from "@/components/home/BookingSection";
import { EquitySlider } from "@/components/home/EquitySlider";
import { HeroChat } from "@/components/home/HeroChat";
import { LicensedStatesMap } from "@/components/home/LicensedStatesMap";
import { QuestionFeed } from "@/components/home/QuestionFeed";
import { StorySections } from "@/components/home/StorySections";
import { pricing, verifiedStats } from "@/lib/home";
import { categoryLabel } from "@/lib/categories";
import { getEntries } from "@/lib/kb";
import { licensing, stateCodes } from "@/lib/site";

export default function Home() {
  const entries = getEntries();
  const featured = entries.filter((e) => e.featured);
  const stat = verifiedStats[0];

  return (
    <>
      {/* 4.1 Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mist via-mist to-white">
        <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
          <p className="inline-block rounded-full border border-brand-steel/40 bg-white px-4 py-1 text-sm font-medium text-brand-slate">
            Direct Lender · NMLS #{licensing.nmls} · Licensed in {stateCodes.join(", ")}
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Tap your home equity and <em className="not-italic text-brand-blue-deep">keep</em> your low rate.
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
            HELOCs, reverse mortgages, and home loans from a direct lender licensed in California, Texas, Florida, and Colorado. Ask our AI
            mortgage assistant anything, and Ace and our team take it from there.
          </p>
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-slate shadow-sm ring-1 ring-brand-steel/20">
            <span aria-hidden="true">⚡</span> HELOCs can close in as little as 5 days*
          </p>
          <div className="pt-4">
            <HeroChat examples={featured.map((e) => e.question)} />
          </div>
          {/* 4.2 Questions people are asking */}
          {featured.length > 0 && (
            <div className="pt-6">
              <h2 className="sr-only">Questions people are asking</h2>
              <QuestionFeed items={featured.map((e) => ({ question: e.question, slug: e.slug, topic: categoryLabel(e.category) }))} />
              <p className="mt-4">
                <Link href="/answers" className="text-sm font-semibold text-brand-slate underline underline-offset-4">
                  See all answers →
                </Link>
              </p>
            </div>
          )}
          <p className="mx-auto max-w-2xl text-xs leading-relaxed text-brand-slate">
            *Based on select HELOC programs. Timing varies with your application, property, and approval, and isn&apos;t guaranteed.
          </p>
          {stat && (
            <p className="mx-auto inline-flex flex-col items-center rounded-2xl bg-white px-5 py-3 text-sm shadow-sm ring-1 ring-brand-steel/20">
              <span className="font-heading text-2xl font-bold text-brand-slate">{stat.value}</span>
              <span>{stat.label}</span>
              <span className="mt-1 text-xs">
                Source:{" "}
                <a href={stat.sourceUrl} rel="noopener" className="underline">
                  {stat.source}
                </a>{" "}
                ({stat.asOf})
              </span>
            </p>
          )}
        </div>
      </section>

      {/* 4.3 Equity slider + licensed states */}
      <section aria-labelledby="equity-heading" className="bg-mist">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 id="equity-heading" className="sr-only">
              Estimate your home equity
            </h2>
            <EquitySlider maxCLTV={pricing.maxCLTV} />
            <form action="/ask" method="get" className="mt-8 grid gap-2 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-brand-steel/20 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="sr-only" htmlFor="ask-city">
                City
              </label>
              <input id="ask-city" name="city" placeholder="City" className="rounded-full px-4 py-2" />
              <label className="sr-only" htmlFor="ask-value">
                Home value
              </label>
              <input id="ask-value" name="value" inputMode="numeric" placeholder="Home value" className="rounded-full px-4 py-2" />
              <label className="sr-only" htmlFor="ask-goal">
                Loan goal
              </label>
              <select id="ask-goal" name="goal" defaultValue="" className="rounded-full px-4 py-2">
                <option value="" disabled>
                  Loan goal
                </option>
                <option>Get cash and keep my rate</option>
                <option>Pay off debt</option>
                <option>Reverse mortgage</option>
                <option>Buy a home</option>
                <option>Lower my payment</option>
              </select>
              <button type="submit" className="rounded-full bg-brand-slate px-5 py-2 font-semibold text-white hover:bg-brand-ink">
                Ask
              </button>
            </form>
          </div>
          <LicensedStatesMap />
        </div>
      </section>

      {/* 4.4 Stories */}
      <section aria-labelledby="goals-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="goals-heading" className="sr-only">
          How we help
        </h2>
        <StorySections />
      </section>

      {/* 4.5 Tabbed Q&A */}
      <section aria-labelledby="faq-heading" className="bg-mist">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 id="faq-heading" className="mb-8 text-center text-3xl font-bold sm:text-4xl">
            Answers to common questions
          </h2>
          <FaqTabs entries={entries} idPrefix="home-faq" />
        </div>
      </section>

      {/* 4.6 Booking */}
      <section aria-labelledby="booking" id="booking" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <BookingSection />
      </section>

      <section aria-label="Disclosures" className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <Disclosures entry={{ category: "reverse-mortgage", products: ["hecm", "reverse-second", "heloc", "va", "fha"] }} debt />
      </section>
    </>
  );
}
