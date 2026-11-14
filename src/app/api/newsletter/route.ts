import { z } from "zod";
import { rateLimited } from "@/lib/chat/guard";
import { siteUrl } from "@/lib/site";

// The Advisory Report sign-up (Ace, Nov 2026): validates the email and consent, then hands the contact to Go High Level
// (Inbound Webhook workflow, GHL_NEWSLETTER_WEBHOOK_URL, server only), which tags it "newsletter". Only people who
// tick the consent box get the weekly email. No phone number is collected here.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  firstName: z.string().trim().max(60).default(""),
  consent: z.literal(true),
  lang: z.enum(["en", "es"]).default("en"),
  page: z.string().max(200).default(""),
  website: z.string().max(200).optional(), // hidden field: real people leave it empty
});

const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const ip = req.headers.get("x-real-ip")?.trim() || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`news:${ip}`)) return json({ error: "rate" }, 429);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "invalid" }, 400);
  const { email, firstName, lang, page, website } = parsed.data;
  if (website) return json({ ok: true });

  const hook = process.env.GHL_NEWSLETTER_WEBHOOK_URL;
  if (!hook) {
    console.info("newsletter sign-up not sent (GHL_NEWSLETTER_WEBHOOK_URL not set):", { lang, page });
    return json({ ok: true, test: true });
  }
  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        first_name: firstName,
        language: lang === "es" ? "Spanish" : "English",
        source: "Website: The Advisory Report sign-up",
        source_page: page.startsWith("/") ? `${siteUrl}${page}` : siteUrl,
        tags: ["newsletter", "website lead", lang === "es" ? "spanish" : "english"],
        consent: "Checked the box to receive The Advisory Report weekly email from The Mortgage Advisory, Inc.",
        submitted_at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`webhook HTTP ${res.status}`);
  } catch (err) {
    console.error("newsletter webhook failed", err instanceof Error ? err.message : err, { lang, page });
    return json({ error: "send" }, 502);
  }
  return json({ ok: true });
}
