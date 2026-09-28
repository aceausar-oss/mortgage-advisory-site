import Link from "next/link";
import data from "../../content/data/reviews.json";

// Real Google reviews (content/data/reviews.json), shown word for word. No AggregateRating schema:
// Google treats a business's own star markup as self-serving and ignores or penalizes it.
export type Review = { name: string; year: number; text: string; featured?: boolean };
export const reviewsData = data as { rating: number; count: number; googleUrl: string; reviews: Review[] };

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
      <Stars className="text-base" />
      <span className="sr-only">5 out of 5 stars</span>
      <blockquote className={`mt-2 flex-1 text-[0.95rem] leading-relaxed text-brand-ink ${compact ? "line-clamp-6" : ""}`}>“{review.text}”</blockquote>
      <figcaption className="mt-4 flex items-center gap-3 border-t border-brand-blue/30 pt-3">
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft font-heading font-bold text-brand-ink">
          {review.name.charAt(0).toUpperCase()}
        </span>
        <span className="text-sm">
          <span className="block font-semibold text-brand-ink">{review.name}</span>
          <span className="text-brand-slate">Google review · {review.year}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function ReviewsSummary() {
  return (
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
    </div>
  );
}

export const reviewsFootnote = "Real Google reviews, shown word for word. Everyone’s situation is different; your rate, costs, and timeline will vary.";

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
        <ReviewsSummary />
      </div>
      <div className="relative mt-8">
        <ul
          tabIndex={0}
          aria-label="Google reviews, scroll sideways for more"
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-px-4 px-4 pb-8 pt-3 [scrollbar-width:thin] sm:scroll-px-[max(1.5rem,calc((100vw-72rem)/2))] sm:px-[max(1.5rem,calc((100vw-72rem)/2))]"
        >
          {featured.map((r) => (
            <li key={r.name} className="w-[80%] shrink-0 snap-start sm:w-[calc((100vw-4.25rem)/2)] lg:w-[calc((min(100vw,72rem)-6.75rem)/4)]">
              <ReviewCard review={r} compact />
            </li>
          ))}
          <li className="flex w-[60%] shrink-0 snap-start items-center justify-center sm:w-56">
            <Link href="/reviews" className="rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue">
              See all {reviewsData.reviews.length} reviews →
            </Link>
          </li>
        </ul>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white sm:w-16" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white sm:w-16" />
      </div>
      <p className="px-4 text-center text-xs text-brand-slate">Swipe or scroll sideways for more. {reviewsFootnote}</p>
    </div>
  );
}
