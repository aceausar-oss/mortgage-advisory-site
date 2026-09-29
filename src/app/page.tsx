import Image from "next/image";
import Link from "next/link";
import { Disclosures } from "@/components/Disclosures";
import { FaqTabs } from "@/components/FaqTabs";
import { BookingSection } from "@/components/home/BookingSection";
import { EquitySlider } from "@/components/home/EquitySlider";
import { FloatingCard } from "@/components/home/FloatingCard";
import { GoalCards } from "@/components/home/GoalCards";
import { HeroChat } from "@/components/home/HeroChat";
import { LicensedStatesMap } from "@/components/home/LicensedStatesMap";
import { QuestionFeed } from "@/components/home/QuestionFeed";
import { ReviewsCarousel } from "@/components/Reviews";
import { StatsBand } from "@/components/home/StatsBand";
import { StorySections } from "@/components/home/StorySections";
import { pricing, verifiedStats } from "@/lib/home";
import { categoryLabel } from "@/lib/categories";
import { getEntries } from "@/lib/kb";

export default function Home() {
  const entries = getEntries();
  const featured = entries.filter((e) => e.featured);

  return (
    <>
      {/* 4.1 Hero + 4.3 equity card share one continuous background (no seam between them). */}
      <div className="relative isolate overflow-hidden bg-mist">
        {/* "AI shimmer": slow-moving light-blue glow behind the hero (static when reduced motion is on). */}
        <div aria-hidden="true" className="ai-shimmer" />
        {/* Fade the glow to white at the bottom so it melts into the stories section with no edge. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-mist" />
        <section aria-label="Introduction">
          <div className="relative mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Tap your home equity and <em className="not-italic text-brand-blue-deep">keep</em> your low rate.
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
              Access cash with HELOCs, reverse mortgages, and home loans. Ask our AI mortgage assistant anything, and our team will take it from
              there.
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
          </div>
        </section>

        {/* Market reality in three numbers (sourced, content/data/stats.json): the big picture before "check yours". */}
        <StatsBand stats={verifiedStats} />

        {/* Amex-style photo cards by goal */}
        <GoalCards />

        {/* 4.3 Equity slider + licensed states */}
        <FloatingCard
          bare
          id="equity-heading"
          eyebrow="Your home equity"
          title={
            <>
              See what your home could <span className="text-brand-blue-deep">unlock</span>.
            </>
          }
          intro="Move the sliders for a quick estimate, then ask for your real numbers. We lend in California, Texas, Florida, and Colorado."
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <EquitySlider maxCLTV={pricing.maxCLTV} />
            <LicensedStatesMap />
          </div>
        </FloatingCard>
      </div>

      {/* 4.4 Stories, introduced Amex-style: wide home photo, icon, section title */}
      <section aria-labelledby="goals-heading" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl sm:aspect-[3/1]">
          <Image src="/images/pages/home-banner-photo.jpg" alt="Craftsman-style home with a stone porch and garden in warm evening light" fill sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover object-[50%_65%]" />
        </div>
        <div className="mt-8 flex flex-col items-center text-center">
          <span aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-xl bg-charcoal text-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
            </svg>
          </span>
          <h2 id="goals-heading" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            How we help
          </h2>
        </div>
        <div className="mt-10">
          <StorySections />
        </div>
      </section>

      {/* Real Google reviews */}
      <section aria-labelledby="reviews-heading" className="py-16">
        <ReviewsCarousel />
      </section>

      {/* 4.5 Tabbed Q&A */}
      <FloatingCard
        tone="blue"
        id="faq-heading"
        eyebrow="Common questions"
        title={
          <>
            Real questions, <span className="text-brand-blue-deep">plain-English answers</span>.
          </>
        }
        intro="Pick a topic. Every answer is reviewed by a licensed mortgage banker."
      >
        <FaqTabs entries={entries} idPrefix="home-faq" tiles="grey" />
      </FloatingCard>

      {/* 4.6 Booking */}
      <div id="booking" className="scroll-mt-16">
        <FloatingCard
          id="booking-heading"
          eyebrow="Talk to our team"
          title={
            <>
              Book a call with an <span className="text-brand-blue-deep">advisor</span>.
            </>
          }
          intro="Pick the topic that fits, choose a time, and talk it through, with no pressure and plain English."
        >
          <BookingSection />
        </FloatingCard>
      </div>

      <section aria-label="Disclosures" className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <Disclosures entry={{ category: "reverse-mortgage", products: ["hecm", "reverse-second", "heloc", "va", "fha"] }} debt />
      </section>
    </>
  );
}
