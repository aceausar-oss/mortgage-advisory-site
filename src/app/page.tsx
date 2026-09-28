import Link from "next/link";
import { Disclosures } from "@/components/Disclosures";
import { FaqTabs } from "@/components/FaqTabs";
import { BookingSection } from "@/components/home/BookingSection";
import { EquitySlider } from "@/components/home/EquitySlider";
import { FloatingCard } from "@/components/home/FloatingCard";
import { HeroChat } from "@/components/home/HeroChat";
import { LicensedStatesMap } from "@/components/home/LicensedStatesMap";
import { QuestionFeed } from "@/components/home/QuestionFeed";
import { ReviewsCarousel } from "@/components/Reviews";
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
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-mist via-mist to-white">
        {/* "AI shimmer": slow-moving light-blue glow behind the hero (static when reduced motion is on). */}
        <div aria-hidden="true" className="ai-shimmer" />
        <div className="relative mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
          <p className="inline-block rounded-full border border-brand-steel/40 bg-white px-4 py-1 text-sm font-medium text-brand-slate">
            Direct Lender & Broker · NMLS #{licensing.nmls} · Licensed in {stateCodes.join(", ")}
          </p>
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
      <FloatingCard
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

      {/* 4.4 Stories */}
      <section aria-labelledby="goals-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="goals-heading" className="sr-only">
          How we help
        </h2>
        <StorySections />
      </section>

      {/* Real Google reviews */}
      <section aria-labelledby="reviews-heading" className="bg-white py-16">
        <ReviewsCarousel />
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
      <div id="booking" className="scroll-mt-16">
        <FloatingCard
          id="booking-heading"
          eyebrow="Talk to Ace"
          title={
            <>
              Book a call with <span className="text-brand-blue-deep">Ace</span>.
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
