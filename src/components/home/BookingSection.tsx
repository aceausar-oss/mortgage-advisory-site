import Link from "next/link";
import { bookingTypes } from "@/lib/home";
import { licensing } from "@/lib/site";

// "Book a call with an advisor" (CLAUDE.md §4.6) booking boxes; the heading lives in the homepage FloatingCard.
// Cards link to the Go High Level calendars; /book embeds them.
export function BookingSection() {
  return (
    <div className="space-y-8">
      <ul className="grid gap-5 md:grid-cols-3">
        {bookingTypes.map((b) => (
          <li key={b.key} className="flex flex-col rounded-xl border border-brand-blue bg-white p-6 shadow-[0_0_18px_rgba(136,180,224,0.55)]">
            <h3 className="text-xl font-semibold">{b.title}</h3>
            <p className="mt-2 flex-1 leading-relaxed">{b.blurb}</p>
            <Link
              href={`/book#${b.key}`}
              className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue"
            >
              Pick a time <span aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-center text-brand-slate">
        Prefer to talk now? Call{" "}
        <a href={`tel:${licensing.phoneE164}`} className="whitespace-nowrap font-semibold underline underline-offset-4">
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
