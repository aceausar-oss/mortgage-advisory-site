import Link from "next/link";
import type { ReactNode } from "react";
import { CarouselAutoplay } from "@/components/CarouselAutoplay";
import { CarouselDots } from "@/components/CarouselDots";
import data from "../../content/data/reviews.json";

// Real client reviews (content/data/reviews.json), shown word for word. No AggregateRating schema:
// Google treats a business's own star markup as self-serving and ignores or penalizes it.
// Each review names its source (Google by default; Yelp, Zillow, BBB, Facebook as they're added), and every
// source in `sources` gets a "Read on …" link so visitors can check the originals.
export type ReviewSource = "google" | "yelp" | "zillow" | "bbb" | "facebook";
export type Review = { name: string; year: number; text: string; featured?: boolean; source?: ReviewSource; url?: string };
type SourceInfo = { label: string; url: string; rating?: number; count?: number };
export const reviewsData = data as {
  rating: number;
  count: number;
  googleUrl: string;
  sources?: Partial<Record<ReviewSource, SourceInfo>>;
  reviews: Review[];
};
const SOURCE_LABEL: Record<ReviewSource, string> = { google: "Google", yelp: "Yelp", zillow: "Zillow", bbb: "BBB", facebook: "Facebook" };
// Small source badge in each card's corner (Ace, Nov 2026): tinted pill with a colored dot.
const SOURCE_BADGE: Record<ReviewSource, { pill: string; dot: string }> = {
  google: { pill: "bg-[#eef4fb] text-brand-blue-deep", dot: "bg-brand-blue-deep" },
  yelp: { pill: "bg-[#fdecec] text-[#b42020]", dot: "bg-[#d32323]" },
  zillow: { pill: "bg-[#e8f2fe] text-[#0b5bc4]", dot: "bg-[#006aff]" },
  bbb: { pill: "bg-[#e8f1f7] text-[#0a5a8a]", dot: "bg-[#015a8b]" },
  facebook: { pill: "bg-[#e9f0fd] text-[#1b5fd1]", dot: "bg-[#1877f2]" },
};
// Sources that actually have reviews shown on the site (for the "shown word for word" line).
const shownSources = [...new Set(reviewsData.reviews.map((r) => SOURCE_LABEL[r.source ?? "google"]))];
const otherSources = Object.entries(reviewsData.sources ?? {}).filter(([k]) => k !== "google") as [ReviewSource, SourceInfo][];

const Stars = ({ className = "" }: { className?: string }) => (
  <span className={`tracking-tight text-amber-500 ${className}`} aria-hidden="true">
    ★★★★★
  </span>
);

// Compact rectangular card with a soft blue glow. In the carousel (compact) long reviews are clipped to
// 6 lines; /reviews shows every review in full.
export function ReviewCard({ review, compact = false }: { review: Review; compact?: boolean }) {
  return (
    <figure className="flex h-full flex-col rounded-xl border border-brand-blue bg-white p-5 shadow-[0_0_18px_rgba(136,180,224,0.55)]">
      <div className="flex items-center justify-between gap-3">
        <Stars className="text-base" />
        <span className="sr-only">5 out of 5 stars</span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${SOURCE_BADGE[review.source ?? "google"].pill}`}>
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${SOURCE_BADGE[review.source ?? "google"].dot}`} />
          {SOURCE_LABEL[review.source ?? "google"]}
        </span>
      </div>
      <blockquote className={`mt-2 flex-1 text-[0.95rem] leading-relaxed text-brand-ink ${compact ? "line-clamp-6" : ""}`}>“{review.text}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-brand-blue/30 pt-3">
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft font-heading font-bold text-brand-ink">
          {review.name.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm">
          <span className="block font-semibold text-brand-ink">{review.name}</span>
          <span className="text-brand-slate">
            {SOURCE_LABEL[review.source ?? "google"]} review · {review.year}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

export function ReviewsSummary({ extra }: { extra?: ReactNode }) {
  return (
    <div>
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
      <p className="flex items-center gap-2 font-heading text-lg font-semibold text-brand-ink">
        {reviewsData.rating.toFixed(1)} <Stars className="text-xl" />
        <span className="sr-only">out of 5 stars</span>
        <span className="font-sans text-base font-normal text-brand-slate">· {reviewsData.count} Google reviews</span>
      </p>
      <a
        href={reviewsData.googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border-2 border-brand-blue bg-white px-4 py-1.5 text-sm font-semibold text-brand-button hover:border-brand-blue-deep"
      >
        Read all reviews on Google ↗
      </a>
      {extra}
    </div>
    {/* Other review sites: one quiet line, not more buttons (Ace, Nov 2026). */}
    {otherSources.length > 0 && (
      <p className="mt-3 text-center text-sm text-brand-slate">
        {otherSources.map(([key, src], i) => (
          <span key={key}>
            {i > 0 && " · "}
            Also rated{src.rating ? <> <b className="text-brand-ink">{src.rating.toFixed(1)}</b> <span className="text-amber-500" aria-hidden="true">★</span></> : null} on{" "}
            <a href={src.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-button underline decoration-brand-blue underline-offset-4 hover:text-brand-slate">
              {src.label}
              {src.count ? ` (${src.count} reviews)` : ""} ↗
            </a>
          </span>
        ))}
      </p>
    )}
    </div>
  );
}

export const reviewsFootnote = `Real ${shownSources.join(" and ")} reviews, shown word for word. Everyone’s situation is different; your rate, costs, and timeline will vary.`;

// Vora-style side-scrolling row. Native scroll with snap points: swipe, trackpad, or keyboard (it's focusable).
export function ReviewsCarousel() {
  const featured = reviewsData.reviews.filter((r) => r.featured);
  return (
    <div>
      <p className="text-center font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-button">What clients say</p>
      <h2 id="reviews-heading" className="mt-2 text-center font-heading text-3xl font-bold text-brand-ink sm:text-4xl">
        Real reviews from real homeowners
      </h2>
      <div className="mt-4">
        <ReviewsSummary extra={<CarouselAutoplay targetId="reviews-row" />} />
      </div>
      <div className="relative mt-8">
        <ul
          id="reviews-row"
          tabIndex={0}
          aria-label="Client reviews, scroll sideways for more"
          className="relative flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-px-4 px-4 pb-6 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:scroll-px-[max(1.5rem,calc((100vw-72rem)/2))] sm:px-[max(1.5rem,calc((100vw-72rem)/2))]"
        >
          {featured.map((r) => (
            <li key={`${r.source ?? "google"}-${r.name}`} className="w-[calc(100vw-2rem)] shrink-0 snap-center sm:w-[calc((100vw-4.25rem)/2)] sm:snap-start lg:w-[calc((min(100vw,72rem)-6.75rem)/4)]">
              <ReviewCard review={r} compact />
            </li>
          ))}
          <li className="flex w-[calc(100vw-2rem)] shrink-0 snap-center items-center justify-center sm:w-56 sm:snap-start">
            <Link href="/reviews" className="rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue">
              See all {reviewsData.reviews.length} reviews →
            </Link>
          </li>
        </ul>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-mist sm:block" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-mist sm:block" />
      </div>
      <div className="mb-4">
        <CarouselDots targetId="reviews-row" />
      </div>
      <p className="px-4 text-center text-xs text-brand-slate">Swipe or scroll sideways for more; the row pauses while you read. {reviewsFootnote}</p>
    </div>
  );
}
