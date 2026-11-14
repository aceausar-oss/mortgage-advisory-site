import data from "../../content/data/events.json";
import type { Lang } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

// Upcoming events (Ace, Nov 2026): free live webinars sold through Eventbrite, listed on /news with Event schema so
// Google and AI assistants can show them. Dates are worked out from each series' weekly schedule, so the list stays
// current on its own (the /news pages refresh daily).
export type EventSeries = {
  id: string;
  title: string;
  titleEs: string;
  area: string;
  areaEs: string;
  url: string;
  days: number[];
  time: string; // "HH:MM", Pacific
  durationMin: number;
  language: string;
  summary?: string;
  summaryEs?: string;
};
export type Occurrence = { start: string; end: string; label: string };

const TZ = "America/Los_Angeles";
const DAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const eventSeries: EventSeries[] = data.series;

/** "-08:00" or "-07:00" for a Pacific calendar date. */
function pacificOffset(ymd: string) {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" })
    .formatToParts(new Date(`${ymd}T20:00:00Z`))
    .find((p) => p.type === "timeZoneName")?.value;
  return name?.replace("GMT", "") || "-08:00";
}

function pacificToday(now: Date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now).map((x) => [x.type, x.value]));
  return { ymd: `${p.year}-${p.month}-${p.day}`, minutes: Number(p.hour) * 60 + Number(p.minute) };
}

/** The next `count` sessions of a series, starting today (Pacific). */
export function nextSessions(s: EventSeries, lang: Lang, count = 4, now = new Date()): Occurrence[] {
  const today = pacificToday(now);
  const [h, m] = s.time.split(":").map(Number);
  const out: Occurrence[] = [];
  for (let i = 0; i < 21 && out.length < count; i++) {
    const d = new Date(`${today.ymd}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    if (!s.days.includes(d.getUTCDay())) continue;
    if (i === 0 && today.minutes >= h * 60 + m) continue; // today's session already started
    const ymd = d.toISOString().slice(0, 10);
    const off = pacificOffset(ymd);
    const start = `${ymd}T${s.time}:00${off}`;
    const endMin = h * 60 + m + s.durationMin;
    const end = `${ymd}T${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}:00${off}`;
    const label = new Date(start).toLocaleString(lang === "es" ? "es-US" : "en-US", { timeZone: TZ, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    out.push({ start, end, label: `${label} PT` });
  }
  return out;
}

export const scheduleText = (s: EventSeries, lang: Lang) => {
  const [h, m] = s.time.split(":").map(Number);
  const time = `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"} PT`;
  const es = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const days = s.days.map((d) => (lang === "es" ? es[d] : DAY_EN[d].slice(0, 3))).join(lang === "es" ? " y " : " & ");
  return lang === "es" ? `${days}, ${time} · ${s.durationMin} min · en línea, gratis` : `${days}, ${time} · ${s.durationMin} min · online, free`;
};

/** Event JSON-LD: one Event per Eventbrite page, with its next session and the weekly schedule. */
export function eventsJsonLd(lang: Lang = "en") {
  return eventSeries.flatMap((s) => {
    const next = nextSessions(s, lang, 1)[0];
    if (!next) return [];
    const [h, m] = s.time.split(":").map(Number);
    const endMin = h * 60 + m + s.durationMin;
    return [
      {
        "@type": "Event",
        "@id": `${siteUrl}/news#event-${s.id}`,
        name: s.title,
        description:
          s.summary ??
          `Free 45-minute live webinar for ${s.area} homeowners 62 and older: how a reverse mortgage (HECM) works, what it costs, and who it fits, with mortgage banker Ace Ausar.`,
        startDate: next.start,
        endDate: next.end,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: { "@type": "VirtualLocation", url: s.url },
        isAccessibleForFree: true,
        inLanguage: "en-US",
        offers: { "@type": "Offer", price: 0, priceCurrency: "USD", availability: "https://schema.org/InStock", url: s.url },
        eventSchedule: {
          "@type": "Schedule",
          repeatFrequency: "P1W",
          byDay: s.days.map((d) => `https://schema.org/${DAY_EN[d]}`),
          startTime: `${s.time}:00`,
          endTime: `${String(Math.floor(endMin / 60)).padStart(2, "0")}:${String(endMin % 60).padStart(2, "0")}:00`,
          scheduleTimezone: TZ,
        },
        organizer: { "@id": `${siteUrl}/#organization` },
        performer: { "@id": `${siteUrl}/#ace-ausar` },
        ...(s.area && { audience: { "@type": "Audience", audienceType: `Homeowners 62+ in ${s.area}` } }),
      },
    ];
  });
}
