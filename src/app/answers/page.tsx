import type { Metadata } from "next";
import Link from "next/link";
import { FaqTabs } from "@/components/FaqTabs";
import { CATEGORIES, categoryLabel, type CategoryKey } from "@/lib/categories";
import { getEntries, searchEntries } from "@/lib/kb";
import { licensing } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mortgage Questions Answered",
  description:
    "Plain-English answers to real borrower questions about buying, refinancing, HELOCs, reverse mortgages, VA and FHA loans from a direct lender (NMLS #1549739).",
  alternates: { canonical: "/answers" },
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export default async function AnswersPage({ searchParams }: PageProps<"/answers">) {
  const sp = await searchParams;
  const q = one(sp.q);
  const category = CATEGORIES.some((c) => c.key === one(sp.category)) ? one(sp.category) : undefined;
  const state = ["CA", "TX", "FL", "CO"].includes(one(sp.state) ?? "") ? one(sp.state) : undefined;
  const filtering = Boolean(q || category || state);
  const results = filtering ? searchEntries({ q, category, state }) : getEntries();

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Mortgage questions, answered</h1>
        <p className="text-lg leading-relaxed">
          Real questions borrowers ask, answered in plain English by {licensing.brandName}, a direct mortgage lender licensed in
          California, Texas, Florida, and Colorado (NMLS #{licensing.nmls}).
        </p>
      </header>

      {/* Plain GET form: works without JavaScript and gives each search a shareable URL. */}
      <form action="/answers" method="get" role="search" className="grid gap-3 rounded-2xl bg-mist p-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="sr-only" htmlFor="q">
          Search questions
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search, e.g. HELOC, reverse mortgage, VA"
          className="rounded-full border border-brand-steel/60 bg-white px-4 py-2"
        />
        <label className="sr-only" htmlFor="category">
          Topic
        </label>
        <select id="category" name="category" defaultValue={category ?? ""} className="rounded-full border border-brand-steel/60 bg-white px-4 py-2">
          <option value="">All topics</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="state">
          State
        </label>
        <select id="state" name="state" defaultValue={state ?? ""} className="rounded-full border border-brand-steel/60 bg-white px-4 py-2">
          <option value="">All states</option>
          {licensing.states.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-brand-button px-5 py-2 font-semibold text-white hover:bg-brand-slate">
          Search
        </button>
      </form>

      {filtering ? (
        <section aria-labelledby="results-heading" className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="results-heading" className="text-xl font-semibold">
              {results.length} {results.length === 1 ? "answer" : "answers"}
              {category ? ` in ${categoryLabel(category as CategoryKey)}` : ""}
              {state ? ` for ${state}` : ""}
            </h2>
            <Link href="/answers" className="text-sm underline underline-offset-4">
              Clear search
            </Link>
          </div>
          {results.length === 0 ? (
            <p className="rounded-2xl bg-mist p-5">
              No answers match yet. Ask Ace directly —{" "}
              <Link href="/book" className="font-semibold underline underline-offset-4">
                book a call
              </Link>{" "}
              or call{" "}
              <a href={`tel:${licensing.phoneE164}`} className="font-semibold underline underline-offset-4">
                {licensing.phone}
              </a>
              .
            </p>
          ) : (
            <ul className="space-y-4">
              {results.map((e) => (
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
          )}
        </section>
      ) : (
        <FaqTabs entries={results} />
      )}
    </div>
  );
}
