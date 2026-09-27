import Link from "next/link";
import { bookingTypes } from "@/lib/home";
import { licensing } from "@/lib/site";

// "Book a call with Ace" (CLAUDE.md §4.6). Cards link to the Go High Level calendars; /book embeds them.
export function BookingSection() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Book a call with Ace</h2>
        <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed">
          Pick the topic that fits, choose a time, and talk it through, with no pressure and plain English.
        </p>
      </div>
      <ul className="grid gap-5 md:grid-cols-3">
        {bookingTypes.map((b) => (
          <li key={b.key} className="flex flex-col rounded-3xl border border-brand-steel/30 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">{b.title}</h3>
            <p className="mt-2 flex-1 leading-relaxed">{b.blurb}</p>
            <Link
              href={`/book#${b.key}`}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand-slate px-5 py-2.5 font-semibold text-white hover:bg-brand-ink"
            >
              Pick a time <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-center text-brand-slate">
        Prefer to talk now? Call{" "}
        <a href={`tel:${licensing.phoneE164}`} className="font-semibold underline underline-offset-4">
          {licensing.phone}
        </a>{" "}
        or email{" "}
        <a href={`mailto:${licensing.email}`} className="font-semibold underline underline-offset-4">
          {licensing.email}
        </a>
        .
      </p>
    </div>
  );
}
