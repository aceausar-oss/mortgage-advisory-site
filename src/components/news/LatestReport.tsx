import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { NEWS_NAME, editionDate, latestEdition } from "@/lib/news";

// Homepage strip: the newest edition of The Advisory Report.
export function LatestReport({ lang = "en" }: { lang?: Lang }) {
  const e = latestEdition(lang);
  if (!e) return null;
  const es = lang === "es";
  const pre = es ? "/es" : "";
  return (
    <section aria-labelledby="latest-report-h" className="mx-auto max-w-[75rem] px-4 pb-12 sm:px-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 ring-1 ring-brand-steel/20 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-blue-deep">
            {NEWS_NAME} · <time dateTime={e.date}>{editionDate(e.date, lang)}</time>
          </p>
          <h2 id="latest-report-h" className="mt-2 text-2xl font-bold leading-snug">
            <Link href={`${pre}/news/${e.slug}`} className="hover:underline">
              {e.title}
            </Link>
          </h2>
          <p className="mt-2 leading-relaxed text-brand-slate">{e.tldr}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link href={`${pre}/news/${e.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-soft px-5 font-semibold text-brand-ink hover:bg-brand-blue">
            {es ? "Leer esta semana" : "Read this week's report"}
          </Link>
          <Link href={`${pre}/news`} className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-brand-button underline underline-offset-4">
            {es ? "Eventos y suscripción" : "Events & weekly email"}
          </Link>
        </div>
      </div>
    </section>
  );
}
