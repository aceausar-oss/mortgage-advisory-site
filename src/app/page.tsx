import Link from "next/link";
import { licensing, stateCodes } from "@/lib/site";

// Placeholder homepage for Build Order step 1; the full homepage (§4) is step 3.
export default function Home() {
  return (
    <section className="bg-gradient-to-b from-mist to-white">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-20 text-center sm:px-6">
        <p className="inline-block rounded-full border border-brand-steel/40 bg-white px-4 py-1 text-sm font-medium text-brand-slate">
          Direct Lender · NMLS #{licensing.nmls} · Licensed in {stateCodes.join(", ")}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Get the right home loan, answered by a direct lender.
        </h1>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed">{licensing.entityStatement}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/book"
            className="rounded-full bg-brand-slate px-6 py-3 font-semibold text-white hover:bg-brand-ink"
          >
            Book a call with Ace
          </Link>
          <a
            href={`tel:${licensing.phoneE164}`}
            className="rounded-full border border-brand-slate px-6 py-3 font-semibold text-brand-slate hover:bg-white"
          >
            Call {licensing.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
