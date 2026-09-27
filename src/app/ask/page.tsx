import type { Metadata } from "next";
import Link from "next/link";
import { categoryLabel } from "@/lib/categories";
import { rankEntries } from "@/lib/kb";
import { licensing } from "@/lib/site";

// Destination for the hero question box, chips, and slider (until the AI chat arrives in Build Order step 4):
// shows the best-matching answers plus ways to reach Ace. Works with JavaScript disabled.
export const metadata: Metadata = {
  title: "Ask a Mortgage Question",
  description: "Get plain-English answers to your mortgage, HELOC, reverse mortgage, and home equity questions from a direct lender, NMLS #1549739.",
  alternates: { canonical: "/ask" },
  robots: { index: false, follow: true },
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 300) || "";

export default async function AskPage({ searchParams }: PageProps<"/ask">) {
  const sp = await searchParams;
  const city = one(sp.city);
  const money = (key: string) => {
    const n = Number(one(sp[key]).replace(/[^0-9]/g, ""));
    return n > 0 ? `$${n.toLocaleString("en-US")}` : "";
  };
  const goal = one(sp.goal);
  const product = one(sp.product);
  const details = [
    money("value") && `home value about ${money("value")}`,
    money("balance") && `mortgage balance ${money("balance")}`,
    money("cash") && `needs about ${money("cash")}`,
    product && `interested in a ${product}`,
  ].filter(Boolean);
  const q =
    one(sp.q) ||
    [[goal || "Home equity options", city && `in ${city}`].filter(Boolean).join(" "), details.length ? `${details.join(", ").replace(/^./, (c) => c.toUpperCase())}.` : ""]
      .filter(Boolean)
      .join(". ");
  const matches = q ? rankEntries(`${q} ${goal}`, 5) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <form action="/ask" method="get" role="search" className="flex gap-2 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-brand-steel/30">
        <label htmlFor="ask-q" className="sr-only">
          Your question
        </label>
        <input
          id="ask-q"
          name="q"
          defaultValue={q}
          placeholder="Ask anything about your mortgage or home equity…"
          className="flex-1 rounded-full px-4 py-2 text-lg"
        />
        <button type="submit" className="rounded-full bg-brand-button px-5 py-2 font-semibold text-white hover:bg-brand-slate">
          Ask
        </button>
      </form>

      {q && (
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-slate">Your question</p>
          <h1 className="text-2xl font-bold sm:text-3xl">{q}</h1>
        </header>
      )}

      {matches.length > 0 ? (
        <section aria-labelledby="matches" className="space-y-4">
          <h2 id="matches" className="text-xl font-semibold">
            Answers that may help
          </h2>
          <ul className="space-y-4">
            {matches.map((e) => (
              <li key={e.slug} className="rounded-2xl border-l-4 border-brand-blue-deep bg-gradient-to-r from-mist to-white p-5 shadow-sm ring-1 ring-brand-blue/30 transition hover:shadow-md">
                <p className="inline-block rounded-full bg-brand-blue/25 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-button">{categoryLabel(e.category)}</p>
                <h3 className="mt-1 text-lg font-semibold">
                  <Link href={`/answers/${e.slug}`} className="hover:underline">
                    {e.question}
                  </Link>
                </h3>
                <p className="mt-2 leading-relaxed">{e.tldr}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        q && <p className="rounded-2xl bg-mist p-5">That&apos;s a great question for Ace directly. Book a time below or give us a call.</p>
      )}

      <section aria-label="Talk to Ace" className="rounded-3xl bg-brand-slate p-6 text-white">
        <p className="font-heading text-xl font-semibold text-white">Want a straight answer for your situation?</p>
        <p className="mt-1 text-white/90">Ace and our team will walk you through your options with real numbers.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/book" className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
            Book a call with Ace
          </Link>
          <a href={`tel:${licensing.phoneE164}`} className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10">
            Call {licensing.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
