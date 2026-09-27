import type { Metadata } from "next";
import { AnswerCta, Breadcrumbs } from "@/components/AnswerParts";
import { ReviewCard, ReviewsSummary, reviewsData, reviewsFootnote } from "@/components/Reviews";

export const metadata: Metadata = {
  title: "Client Reviews",
  description: `Rated ${reviewsData.rating.toFixed(1)} stars from ${reviewsData.count} Google reviews: what homeowners say about working with Ace Ausar and The Mortgage Advisory.`,
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-6">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { href: "/reviews", label: "Reviews" }]} />
      <header className="space-y-4 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">What do clients say about The Mortgage Advisory?</h1>
        <ReviewsSummary />
      </header>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviewsData.reviews.map((r) => (
          <li key={r.name}>
            <ReviewCard review={r} />
          </li>
        ))}
      </ul>
      <p className="text-center text-xs text-brand-slate">
        {reviewsFootnote} Reviews ending in “…” are cut short by Google; read the full text on Google.
      </p>
      <div className="mx-auto max-w-3xl">
        <AnswerCta />
      </div>
    </div>
  );
}
