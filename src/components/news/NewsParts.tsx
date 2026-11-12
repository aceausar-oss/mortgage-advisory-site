import Image from "next/image";
import Link from "next/link";
import { eventSeries, nextSessions, scheduleText } from "@/lib/events";
import type { Lang } from "@/lib/i18n";
import { editionDate, type Edition } from "@/lib/news";
import { TREASURY_SOURCE_URL, formatYieldDate, getTreasuryYields } from "@/lib/treasury";

// Building blocks for The Advisory Report pages (/news, /news/[slug], and the Spanish twins).

export function StatsGrid({ stats, lang }: { stats: Edition["stats"]; lang: Lang }) {
  return (
    <section aria-labelledby="numbers-h" className="space-y-4">
      <h2 id="numbers-h" className="text-2xl font-semibold">
        {lang === "es" ? "La semana en números" : "This week in numbers"}
      </h2>
      <dl className="grid gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col rounded-2xl border border-brand-blue/40 bg-white p-5">
            <dt className="order-2 mt-1 font-semibold text-brand-slate">{s.label}</dt>
            <dd className="order-1 font-heading text-4xl font-bold tracking-tight text-brand-ink">{s.value}</dd>
            {s.detail && <dd className="order-3 mt-1 text-sm leading-relaxed text-brand-slate">{s.detail}</dd>}
            <dd className="order-4 mt-2 text-xs text-brand-slate">
              {lang === "es" ? "Fuente" : "Source"}:{" "}
              <a href={s.sourceUrl} rel="noopener" className="underline underline-offset-2">
                {s.source}
              </a>{" "}
              ({s.asOf})
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** 10-year Treasury close for the edition week and its change from a week earlier. Market data, not a mortgage rate. */
export async function TreasuryWeek({ asOf, lang }: { asOf: string; lang: Lang }) {
  const points = await getTreasuryYields();
  if (!points) return null;
  // Close on or before the edition date (or the latest close, if the edition is newer than the data).
  const upTo = points.filter((p) => p.date <= asOf);
  const now = upTo.at(-1) ?? points.at(-1)!;
  const weekAgoDate = new Date(`${now.date}T12:00:00Z`);
  weekAgoDate.setUTCDate(weekAgoDate.getUTCDate() - 7);
  const prev = points.filter((p) => p.date <= weekAgoDate.toISOString().slice(0, 10)).at(-1);
  const change = prev ? now.y10 - prev.y10 : null;
  const es = lang === "es";
  const dir = change === null ? "" : change > 0.005 ? (es ? "subió" : "up") : change < -0.005 ? (es ? "bajó" : "down") : es ? "sin cambio" : "flat";
  return (
    <aside aria-label={es ? "Bono del Tesoro a 10 años" : "10-year Treasury"} className="rounded-2xl bg-mist p-5 ring-1 ring-brand-blue/40">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-slate">{es ? "Bono del Tesoro a 10 años" : "10-year Treasury yield"}</p>
      <p className="mt-1 font-heading text-3xl font-bold text-brand-ink">
        {now.y10.toFixed(2)}%
        {change !== null && (
          <span className="ml-3 text-base font-semibold text-brand-slate">
            {dir} {Math.abs(change).toFixed(2)} {es ? "en la semana" : "on the week"}
          </span>
        )}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-brand-slate">
        {es
          ? "Las tasas hipotecarias tienden a moverse con este rendimiento, pero no son lo mismo. Es un dato del mercado, no una tasa hipotecaria."
          : "Mortgage rates tend to move with this yield, but they aren't the same thing. This is market data, not a mortgage rate."}{" "}
        {es ? "Cierre del" : "Close on"} {formatYieldDate(now.date)} ·{" "}
        <a href={TREASURY_SOURCE_URL} rel="noopener" className="underline underline-offset-2">
          {es ? "Departamento del Tesoro de EE. UU." : "U.S. Department of the Treasury"}
        </a>
      </p>
    </aside>
  );
}

const WEBINAR_COVER = "/images/events/hidden-pension-webinar.jpg";

export function EventsList({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const es = lang === "es";
  const main = eventSeries.find((s) => !s.area);
  const local = eventSeries.filter((s) => s.area);
  if (!main && !local.length) return null;
  const lead = main ?? local[0];
  const sessions = nextSessions(lead, lang, compact ? 2 : 4);
  return (
    <section aria-labelledby="events-h" className="rounded-3xl border border-brand-blue/50 bg-white p-6 sm:p-8">
      <div className={`grid items-center gap-8 ${compact ? "md:grid-cols-[1fr_11rem]" : "md:grid-cols-[1fr_15rem] lg:gap-12"}`}>
      {/* Webinar cover shown as a brochure (Ace, Nov 2026): slight 3D tilt, page shadow, and a badge. Links to Eventbrite. */}
      <a href={lead.url} rel="noopener" tabIndex={-1} aria-hidden="true" className={`group relative mx-auto block w-full pb-4 pr-4 md:order-last ${compact ? "max-w-[11rem]" : "max-w-[15rem]"}`}>
        <span className="block overflow-hidden rounded-r-lg rounded-l-sm bg-white shadow-[0_24px_40px_-18px_rgba(31,78,121,0.65)] ring-1 ring-black/5 transition-transform duration-500 [transform:perspective(900px)_rotateY(10deg)] group-hover:[transform:perspective(900px)_rotateY(3deg)]">
          <Image src={WEBINAR_COVER} alt="" width={1600} height={897} sizes="(min-width: 768px) 240px, 70vw" className="w-full" />
          <span className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/25 to-transparent" />
        </span>
        <span className="absolute bottom-0 right-0 flex h-[3.8rem] w-[3.8rem] flex-col items-center justify-center rounded-full bg-brand-button text-center font-heading text-[0.6rem] font-bold uppercase leading-tight tracking-wider text-white shadow-lg ring-4 ring-white">
          {es ? "En vivo" : "Free"}
          <br />
          {es ? "gratis" : "webinar"}
        </span>
      </a>
      <div>
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-blue-deep">{es ? "Próximos eventos · Seminario web gratuito" : "Upcoming events · Free webinar"}</p>
      <h2 id="events-h" className="mt-2 text-2xl font-bold">
        {es ? lead.titleEs : lead.title}
      </h2>
      <p className="mt-1 font-semibold text-brand-slate">{scheduleText(lead, lang)}</p>
      {lead.summary && <p className="mt-3 leading-relaxed">{es ? (lead.summaryEs ?? lead.summary) : lead.summary}</p>}
      {sessions.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={es ? "Próximas fechas" : "Next dates"}>
          {sessions.map((o) => (
            <li key={o.start}>
              <time dateTime={o.start} className="inline-flex rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-brand-ink">
                {o.label}
              </time>
            </li>
          ))}
        </ul>
      )}
      <a
        href={lead.url}
        rel="noopener"
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue"
      >
        {es ? "Reserve su lugar gratis en Eventbrite" : "Save your free seat on Eventbrite"} <span aria-hidden="true">→</span>
      </a>
      {!compact && local.length > 0 && (
        <div className="mt-6">
          <p className="font-semibold text-brand-slate">{es ? "O elija la sesión de su zona:" : "Or pick the session for your area:"}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {local.map((s) => (
              <li key={s.id}>
                <a href={s.url} rel="noopener" className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-brand-button ring-1 ring-brand-blue-deep/60 hover:bg-mist">
                  {es ? s.areaEs : s.area}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-5 text-xs leading-relaxed text-brand-slate">
        {es
          ? "Evento educativo, presentado en inglés; asistir no lo obliga a solicitar un préstamo. Este material no ha sido revisado, aprobado ni emitido por HUD, la FHA ni ninguna agencia del gobierno."
          : "Educational event; attending doesn't obligate you to apply for a loan. This material has not been reviewed, approved, or issued by HUD, FHA, or any government agency."}
      </p>
      </div>
      </div>
    </section>
  );
}

export function EditionCard({ e, lang, big = false }: { e: Edition; lang: Lang; big?: boolean }) {
  const href = `${lang === "es" ? "/es" : ""}/news/${e.slug}`;
  return (
    <article className={`rounded-3xl bg-white p-6 ring-1 ring-brand-steel/20 ${big ? "sm:p-8" : ""}`}>
      <p className="text-sm font-semibold text-brand-slate">
        <time dateTime={e.date}>{editionDate(e.date, lang)}</time>
        {e.isDraft && <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs">{lang === "es" ? "Borrador" : "Draft"}</span>}
      </p>
      <h3 className={`mt-2 font-bold leading-snug ${big ? "text-2xl sm:text-3xl" : "text-xl"}`}>
        <Link href={href} className="hover:underline">
          {e.title}
        </Link>
      </h3>
      <p className="mt-3 leading-relaxed text-brand-slate">{e.tldr}</p>
      {big && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {e.stats.slice(0, 3).map((s) => (
            <li key={s.label} className="rounded-2xl bg-mist p-4">
              <span className="block font-heading text-2xl font-bold text-brand-ink">{s.value}</span>
              <span className="text-sm text-brand-slate">{s.label}</span>
            </li>
          ))}
        </ul>
      )}
      <Link href={href} className="mt-4 inline-flex min-h-11 items-center font-semibold text-brand-button underline underline-offset-4">
        {lang === "es" ? "Leer la edición completa →" : "Read the full edition →"}
      </Link>
    </article>
  );
}
